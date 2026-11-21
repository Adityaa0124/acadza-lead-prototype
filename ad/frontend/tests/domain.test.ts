import test from "node:test";
import assert from "node:assert/strict";
import { seed, execute, accessible, DomainError } from "../src/lib/domain";
import { isCalling } from "../src/lib/types";
test("1,000 leads distribute equally and overflow stays unassigned", () => {
  for (const scenario of ["balanced", "overflow"]) {
    const s = seed(scenario);
    const cap = scenario === "balanced" ? 100 : 80;
    for (const user of s.users.filter((u) => u.role === "caller"))
      assert.equal(s.leads.filter((l) => l.caller === user.id).length, cap);
    assert.equal(
      s.leads.filter((l) => !l.caller).length,
      scenario === "balanced" ? 0 : 200,
    );
  }
});
test("busy callback preserves interest and owner; handover removes calling eligibility", () => {
  const s = seed();
  const user = s.users.find((u) => u.id === "caller0")!;
  const l = s.leads.find(
    (l) => l.caller === user.id && l.stage === "INTERESTED",
  )!;
  const owner = l.caller;
  execute(s, user, {
    type: "outcome",
    id: l.id,
    version: l.version,
    outcome: "Call later",
    due: new Date(Date.now() + 86400000).toISOString(),
    note: "After work",
  });
  assert.equal(l.stage, "INTERESTED");
  assert.equal(l.caller, owner);
  assert.equal(l.requested, true);
  execute(s, user, {
    type: "outcome",
    id: l.id,
    version: l.version,
    outcome: "Ready for test",
  });
  assert.equal(l.stage, "READY_FOR_CBT");
  assert.equal(l.due, null);
  assert.equal(isCalling(l), false);
});
test("clerk callback notifies caller and preserves history", () => {
  const s = seed();
  const l = s.leads[0];
  const count = l.history.length;
  execute(s, s.users[0], {
    type: "callback",
    id: l.id,
    version: l.version,
    due: new Date(Date.now() + 86400000).toISOString(),
    note: "Parent called the desk",
  });
  assert.equal(l.history.length, count + 1);
  assert.equal(s.notices[0].user, l.caller);
});
test("stale version and cross-school access are rejected", () => {
  const s = seed(),
    l = s.leads[0];
  assert.throws(
    () =>
      execute(s, s.users[0], {
        type: "note",
        id: l.id,
        version: 0,
        note: "stale",
      }),
    (e: unknown) => e instanceof DomainError && e.status === 409,
  );
  const other = s.users.find((u) => u.id === "other")!;
  assert.equal(accessible(other, l), false);
  assert.throws(
    () =>
      execute(s, other, {
        type: "note",
        id: l.id,
        version: l.version,
        note: "cross-school",
      }),
    (e: unknown) => e instanceof DomainError && e.status === 404,
  );
});
test("direct test enquiry bypasses calls; sibling contact allowed", () => {
  const s = seed(),
    user = s.users[0];
  const result = execute(s, user, {
    type: "create",
    student: "Different child",
    parent: s.leads[0].parent,
    phone: s.leads[0].phone,
    grade: "9",
    source: "Walk-in",
    ready: true,
  }) as { id: string };
  const l = s.leads.find((x) => x.id === result.id)!;
  assert.equal(l.stage, "READY_FOR_CBT");
  assert.equal(l.caller, null);
  assert.equal(l.due, null);
});
test("clerks cannot record caller outcomes", () => {
  const s = seed();
  assert.throws(
    () =>
      execute(s, s.users[0], {
        type: "outcome",
        id: s.leads[0].id,
        version: 1,
        outcome: "Ready for test",
      }),
    (e: unknown) => e instanceof DomainError && e.status === 403,
  );
});
test("admissions manually reviews documents before confirming admission", () => {
  const s = seed();
  const user = s.users.find((u) => u.id === "admissions")!;
  const l = s.leads.find((x) => x.stage === "ADMISSION_IN_PROGRESS")!;

  assert.throws(
    () =>
      execute(s, user, {
        type: "convert",
        id: l.id,
        version: l.version,
        note: "Parent completed the required steps.",
      }),
    (e: unknown) => e instanceof DomainError && e.status === 400,
  );

  execute(s, user, {
    type: "documentReview",
    id: l.id,
    version: l.version,
    status: "VERIFIED",
    note: "Original ID and address proof reviewed at the front desk.",
  });
  assert.equal(l.documentStatus, "VERIFIED");
  assert.equal(l.nextAction, "Ready to confirm admission");

  execute(s, user, {
    type: "convert",
    id: l.id,
    version: l.version,
    note: "Documents accepted and school approval confirmed.",
  });
  assert.equal(l.stage, "CONVERTED");
});
