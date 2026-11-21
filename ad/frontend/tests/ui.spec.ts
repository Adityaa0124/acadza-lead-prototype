import { test, expect } from "@playwright/test";
import ExcelJS from "exceljs";
import path from "node:path";
const shots = path.resolve("../design-kit/screenshots");
test("small details: accessible dialogs, retained outcome, required note and touch targets", async ({
  page,
  request,
}) => {
  await request.post("/api/v1/demo", {
    data: { action: "reset", scenario: "small" },
  });
  await page
    .context()
    .addCookies([
      { name: "acadza-user", value: "caller0", url: "http://127.0.0.1:3000" },
    ]);
  await page.goto("/admissions/my-work");
  await page
    .getByRole("button", { name: "More outcomes", exact: true })
    .click();
  await page.getByLabel("Wrong number", { exact: true }).check();
  await page
    .getByRole("button", { name: "Fewer outcomes", exact: true })
    .click();
  await expect(page.getByLabel("Wrong number", { exact: true })).toBeChecked();
  await page
    .getByLabel("Reason for closing this enquiry")
    .selectOption("Other");
  await expect(
    page.getByLabel("Explain the reason (required)"),
  ).toHaveAttribute("required", "");
  await page.getByLabel("Call later", { exact: true }).focus();
  await page.keyboard.press("Space");
  const when = page.getByLabel("When should we call again?");
  await expect(when).toHaveAccessibleDescription(
    "School time · India Standard Time (IST)",
  );
  const trigger = page.getByRole("button", { name: "Demo", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "Demo controls",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() =>
        document.querySelector("dialog")?.contains(document.activeElement),
      ),
    ).toBeTruthy();
  }
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "Fail next save" }).click();
  await page.getByRole("button", { name: "Save and next" }).click();
  await expect(page.locator(".error-message")).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  for (const locator of [
    trigger,
    page.getByRole("button", { name: /Notifications,/ }),
    page.getByRole("button", { name: "Staff profile" }),
  ]) {
    const rect = await locator.boundingBox();
    expect(rect?.height).toBeGreaterThanOrEqual(44);
  }
});
test("transaction recovery, idempotency and test-to-admission progression", async ({
  request,
}) => {
  await request.post("/api/v1/demo", {
    data: { action: "reset", scenario: "small" },
  });
  await request.post("/api/v1/demo", {
    data: { action: "identity", user: "manager" },
  });
  const state = async () => await (await request.get("/api/v1/state")).json();
  const send = async (
    data: Record<string, unknown>,
    key = crypto.randomUUID(),
  ) =>
    request.post("/api/v1/commands", {
      headers: { "Idempotency-Key": key },
      data,
    });
  let s = await state();
  const l = s.leads.find((l: { stage: string }) => l.stage === "ENQUIRY");
  const key = crypto.randomUUID();
  const cmd = {
    type: "note",
    id: l.id,
    version: l.version,
    note: "Idempotent test note",
  };
  expect((await send(cmd, key)).ok()).toBeTruthy();
  expect((await send(cmd, key)).ok()).toBeTruthy();
  s = await state();
  let current = s.leads.find((x: { id: string }) => x.id === l.id);
  expect(
    current.history.filter(
      (a: { text: string }) => a.text === "Idempotent test note",
    ),
  ).toHaveLength(1);
  expect((await send({ ...cmd, note: "stale" })).status()).toBe(409);
  const version = current.version;
  expect(
    (
      await send({
        type: "outcome",
        id: l.id,
        version,
        outcome: "Call later",
        due: "invalid-date",
      })
    ).status(),
  ).toBe(400);
  current = (await state()).leads.find((x: { id: string }) => x.id === l.id);
  expect(current.version).toBe(version);
  expect(current.due).toBe(l.due);
  expect(
    (
      await send({
        type: "contact",
        id: l.id,
        version: current.version,
        parent: "Updated Guardian",
        phone: "9000033333",
        alternate: "",
      })
    ).ok(),
  ).toBeTruthy();
  s = await state();
  const completed = s.leads.find(
    (x: { stage: string }) => x.stage === "CBT_COMPLETED",
  );
  expect(
    (
      await send({
        type: "result",
        id: completed.id,
        version: completed.version,
        score: 80,
        max: 100,
        progress: true,
      })
    ).ok(),
  ).toBeTruthy();
  current = (await state()).leads.find(
    (x: { id: string }) => x.id === completed.id,
  );
  expect(current.stage).toBe("ADMISSION_IN_PROGRESS");
  expect(
    (
      await send({
        type: "convert",
        id: current.id,
        version: current.version,
        note: "School approval recorded for demo",
      })
    ).ok(),
  ).toBeTruthy();
  current = (await state()).leads.find(
    (x: { id: string }) => x.id === completed.id,
  );
  expect(current.stage).toBe("CONVERTED");
});
test("clerk to caller callback, failure recovery, role checks and responsive screens", async ({
  page,
  request,
}) => {
  await request.post("/api/v1/demo", {
    data: { action: "reset", scenario: "small" },
  });
  await page
    .context()
    .addCookies([
      { name: "acadza-user", value: "clerk", url: "http://127.0.0.1:3000" },
    ]);
  await page.goto("/admissions/leads");
  await expect(page.getByRole("heading", { name: "Enquiries" })).toBeVisible();
  await page.screenshot({
    path: shots + "/desktop/enquiries.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Add enquiry", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Add enquiry" }),
  ).toBeVisible();
  await page.screenshot({
    path: shots + "/desktop/add-enquiry.png",
    fullPage: true,
  });
  await page.getByLabel("Parent's phone number").fill("9000098765");
  await page.getByLabel("Parent / guardian name").fill("Demo Guardian");
  await page.getByLabel("Student's full name").fill("Demo Child");
  await page.getByLabel("Applying for grade").selectOption("9");
  await page.getByRole("button", { name: "Save enquiry", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Demo Child", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: shots + "/desktop/enquiry-detail.png",
    fullPage: true,
  });
  const state = await (await page.request.get("/api/v1/state")).json();
  const lead = state.leads.find(
    (l: { student: string }) => l.student === "Demo Child",
  );
  expect(lead.caller).toBeTruthy();
  await page
    .context()
    .addCookies([
      { name: "acadza-user", value: lead.caller, url: "http://127.0.0.1:3000" },
    ]);
  await page.goto("/admissions/my-work?lead=" + lead.id);
  await expect(
    page.getByRole("heading", { name: "Demo Guardian", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Call later", { exact: true }).check();
  await page
    .getByLabel("Anything the team should know?")
    .fill("Parent requested a call after work.");
  await page.getByRole("button", { name: "Demo", exact: true }).click();
  await page.getByRole("button", { name: "Fail next save" }).click();
  await page
    .getByRole("button", { name: "Save and next", exact: true })
    .click();
  await expect(page.locator(".error-message")).toContainText(
    "Your entries are still here",
  );
  await expect(page.getByLabel("Anything the team should know?")).toHaveValue(
    "Parent requested a call after work.",
  );
  await page.screenshot({
    path: shots + "/states/callback-save-failed.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved.");
  await page
    .context()
    .addCookies([
      { name: "acadza-user", value: "caller0", url: "http://127.0.0.1:3000" },
    ]);
  await page.goto("/admissions/my-work");
  await expect(page.getByRole("heading", { name: "My calls" })).toBeVisible();
  await page.screenshot({
    path: shots + "/desktop/caller-workspace.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: shots + "/mobile/caller-queue.png",
    fullPage: true,
  });
  await page.locator(".queue-record").first().click();
  await expect(
    page.getByRole("heading", { name: "What happened on the call?" }),
  ).toBeVisible();
  await page.screenshot({
    path: shots + "/mobile/caller-conversation.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .context()
    .addCookies([
      { name: "acadza-user", value: "manager", url: "http://127.0.0.1:3000" },
    ]);
  for (const [route, file, title] of [
    ["assignments", "assignments", "Assignments"],
    ["cbt", "entrance-tests", "Entrance tests"],
    ["admission-queue", "admissions", "Admissions"],
    ["reports", "reports", "Reports"],
    ["settings", "settings", "Team settings"],
    ["imports", "imports", "Imports"],
    ["imports/new", "upload", "Upload enquiry list"],
  ]) {
    await page.goto("/admissions/" + route);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: shots + "/desktop/" + file + ".png",
      fullPage: true,
    });
  }
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Enquiries");
  ws.addRow(["Student", "Parent", "Phone", "Grade", "Source"]);
  ws.addRow([
    "Imported Child",
    "Import Guardian",
    "9000043210",
    "9",
    "School event",
  ]);
  ws.addRow(["Invalid Child", "Guardian", "bad", "9", "School event"]);
  const buf = await wb.xlsx.writeBuffer();
  await page.getByLabel("Choose Excel workbook").setInputFiles({
    name: "test.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(buf),
  });
  await page.getByRole("button", { name: "Review file" }).click();
  await expect(
    page.getByRole("heading", { name: "Review before importing." }),
  ).toBeVisible();
  await page.screenshot({
    path: shots + "/desktop/import-review.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Import 1 enquiry" }).click();
  await expect(
    page.getByRole("heading", { name: "Your import is complete." }),
  ).toBeVisible();
  await page
    .context()
    .addCookies([
      { name: "acadza-user", value: "other", url: "http://127.0.0.1:3000" },
    ]);
  const other = await (await page.request.get("/api/v1/state")).json();
  expect(other.leads).toHaveLength(0);
  const denied = await page.request.post("/api/v1/commands", {
    headers: { "Idempotency-Key": "cross-school" },
    data: {
      type: "note",
      id: lead.id,
      version: lead.version,
      note: "not allowed",
    },
  });
  expect(denied.status()).toBe(404);
});
