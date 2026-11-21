import { randomUUID } from "node:crypto";
import {
  State,
  User,
  Lead,
  Command,
  Stage,
  isCalling,
  isClosed,
  grades,
  sources,
} from "./types";
export class DomainError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
const need = (value: unknown, message: string) => {
  if (!value) throw new DomainError(message);
};
export const clock = (s: State) =>
  new Date(Date.now() + s.offset).toISOString();
export function seed(scenario = "small"): State {
  const users: User[] = [
    {
      id: "clerk",
      name: "Ananya Shah",
      role: "clerk",
      school: "s1",
      capacity: 0,
      available: true,
    },
    {
      id: "manager",
      name: "Meera Rao",
      role: "manager",
      school: "s1",
      capacity: 0,
      available: true,
    },
    {
      id: "test",
      name: "Rohan Sen",
      role: "test",
      school: "s1",
      capacity: 0,
      available: true,
    },
    {
      id: "admissions",
      name: "Nisha Patel",
      role: "admissions",
      school: "s1",
      capacity: 0,
      available: true,
    },
    ...[
      "Priya Sharma",
      "Arjun Singh",
      "Neha Joshi",
      "Kabir Das",
      "Isha Nair",
      "Dev Shah",
      "Sara Khan",
      "Aman Roy",
      "Tara Jain",
      "Vikram Rao",
    ].map((name, i) => ({
      id: "caller" + i,
      name,
      role: "caller" as const,
      school: "s1",
      capacity: scenario === "overflow" ? 80 : 100,
      available: true,
    })),
    {
      id: "other",
      name: "Other school clerk",
      role: "clerk",
      school: "s2",
      capacity: 0,
      available: true,
    },
  ];
  const s: State = {
    users,
    leads: [],
    notices: [],
    batches: [],
    offset: 0,
    idempotency: {},
    cursor: 0,
  };
  const names = [
    "Aarav Mehta",
    "Anaya Kapoor",
    "Vihaan Singh",
    "Diya Nair",
    "Reyansh Joshi",
    "Myra Shah",
    "Ishaan Patel",
    "Saanvi Rao",
    "Kabir Verma",
    "Aadhya Jain",
    "Arjun Das",
    "Tara Menon",
  ];
  const parents = [
    "Kavita Mehta",
    "Rahul Kapoor",
    "Simran Singh",
    "Lakshmi Nair",
    "Ritu Joshi",
    "Nilesh Shah",
    "Maya Patel",
    "Prakash Rao",
    "Anita Verma",
    "Sonal Jain",
    "Rakesh Das",
    "Deepa Menon",
  ];
  const count = scenario === "small" ? 24 : 1000;
  for (let i = 0; i < count; i++) {
    const at = new Date(Date.now() - 86400000 * (1 + (i % 5))).toISOString();
    const l: Lead = {
      id: "ENQ-" + String(1001 + i),
      school: "s1",
      student: scenario === "small" ? names[i % 12] : `Demo student ${i + 1}`,
      parent: parents[i % 12],
      phone: "90000" + String(10000 + i),
      alternate: "",
      grade: String(8 + (i % 5)),
      source: sources[i % 5],
      cycle: "2027/28",
      stage: "ENQUIRY",
      caller: null,
      nextAction: "First call",
      due: null,
      requested: false,
      lastOutcome: "",
      created: at,
      updated: at,
      version: 1,
      history: [
        {
          id: randomUUID(),
          at,
          actor: "Ananya Shah",
          text: "Enquiry received at the front desk.",
        },
      ],
    };
    if (scenario === "small") {
      l.caller = "caller" + (i % 3);
      if (i < 12) {
        l.stage = i % 3 === 0 ? "INTERESTED" : "ENQUIRY";
        l.lastOutcome = i % 3 === 0 ? "Call later" : "";
        l.nextAction = i % 3 === 0 ? "Call parent" : "First call";
        l.due =
          i % 3 === 0
            ? new Date(Date.now() + (i === 0 ? -25 : 60) * 60000).toISOString()
            : null;
        l.requested = i % 3 === 0;
        if (l.requested)
          l.history.push({
            id: randomUUID(),
            at,
            actor: "Priya Sharma",
            text:
              "Parent is interested in Grade " +
              l.grade +
              ". Asked us to call after work to discuss the school visit.",
          });
      } else {
        const stages: Stage[] = [
          "READY_FOR_CBT",
          "CBT_SCHEDULED",
          "CBT_COMPLETED",
          "ADMISSION_IN_PROGRESS",
          "CONVERTED",
          "LOST",
        ];
        l.stage = stages[(i - 12) % 6];
        l.nextAction =
          l.stage === "READY_FOR_CBT"
            ? "Schedule entrance test"
            : l.stage === "ADMISSION_IN_PROGRESS"
              ? "Review admission documents"
              : l.stage === "CBT_COMPLETED"
                ? "Review test result"
                : "";
        if (l.stage === "CBT_SCHEDULED" || l.stage === "CBT_COMPLETED") {
          l.booking = {
            at: new Date(Date.now() + 86400000).toISOString(),
            test: "Grade " + l.grade + " entrance test",
            location: "School computer lab",
            attendance: l.stage === "CBT_COMPLETED" ? "attended" : "scheduled",
          };
          l.nextAction =
            l.stage === "CBT_COMPLETED"
              ? "Record result"
              : "Attend entrance test";
        }
        if (l.stage === "ADMISSION_IN_PROGRESS") {
          l.booking = {
            at: new Date(Date.now() - 86400000).toISOString(),
            test: "Grade " + l.grade + " entrance test",
            location: "School computer lab",
            attendance: "attended",
            score: 68 + (i % 20),
            max: 100,
          };
          l.documentStatus = "NOT_STARTED";
        }
        if (isClosed(l))
          l.closure =
            l.stage === "LOST" ? "Admitted elsewhere" : "Admission confirmed";
      }
    }
    s.leads.push(l);
    if (scenario !== "small") assign(s, l);
  }
  return s;
}
export function assign(s: State, l: Lead) {
  if (!isCalling(l) || l.caller) return;
  const counts = new Map(
    s.users.map((u) => [
      u.id,
      s.leads.filter(
        (x) => x.school === l.school && x.caller === u.id && isCalling(x),
      ).length,
    ]),
  );
  const pool = s.users.filter(
    (u) =>
      u.school === l.school &&
      u.role === "caller" &&
      u.available &&
      (counts.get(u.id) || 0) < u.capacity,
  );
  if (!pool.length) return;
  const min = Math.min(...pool.map((u) => counts.get(u.id) || 0));
  const tied = pool.filter((u) => counts.get(u.id) === min);
  l.caller = tied[s.cursor++ % tied.length].id;
}
export function accessible(user: User, l: Lead) {
  return (
    l.school === user.school &&
    (user.role !== "caller" || l.caller === user.id) &&
    (user.role !== "test" ||
      ["READY_FOR_CBT", "CBT_SCHEDULED", "CBT_COMPLETED"].includes(l.stage)) &&
    (user.role !== "admissions" ||
      ["ADMISSION_IN_PROGRESS", "CONVERTED"].includes(l.stage))
  );
}
function text(v: unknown, max = 2000) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function future(s: State, v: unknown) {
  const date = text(v);
  need(
    date && !Number.isNaN(Date.parse(date)),
    "Choose a valid date and time.",
  );
  need(Date.parse(date) > Date.parse(clock(s)), "Choose a time in the future.");
  return new Date(date).toISOString();
}
export function execute(s: State, user: User, c: Command): unknown {
  const now = clock(s);
  const manager = user.role === "manager";
  const allow = (roles: string[]) => {
    if (!roles.includes(user.role))
      throw new DomainError("You do not have permission for this action.", 403);
  };
  const log = (l: Lead, message: string) => {
    l.history.push({
      id: randomUUID(),
      at: now,
      actor: user.name,
      text: message,
    });
    l.updated = now;
    l.version++;
  };
  const notify = (l: Lead, message: string) => {
    s.notices.push({
      id: randomUUID(),
      user: l.caller || "manager",
      lead: l.id,
      text: message,
      at: now,
      read: false,
    });
  };
  if (c.type === "create") {
    allow(["clerk", "manager"]);
    const student = text(c.student, 100),
      parent = text(c.parent, 100),
      phone = text(c.phone).replace(/[\s()-]/g, ""),
      grade = text(c.grade),
      source = text(c.source);
    need(
      student &&
        parent &&
        /^\+?\d{10,15}$/.test(phone) &&
        grades.includes(grade) &&
        sources.includes(source),
      "Enter student, parent, a valid phone number, grade and source.",
    );
    const match = s.leads.find(
      (l) =>
        l.school === user.school &&
        l.phone === phone &&
        l.student.toLowerCase() === student.toLowerCase() &&
        l.cycle === "2027/28",
    );
    if (match && !text(c.duplicateReason))
      throw new DomainError(
        "This student already has an enquiry. Open it or explain why this is a separate application.",
        409,
      );
    const l: Lead = {
      id: "ENQ-" + randomUUID().slice(0, 8).toUpperCase(),
      school: user.school,
      student,
      parent,
      phone,
      alternate: text(c.alternate),
      grade,
      source,
      cycle: "2027/28",
      stage: c.ready ? "READY_FOR_CBT" : "ENQUIRY",
      caller: null,
      nextAction: c.ready ? "Schedule entrance test" : "First call",
      due: null,
      requested: false,
      lastOutcome: "",
      created: now,
      updated: now,
      version: 0,
      history: [],
    };
    s.leads.unshift(l);
    assign(s, l);
    log(
      l,
      `Enquiry created. ${text(c.note)} ${text(c.duplicateReason) ? "Separate application: " + text(c.duplicateReason) : ""}`.trim(),
    );
    return {
      id: l.id,
      message: c.ready
        ? "Saved. The test team can now schedule a test."
        : l.caller
          ? "Saved. Assigned to " +
            s.users.find((u) => u.id === l.caller)?.name +
            "."
          : "Saved. Waiting for an available caller.",
    };
  }
  if (c.type === "read-notices") {
    s.notices.filter((n) => n.user === user.id).forEach((n) => (n.read = true));
    return { message: "Notifications marked as read." };
  }
  if (c.type === "availability") {
    allow(["manager"]);
    const target = s.users.find(
      (u) =>
        u.id === c.target && u.school === user.school && u.role === "caller",
    );
    need(target, "Caller not found.");
    const cap = Number(c.capacity);
    need(
      Number.isInteger(cap) && cap >= 0 && cap <= 1000,
      "Capacity must be between 0 and 1,000.",
    );
    target!.capacity = cap;
    target!.available = Boolean(c.available);
    for (const l of s.leads) if (l.school === user.school) assign(s, l);
    return { message: "Caller availability updated." };
  }
  if (c.type === "assign") {
    allow(["manager"]);
    const target = s.users.find(
      (u) =>
        u.id === c.target &&
        u.school === user.school &&
        u.role === "caller" &&
        u.available,
    );
    need(target, "Choose an available caller.");
    need(text(c.reason), "Explain the reassignment.");
    const ids = Array.isArray(c.ids) ? c.ids : [];
    let count = 0;
    for (const id of ids) {
      const l = s.leads.find((x) => x.id === id && x.school === user.school);
      if (!l || !isCalling(l) || l.caller === target!.id) continue;
      const load = s.leads.filter(
        (x) => x.caller === target!.id && isCalling(x),
      ).length;
      if (load >= target!.capacity) continue;
      l.caller = target!.id;
      log(l, "Assigned to " + target!.name + ". " + text(c.reason));
      notify(l, "An enquiry was assigned to you.");
      count++;
    }
    return {
      message: `Assigned ${count} of ${ids.length} enquiries. Remaining records were unchanged or exceeded capacity.`,
    };
  }
  const l = s.leads.find((l) => l.id === c.id);
  if (!l || !accessible(user, l))
    throw new DomainError("This enquiry is not available.", 404);
  if (c.version !== l.version)
    throw new DomainError(
      "This enquiry changed while you were editing. Review the latest details before saving.",
      409,
    );
  if (c.type === "whatsapp") {
    allow(["clerk", "caller", "manager", "test", "admissions"]);
    log(l, "Opened a WhatsApp chat with the parent.");
    return { message: "WhatsApp chat opened." };
  }
  if (c.type === "contact") {
    allow(["clerk", "manager"]);
    const phone = text(c.phone).replace(/[\s()-]/g, "");
    const parent = text(c.parent, 100);
    const alternate = text(c.alternate).replace(/[\s()-]/g, "");
    need(
      parent && /^\+?\d{10,15}$/.test(phone),
      "Enter a guardian name and valid phone number.",
    );
    need(
      !alternate || /^\+?\d{10,15}$/.test(alternate),
      "Enter a valid alternate phone number or leave it empty.",
    );
    const previous = `${l.parent}, ${l.phone}${l.alternate ? ", " + l.alternate : ""}`;
    l.parent = parent;
    l.phone = phone;
    l.alternate = alternate;
    log(
      l,
      `Contact updated from ${previous} to ${parent}, ${phone}${alternate ? ", " + alternate : ""}.`,
    );
    return { message: "Contact details updated." };
  }
  if (c.type === "note") {
    need(text(c.note), "Write a note first.");
    log(l, text(c.note));
    return { message: "Internal note saved." };
  }
  if (c.type === "callback") {
    allow(["clerk", "caller", "manager"]);
    need(isCalling(l), "This enquiry is no longer in the calling queue.");
    const due = future(s, c.due);
    const old = l.due;
    l.due = due;
    l.nextAction = "Call parent";
    l.requested = true;
    log(
      l,
      `Callback ${old ? "rescheduled from " + old : "requested"} to ${due}. ${text(c.note)}`,
    );
    notify(l, "A callback was requested for " + l.student + ".");
    return { message: "Callback scheduled." };
  }
  if (c.type === "outcome") {
    allow(["caller", "manager"]);
    need(isCalling(l), "This enquiry is no longer in the calling queue.");
    const outcome = text(c.outcome);
    need(
      [
        "No answer",
        "Call later",
        "Interested",
        "Ready for test",
        "School visit requested",
        "Not interested",
        "Admitted elsewhere",
        "Wrong number",
      ].includes(outcome),
      "Choose what happened.",
    );
    if (
      [
        "No answer",
        "Call later",
        "Interested",
        "School visit requested",
      ].includes(outcome)
    ) {
      l.due = future(s, c.due);
      l.requested = outcome === "Call later";
      l.nextAction =
        outcome === "School visit requested" ? "School visit" : "Call parent";
      if (["Interested", "School visit requested"].includes(outcome))
        l.stage = "INTERESTED";
    } else if (outcome === "Ready for test") {
      l.stage = "READY_FOR_CBT";
      l.due = null;
      l.nextAction = "Schedule entrance test";
    } else {
      need(text(c.reason), "Select or enter a reason.");
      need(
        text(c.reason) !== "Other" || text(c.note),
        "Explain the reason in the note.",
      );
      l.stage = outcome === "Wrong number" ? "INVALID" : "LOST";
      l.closure = text(c.reason);
      l.due = null;
      l.nextAction = "";
    }
    l.lastOutcome = outcome;
    log(
      l,
      `${outcome}.${l.due ? " Next action: " + l.due + "." : ""} ${text(c.note)}${l.closure ? " Reason: " + l.closure : ""}`,
    );
    for (const other of s.leads)
      if (other.school === user.school) assign(s, other);
    return {
      message:
        outcome === "Ready for test"
          ? "Saved. Sent to the test team."
          : l.due
            ? "Saved. Next action scheduled."
            : "Outcome saved.",
    };
  }
  if (c.type === "handover") {
    allow(["clerk", "manager"]);
    need(isCalling(l), "This enquiry is already beyond the calling stage.");
    l.stage = "READY_FOR_CBT";
    l.due = null;
    l.nextAction = "Schedule entrance test";
    log(l, "Parent confirmed readiness. Sent directly to the test team.");
    return { message: "Sent to the test team." };
  }
  if (c.type === "book") {
    allow(["test", "manager"]);
    need(
      ["READY_FOR_CBT", "CBT_SCHEDULED"].includes(l.stage),
      "This student is not ready for scheduling.",
    );
    l.booking = {
      at: future(s, c.due),
      test: text(c.test) || "Grade " + l.grade + " entrance test",
      location: text(c.location) || "School computer lab",
      attendance: "scheduled",
    };
    l.stage = "CBT_SCHEDULED";
    l.nextAction = "Attend entrance test";
    log(
      l,
      "Entrance test scheduled for " +
        l.booking.at +
        " at " +
        l.booking.location +
        ".",
    );
    return { message: "Test scheduled." };
  }
  if (c.type === "attendance") {
    allow(["test", "manager"]);
    need(l.stage === "CBT_SCHEDULED" && l.booking, "No scheduled test exists.");
    if (c.attended) {
      l.stage = "CBT_COMPLETED";
      l.booking!.attendance = "attended";
      l.nextAction = "Record result";
    } else {
      l.stage = "READY_FOR_CBT";
      l.booking!.attendance = "no-show";
      l.nextAction = "Contact parent to reschedule";
    }
    log(
      l,
      c.attended
        ? "Student attended the test."
        : "Student missed the test. Follow up to reschedule.",
    );
    return { message: "Attendance recorded." };
  }
  if (c.type === "result") {
    allow(["test", "manager"]);
    need(
      l.stage === "CBT_COMPLETED" && l.booking,
      "Record attendance before the result.",
    );
    const score = Number(c.score),
      max = Number(c.max);
    need(
      Number.isFinite(score) &&
        Number.isFinite(max) &&
        score >= 0 &&
        max > 0 &&
        score <= max,
      "Enter a valid score and maximum.",
    );
    l.booking!.score = score;
    l.booking!.max = max;
    if (c.progress) {
      l.stage = "ADMISSION_IN_PROGRESS";
      l.nextAction = "Review admission documents";
      l.documentStatus = "NOT_STARTED";
    } else {
      l.nextAction = "Review admission decision";
    }
    log(
      l,
      `Test result ${score}/${max}. ${c.progress ? "Handed over to admissions." : "Decision pending."}`,
    );
    return { message: "Result recorded." };
  }
  if (c.type === "documentReview") {
    allow(["admissions", "manager"]);
    need(
      l.stage === "ADMISSION_IN_PROGRESS",
      "This enquiry is not in the admission queue.",
    );
    const status = text(c.status);
    need(
      ["NOT_STARTED", "RECEIVED", "VERIFIED", "NEEDS_RESUBMISSION"].includes(status || ""),
      "Choose a valid document-review status.",
    );
    const note = text(c.note);
    l.documentStatus = status as NonNullable<Lead["documentStatus"]>;
    l.documentNote = note;
    l.nextAction =
      status === "VERIFIED"
        ? "Ready to confirm admission"
        : status === "NEEDS_RESUBMISSION"
          ? "Request missing documents"
          : "Review admission documents";
    log(
      l,
      `Document review: ${status.replaceAll("_", " ").toLowerCase()}.${note ? " " + note : ""}`,
    );
    return { message: "Document review saved." };
  }
  if (c.type === "convert") {
    allow(["admissions", "manager"]);
    need(
      l.stage === "ADMISSION_IN_PROGRESS",
      "This enquiry is not in the admission queue.",
    );
    need(
      l.documentStatus === "VERIFIED",
      "Verify the admission documents before confirming admission.",
    );
    need(text(c.note), "Record what confirms admission completion.");
    l.stage = "CONVERTED";
    l.nextAction = "";
    l.due = null;
    l.closure = text(c.note);
    log(l, "Admission completed. " + text(c.note));
    return { message: "Admission completed." };
  }
  if (c.type === "reopen") {
    allow(["manager"]);
    need(isClosed(l), "Only closed enquiries can be reopened.");
    need(text(c.reason), "Explain why this enquiry is reopening.");
    l.stage = "ENQUIRY";
    l.caller = null;
    l.closure = undefined;
    l.nextAction = "Call parent";
    l.due = future(s, c.due);
    assign(s, l);
    log(l, "Enquiry reopened. " + text(c.reason));
    return { message: "Enquiry reopened." };
  }
  throw new DomainError("Unknown action.");
}
