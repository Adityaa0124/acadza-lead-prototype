import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { read, transaction } from "@/lib/store";
import {
  accessible,
  assign,
  clock,
  DomainError,
  execute,
  seed,
} from "@/lib/domain";
import { Command, ImportRow, State } from "@/lib/types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function actor(s: State, r: NextRequest) {
  const u = s.users.find(
    (x) => x.id === (r.cookies.get("acadza-user")?.value || "caller0"),
  );
  if (!u) throw new DomainError("Choose a demo identity.", 401);
  return u;
}
function failure(e: unknown) {
  return NextResponse.json(
    {
      error:
        e instanceof Error ? e.message : "Unable to complete this request.",
    },
    { status: e instanceof DomainError ? e.status : 500 },
  );
}
function demoEnabled() {
  return (
    process.env.NODE_ENV !== "production" || process.env.ACADZA_DEMO === "true"
  );
}
async function createExcelWorkbook() {
  const mod = await import("exceljs");
  const ExcelJS = (mod as { default?: { Workbook: typeof import("exceljs").Workbook } }).default || mod;
  return new ExcelJS.Workbook();
}

type Context = { params: Promise<{ path: string[] }> };
export async function GET(req: NextRequest, context: Context) {
  try {
    if (!demoEnabled())
      throw new DomainError(
        "This prototype requires ACADZA_DEMO=true. Production authentication is not implemented.",
        503,
      );
    const path = (await context.params).path.join("/");
    const s = read();
    const user = actor(s, req);
    if (path === "state")
      return NextResponse.json(
        {
          user,
          users: s.users.filter((x) => x.school === user.school),
          leads: s.leads.filter((l) => accessible(user, l)),
          notices: s.notices.filter((n) => n.user === user.id),
          batches: ["manager", "clerk"].includes(user.role)
            ? s.batches.filter((b) => b.school === user.school)
            : [],
          now: clock(s),
          demo: true,
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    if (path === "demo-users") return NextResponse.json(s.users);
    if (path === "template") {
      const wb = await createExcelWorkbook();
      const sheet = wb.addWorksheet("Enquiries");
      sheet.addRow(["Student", "Parent", "Phone", "Grade", "Source"]);
      sheet.addRow([
        "Example student",
        "Example guardian",
        "9000012345",
        "9",
        "School event",
      ]);
      sheet.columns.forEach((c) => (c.width = 24));
      const data = await wb.xlsx.writeBuffer();
      return new NextResponse(new Uint8Array(data), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="enquiry-template.xlsx"',
        },
      });
    }
    throw new DomainError("Not found.", 404);
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest, context: Context) {
  try {
    if (!demoEnabled()) throw new DomainError("Demo mode is disabled.", 503);
    const path = (await context.params).path.join("/");
    if (path === "demo") {
      const body = await req.json();
      if (body.action === "identity") {
        const s = read();
        if (!s.users.some((u) => u.id === body.user))
          throw new DomainError("Identity not found.");
        const res = NextResponse.json({ message: "Demo identity changed." });
        res.cookies.set("acadza-user", body.user, {
          httpOnly: true,
          sameSite: "strict",
          path: "/",
        });
        return res;
      }
      return NextResponse.json(
        transaction((s) => {
          if (body.action === "advance") {
            s.offset += Number(body.hours || 1) * 3600000;
            return { message: "Demo clock advanced." };
          }
          if (body.action === "reset") {
            const fresh = seed(
              ["small", "balanced", "overflow"].includes(body.scenario)
                ? body.scenario
                : "small",
            );
            Object.assign(s, fresh);
            return { message: "Demo scenario reset." };
          }
          throw new DomainError("Unknown demo action.");
        }),
      );
    }
    if (path === "commands") {
      const body = (await req.json()) as Command;
      const key = req.headers.get("Idempotency-Key");
      if (!key) throw new DomainError("A request identifier is required.");
      return NextResponse.json(
        transaction((s) => {
          const user = actor(s, req);
          const scope = user.id + ":" + key;
          const payload = JSON.stringify(body);
          const prior = s.idempotency[scope];
          if (prior) {
            if (prior.payload !== payload)
              throw new DomainError(
                "Request identifier was reused for different data.",
                409,
              );
            return prior.result;
          }
          const result = execute(s, user, body);
          for (const lead of s.leads)
            if (lead.school === user.school) assign(s, lead);
          s.idempotency[scope] = { payload, result };
          return result;
        }),
      );
    }
    if (path === "imports/preview") {
      const s = read(),
        user = actor(s, req);
      if (!["clerk", "manager"].includes(user.role))
        throw new DomainError("You cannot upload enquiries.", 403);
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".xlsx"))
        throw new DomainError(
          "Choose an .xlsx workbook. Download the template for the correct columns.",
        );
      if (file.size > 5 * 1024 * 1024)
        throw new DomainError("Choose a file smaller than 5 MB.");
      const wb = await createExcelWorkbook();
      await wb.xlsx.load(Buffer.from(await file.arrayBuffer()) as never);
      if (wb.worksheets.length !== 1)
        throw new DomainError(
          "Use one worksheet for this prototype. Copy your enquiries into the supplied template.",
        );
      const sheet = wb.worksheets[0];
      if (!sheet || sheet.rowCount < 2)
        throw new DomainError("The worksheet has no enquiry rows.");
      if (sheet.rowCount > 1001)
        throw new DomainError("Use at most 1,000 rows per upload.");
      const headers: Record<string, number> = {};
      sheet.getRow(1).eachCell((cell, col) => {
        headers[cell.text.trim().toLowerCase()] = col;
      });
      for (const key of ["student", "parent", "phone", "grade", "source"])
        if (!headers[key])
          throw new DomainError(
            "Missing column: " + key + ". Use the template headings.",
          );
      const rows: ImportRow[] = [];
      const seen = new Set<string>();
      for (let n = 2; n <= sheet.rowCount; n++) {
        const row = sheet.getRow(n);
        const get = (k: string) => row.getCell(headers[k]).text.trim();
        const item: ImportRow = {
          row: n,
          student: get("student"),
          parent: get("parent"),
          phone: get("phone").replace(/[\s()-]/g, ""),
          grade: get("grade"),
          source: get("source"),
          status: "ready",
        };
        if (
          !Object.values(item).some(
            (v) => typeof v === "string" && v && v !== "ready",
          )
        )
          continue;
        const probe = structuredClone(s);
        try {
          execute(probe, user, { type: "create", ...item });
        } catch (e) {
          item.error = e instanceof Error ? e.message : "Invalid row";
          item.status =
            e instanceof DomainError && e.status === 409
              ? "duplicate"
              : "invalid";
        }
        const match = s.leads.find(
          (l) => l.school === user.school && l.phone === item.phone,
        );
        const key = item.phone + ":" + item.student.toLowerCase();
        if ((match || seen.has(key)) && item.status !== "invalid") {
          item.status = "duplicate";
          item.duplicate = match?.id;
          item.error =
            "Possible existing enquiry or shared family contact. This row will be skipped; review and add separately if needed.";
        }
        seen.add(key);
        rows.push(item);
      }
      const batch = {
        id: "IMP-" + randomUUID().slice(0, 8),
        school: user.school,
        file: file.name,
        created: clock(s),
        actor: user.name,
        status: "review" as const,
        rows,
      };
      transaction((state) => {
        state.batches.unshift(batch);
      });
      return NextResponse.json(batch);
    }
    if (path === "imports/commit") {
      const body = await req.json();
      return NextResponse.json(
        transaction((s) => {
          const user = actor(s, req);
          if (!["clerk", "manager"].includes(user.role))
            throw new DomainError("Not permitted.", 403);
          const b = s.batches.find(
            (b) => b.id === body.id && b.school === user.school,
          );
          if (!b) throw new DomainError("Import not found.", 404);
          if (b.status === "complete")
            return { id: b.id, message: "This batch was already imported." };
          let count = 0;
          for (const row of b.rows) {
            if (row.status !== "ready") {
              row.status = "skipped";
              continue;
            }
            try {
              const result = execute(s, user, { type: "create", ...row }) as {
                id: string;
              };
              row.lead = result.id;
              row.status = "created";
              count++;
            } catch (e) {
              row.status = "skipped";
              row.error = e instanceof Error ? e.message : "Could not create";
            }
          }
          b.status = "complete";
          return {
            id: b.id,
            message: `Imported ${count} enquiries. ${b.rows.length - count} rows skipped.`,
          };
        }),
      );
    }
    throw new DomainError("Not found.", 404);
  } catch (e) {
    return failure(e);
  }
}
