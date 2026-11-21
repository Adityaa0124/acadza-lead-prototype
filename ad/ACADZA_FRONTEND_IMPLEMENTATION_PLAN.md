# Acadza admissions: frontend implementation and dummy backend specification

**Status:** Proposed implementation specification for frontend development and workflow testing.  
**Companion:** [Business workflow plan](./ACADZA_ADMISSIONS_LEAD_MANAGEMENT_PLAN.md).  
**Scope:** Build a working frontend prototype backed by a stateful dummy API. This document specifies the implementation; it does not claim that the application has been built.  
**Required frontend:** Next.js, confirmed by the user. TypeScript and the App Router are proposed implementation defaults; confirm compatibility with Acadza's existing repository.  
**Assumption:** Desktop is the main staff workspace. Support tablets and basic mobile use. Reuse Acadza's existing authentication and components when available.

## 1. What the prototype must prove

A reviewer should be able to act as a clerk, add a parent enquiry, switch to its assigned caller, record a requested callback, advance simulated time, complete the callback and hand the student to CBT. All views must reflect the same records.

A second scenario imports 1,000 synthetic enquiries, assigns them across 10 callers, exposes capacity overflow and supports manager reassignment. Additional scenarios cover direct CBT entry, lost leads, duplicate review, sibling records and failed saves.

Use synthetic parent/student details. Keep a visible Demo mode indicator and role switcher in the prototype. The switcher is a testing facility, not production authentication.

## 2. Architecture and integration boundary

Use this dependency direction:

`Page → query/mutation hook → typed API client → HTTP endpoint → dummy service → persistent store`

Components must never import seed data or modify storage directly. Assignment, queue eligibility, permissions and workflow transitions belong behind the API, including in the dummy implementation. This makes frontend behaviour realistic and lets a real backend replace the dummy service without rewriting screens.

Suggested implementation shape, subject to the existing repository:

- Next.js frontend with TypeScript as the proposed language.
- Next.js routing for pages and URL filters; use the App Router for a new project.
- Query cache for server records; form library and shared validation schemas for forms.
- Existing component library for tables, dialogs, drawers, inputs and notifications.
- Small local HTTP service with a persistent local database for the dummy backend.
- Spreadsheet parser inside the import service; add CSV support if useful, but do not call a CSV-only implementation Excel support.

Next.js is fixed for the frontend. Select its version and supporting query-cache, schema-validation and form packages after inspecting the repository. Keep the dummy API behind the typed HTTP client so it can be replaced independently of the Next.js screens. Backend technology is not fixed by this frontend decision.

Prefer a local persistent service over component-level mock arrays: separate tabs and role sessions need to observe the same state. A browser request-mocking layer can still simulate errors, but should not become a second competing source of data.

## 3. Suggested frontend file structure

```text
src/
  app/
    layout.tsx
    providers.tsx
    admissions/
      layout.tsx
      page.tsx
      leads/
        page.tsx
        new/page.tsx
        [id]/page.tsx
      my-work/page.tsx
      imports/
        page.tsx
        new/page.tsx
        [id]/page.tsx
      assignments/page.tsx
      cbt/page.tsx
      admission-queue/page.tsx
      reports/page.tsx
      settings/page.tsx
  components/
    layout/
    forms/
    feedback/
    data-table/
  features/
    leads/
      api/
      types/
      schemas/
      queries/
      components/
      pages/
    calling/
    imports/
    assignments/
    cbt/
    admissions/
    notifications/
    reports/
  lib/
    api-client
    date-time
    error-mapping
    session
    permissions
dummy-api/
  routes/
  domain/
  repositories/
  seeds/
  scenarios/
```

Avoid placing all lead logic in one page component. Keep domain types, validation, requests and presentation separate. Share the outcome form between lead detail and the caller workspace.

## 4. Routes, navigation and access

| Route | Screen | Main access |
|---|---|---|
| `/admissions` | Redirect to role landing page | All authorised roles |
| `/admissions/leads` | Searchable lead directory | Clerk, manager; callers see their own scope |
| `/admissions/leads/new` | Add enquiry | Clerk, manager |
| `/admissions/leads/:id` | Shared lead detail | Roles authorised for this lead |
| `/admissions/my-work` | Guided calling queue | Caller |
| `/admissions/imports` | Import batches and progress | Clerk, manager |
| `/admissions/imports/new` | Upload wizard | Clerk, manager |
| `/admissions/imports/:id` | Batch results and errors | Clerk, manager |
| `/admissions/assignments` | Workload and reassignment | Manager |
| `/admissions/cbt` | CBT queue and bookings | CBT staff, manager |
| `/admissions/admission-queue` | Admission follow-through | Admissions staff, manager |
| `/admissions/reports` | Funnel and operational reports | Manager, authorised admin |
| `/admissions/settings` | Users, capacity, cycles and policy | Authorised admin |

Landing pages: clerk → lead directory with Add enquiry and Import; caller → My Work; CBT staff → CBT queue; manager → assignments/operational overview.

The app shell contains school name, active admission cycle, navigation, current user and notifications. School/cycle context must remain visible. On demo identity changes, clear cached queries and refetch session permissions to prevent the previous user's records flashing on screen.

Hiding a button is only a UI convenience. The dummy service should also reject unauthorised requests so permission errors can be tested.

## 5. Domain types and display conventions

```ts
type LeadStage =
  | 'ENQUIRY' | 'INTERESTED' | 'READY_FOR_CBT'
  | 'CBT_SCHEDULED' | 'CBT_COMPLETED'
  | 'ADMISSION_IN_PROGRESS' | 'CONVERTED' | 'LOST' | 'INVALID';

type CallOutcome =
  | 'NO_ANSWER' | 'BUSY_CALLBACK' | 'INTERESTED'
  | 'VISIT_REQUESTED' | 'READY_FOR_CBT'
  | 'NOT_INTERESTED' | 'ADMITTED_ELSEWHERE' | 'WRONG_NUMBER';

interface Lead {
  id: string;
  schoolId: string;
  cycleId: string;
  studentName: string;
  guardianName: string;
  primaryPhone: string;
  alternatePhone?: string;
  gradeId: string;
  sourceId: string;
  stage: LeadStage;
  assignedCallerId: string | null;
  responsibleTeam: 'CALLING' | 'CBT' | 'ADMISSIONS' | 'NONE';
  responsibleUserId: string | null;
  lastCallOutcome: CallOutcome | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface FollowUpTask {
  id: string;
  leadId: string;
  schoolId: string;
  kind: 'FIRST_CALL' | 'CALLBACK' | 'VISIT' | 'CBT_CONTACT' | 'ADMISSION_ACTION';
  ownerUserId: string | null;
  ownerTeam: 'CALLING' | 'CBT' | 'ADMISSIONS';
  dueAt: string;
  requestedByParent: boolean;
  status: 'OPEN' | 'COMPLETED' | 'CANCELLED';
  version: number;
}
```

Activity records additionally need ID, lead ID, school ID, actor ID, timestamp, event type, notes and structured event details. Event types include creation, call attempt, callback request/reschedule, assignment, handover, booking, result, closure and reopening.

Lead responses may include a read-only summary of the next task, owner and recent activity. Persist tasks once; avoid maintaining independently editable copies of callback times on both the lead and task.

Use human labels such as “Ready for CBT” in the UI. Display stage, call outcome and next action as separate elements. Do not colour “Busy” as a loss. Use text/icons alongside colour. Show absolute appointment dates with a timezone; relative labels like Tomorrow can supplement them.

## 6. Screen specification: lead directory

Header actions: Add enquiry and Import, subject to permissions. Filters: search, stage, grade, source, caller, admission cycle, due-state and creation-date range. Search covers student, guardian, lead ID and phone within the user's authorised scope.

Columns: selection, student/grade, guardian/contact, stage, assigned caller, next action/time, last outcome and updated time. Selecting a name opens lead detail. Keep action buttons explicit; a checkbox click must not navigate.

Use server pagination, sorting and filtering. Start with 25 rows per page. Store search/filter/sort/page in URL parameters so refresh and shared links preserve the view. Debounce search and ignore stale responses. Reset to page one when filters change.

Bulk selection initially applies to the current page. Show the selected count and clear selection on filter/school changes. If “select all matching” is added, require a server-issued selection definition; do not imply all pages are selected when only visible rows are loaded.

States: skeleton while first loading; unobtrusive refresh indicator for later fetches; “No enquiries yet” with capture action; “No matching leads” with clear filters; error with Retry; forbidden view without exposing records.

## 7. Screen specification: add enquiry

### Layout and interaction

1. Contact lookup: primary phone and possible matches.
2. Student/guardian details: name, grade, cycle, alternate phone and optional locality/current school.
3. Enquiry context: source, optional notes and readiness.
4. Save or Save and add another.

Required fields: student name, guardian name, primary phone, grade, cycle, source and readiness. Use school-provided option lists. Do not hardcode years or grades in components.

Lookup runs after a usable phone value is entered. Matching cards show child, grade, cycle, stage and owner. The clerk can open an existing record or explicitly create a different child's opportunity. A match should not silently populate or overwrite unrelated details.

Readiness options are “Needs discussion” and “Ready for CBT.” The second shows a short confirmation of the route and, if required by policy, a readiness note. It does not require choosing a test slot.

### Validation and saving

- Trim names but allow natural-language characters; avoid alphabet-only restrictions.
- Parse phone values using the school default country and preserve international numbers.
- Validate required fields on blur/submission; focus the first error after submission.
- Disable duplicate submission while pending; use an idempotency key for safe retries.
- Keep all form values when a save fails.
- Warn before leaving an unsaved form.
- On success show the lead ID plus assigned caller, Unassigned, or CBT queue destination.

The service returns the routing result. The frontend must not guess the caller before assignment completes.

## 8. Screen specification: shared lead detail

Desktop: summary header, main information/history area and next-action sidebar. On narrower screens stack the same sections without hiding actions.

Header shows student, grade, stage, caller and current responsible team. The main area contains contacts, enquiry details and an activity timeline. Sidebar shows the next task and permitted actions.

Actions by context:

- Clerk: edit allowed contact fields, add internal note, request callback, route to CBT where permitted.
- Caller: record call, schedule callback, route to CBT, close with a reason.
- Manager: those actions plus assign/reassign and reopen.
- CBT/admissions: actions for their stage and responsibility.

Avoid a generic unrestricted stage dropdown. Named actions validate the required information and make side effects explicit.

Timeline entries show who did what, when, and old/new values for changes. Load older entries progressively. A note composer displays “Internal note — visible to school staff.” A separate task action creates notifications; merely writing a note does not schedule a callback.

Editing sends the current lead version. A conflict dialog explains that another staff member changed the record, loads the new version, and preserves the user's draft for comparison. Do not silently retry conflicting edits against a newer version.

## 9. Screen specification: caller workspace

### Main layout

- Queue tabs: Overdue, Due now, New enquiries, Upcoming.
- Counts fetched from the same service as the queue.
- Main panel: one lead's contact details, latest notes, last outcome and next action.
- Persistent action area: Call, Record outcome, Save, Save and next.
- A visible explanation of why this lead is in the queue, such as “Callback requested for 4 PM.”

Use a `tel:` link where supported. Clicking Call does not prove that a conversation occurred and must not automatically record a successful contact. Manual attempt recording is explicit.

Next lead requests the next eligible record from the service. Keep the currently opened lead stable when background data changes. If it was reassigned or closed, show a message and prevent an outdated mutation.

### Outcome form

| Outcome | Fields shown | Save behaviour |
|---|---|---|
| No answer | Retry time, optional note | Complete current attempt and schedule retry |
| Busy / call later | Callback date/time, note, parent-requested flag | Preserve stage/owner; replace pending callback |
| Interested | Next action, due time, note | Set Interested and create action |
| Visit requested | Visit date/time, coordinator, note | Record visit task; keep calling responsibility unless explicitly handed over |
| Ready for CBT | Readiness note if required | Handover and cancel enquiry call tasks |
| Not interested | Lost reason, note | Close lead and cancel tasks |
| Admitted elsewhere | Optional school/detail note | Close with corresponding lost reason |
| Wrong number | Alternate number action or invalid reason | Keep actionable when another contact exists; otherwise authorised invalidation |

Conditional validation must use the selected outcome. Hidden inputs must not accidentally submit old values after an outcome changes.

### Save and next

1. Validate the form.
2. Submit one command containing outcome, next action and expected version.
3. Wait for success; show inline error and keep the draft on failure.
4. Refresh lead detail, history, task counts and queue caches.
5. Request the next eligible lead only after the previous save succeeds.
6. If the queue is empty, show completion and the next upcoming appointment.

No speculative removal from the queue before save succeeds. A callback mutation changes stage/task/history in one transaction behind the API.

## 10. Callback requests and notifications

The clerk's Request callback dialog displays the existing callback and owner before asking for the new time and reason. It sends a command rather than adding a free-text note alone.

The response returns the updated task and lead version. History records old/new time. A notification links to the lead for the assigned caller. If no caller exists, the request remains in the unassigned calling queue with its requested time; notify the manager.

The prototype can refresh active queues and notifications periodically, for example every 30 seconds while the tab is visible, and on window focus. This is a provisional demo interval. Refetch immediately after the current user changes data. An overdue appointment must also update as time passes, without requiring a write.

Notification states: unread/read, timestamp, action label and lead reference. Marking a notification read must not complete its task. A callback being rescheduled should no longer show the old time as the current action.

## 11. Screen specification: assignments

Caller workload table: name, assignment enabled, leave status, active leads, capacity, overdue tasks and remaining capacity. An Unassigned panel shows pending count, oldest lead and filters.

Manager actions: assign selected leads, reassign selected leads, enable/disable new allocation and edit capacity where permitted. Reassignment dialog shows old owner, new owner, count, reason and that pending callbacks transfer with their existing times.

Provide a preview for bulk changes and report per-record success/conflict/failure. If a lead has already moved to CBT, do not blindly transfer it as a calling lead.

### Dummy assignment algorithm

1. Validate the lead is in the calling workflow and currently unassigned.
2. Filter callers by school, enabled role, availability and free capacity.
3. Choose the smallest active workload; break ties with a persisted rotating cursor.
4. Assign the lead and its open calling task; add history.
5. Commit assignment, task ownership and workload reservation together.
6. If no caller qualifies, keep the lead Unassigned with a visible reason.

Process bulk allocation sequentially inside a controlled service worker or serialised transaction boundary for the demo. Recompute workloads after each allocation, not once for an entire batch. Retry pending allocation when capacity is released or staff availability changes.

Synthetic proof cases: 1,000 valid leads / 10 callers / capacity 100 → 100 each; capacity 80 → 80 each plus 200 unassigned. Exclude direct-CBT rows and rejected import rows from those totals.

## 12. Screen specification: import wizard

### Steps

1. Upload: accepted formats, template link, configured size/row limit, selected file summary.
2. Map columns: sample values, required-field indicators and unmapped fields.
3. Validate: counts and row-level errors; distinguish possible duplicate from invalid data.
4. Review: new leads, skipped rows, unresolved matches and routing totals.
5. Confirm: start an import job with a stable idempotency key.
6. Results: processed/total progress, final totals, lead links and downloadable error report.

Offer a downloadable workbook template. Handle empty sheets, multiple sheets with explicit selection, duplicate headings, text/numeric phones, missing required columns and corrupt files. Do not interpret spreadsheet formulas as executable instructions.

For each possible duplicate, allow Open existing, Skip, or Create separate opportunity with a reason. Merging existing data is manager work and can be a separate detail flow. Do not make automatic overwrites part of the initial importer.

Persist import jobs so page refresh can resume viewing progress. Closing the screen does not cancel an accepted job. Retry only failed/unprocessed rows with their existing row identities. Show imported records immediately as they become available; final totals must reconcile with row outcomes.

Frontend should not hold 1,000 rendered rows at once. Paginate the validation preview and result rows. Use batch-level counts from the service.

## 13. CBT and admission screens

CBT tabs: Ready to schedule, Scheduled, Completed, No-show/Reschedule. Cards or table rows show student, grade, contact, booking and responsible person. Schedule dialog requires date/time, test identifier/type and location/link. Confirm timezone beside the input.

Attendance actions: Attended, No-show, Reschedule. Result action captures score/max score or an existing result reference, followed by an authorised progression decision. Do not mark a student converted from a test result alone.

Admission queue shows remaining action, due date and owner. For the prototype, use configurable manual milestones such as document review and seat confirmation. Complete admission requires the school-defined evidence fields. Keep this a status workflow unless actual document/payment integrations are in scope.

Handover must be atomic: update responsibility, cancel incompatible enquiry calls and create the receiving team's action. Preserve the earlier caller as history/reference; queue eligibility uses current responsibility so a historical assigned caller does not keep receiving calls for CBT leads.

## 14. API contract

Use `/api/v1` as an illustrative prefix. Identity and school scope come from the session; clients cannot gain access by supplying a different school ID. The dummy session endpoint is only for the prototype.

| Method and endpoint | Purpose |
|---|---|
| `GET /session` | Current user, school, roles, permissions and timezone |
| `GET /admission-options` | Cycles, grades, sources and approved reasons |
| `GET /leads` | Paginated filtered directory |
| `POST /leads` | Create and route enquiry |
| `POST /lead-matches` | Contact/student match lookup |
| `GET /leads/:id` | Detail, ownership and next-task summary |
| `PATCH /leads/:id/contact` | Update permitted contact fields with version |
| `GET /leads/:id/activities` | Paginated history |
| `POST /leads/:id/notes` | Internal note |
| `POST /leads/:id/call-outcomes` | Atomic outcome + stage/task effects |
| `POST /leads/:id/callback-requests` | Create/reschedule callback and notify owner |
| `POST /leads/:id/cbt-handover` | Direct or caller-triggered CBT routing |
| `POST /leads/:id/close` | Lost/invalid outcome with reason |
| `POST /leads/:id/reopen` | Authorised reopen, owner and next task |
| `GET /work-queue` | Queue rows, due buckets and counts |
| `GET /work-queue/next` | Next eligible assigned lead; reading does not mutate it |
| `GET /callers/workloads` | Workloads, capacity and availability |
| `POST /assignments/bulk` | Explicit assignment/reassignment with reason |
| `PATCH /callers/:id/availability` | Availability/capacity update |
| `POST /imports` | Upload and create batch |
| `PUT /imports/:id/mapping` | Column mapping |
| `POST /imports/:id/validate` | Validate mapped rows |
| `PUT /imports/:id/rows/:rowId/resolution` | Record skip/create-separate duplicate decision |
| `POST /imports/:id/commit` | Start idempotent import job |
| `GET /imports/:id` | Status and counts |
| `GET /imports/:id/rows` | Paginated row results/errors |
| `GET /imports/:id/errors` | Download error report |
| `GET /cbt/bookings` | CBT queue/bookings |
| `POST /leads/:id/cbt-bookings` | Schedule test |
| `PATCH /cbt/bookings/:id` | Reschedule or record attendance |
| `POST /cbt/bookings/:id/result` | Result/progression decision |
| `GET /admission-actions` | Admission queue |
| `POST /leads/:id/admission-actions` | Record remaining action or completion |
| `POST /leads/:id/convert` | Confirm school-defined admission completion |
| `GET /notifications` | Current user's notifications |
| `PATCH /notifications/:id` | Mark read |
| `GET /reports/admissions` | Cohort and operational metrics |

Example callback command:

```json
{
  "expectedVersion": 7,
  "outcome": "BUSY_CALLBACK",
  "note": "Parent requested a call after work.",
  "nextAction": {
    "kind": "CALLBACK",
    "dueAt": "2026-11-21T10:30:00Z",
    "requestedByParent": true
  }
}
```

The timestamp above displays as 4 PM in Asia/Kolkata. Convert using the school timezone; do not assume the browser's timezone is correct.

Mutation success returns the updated lead, affected task and version. Lists return `{ items, page, pageSize, total }`. Use a stable secondary sort by ID for deterministic pagination.

Error envelope:

```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "This lead was updated by another staff member.",
    "fieldErrors": {},
    "requestId": "demo-request-42"
  }
}
```

Handle 400/422 as input errors; 401 as expired session; 403 as forbidden; 404 as unavailable record; 409 as version/duplicate conflict; 5xx/network failure as retryable failures. Do not automatically retry writes without idempotency protection.

Send an `Idempotency-Key` for create, call-outcome, handover, close, bulk assignment and import commit commands. The service returns the same outcome for a repeated identical command; reusing the key for a different payload fails explicitly.

## 15. Query state, forms and refresh behaviour

Keep server records in the query cache. Keep modal visibility, selected row IDs and unsaved form values local. Keep shareable list filters in the URL. Avoid a second global store containing independent copies of all leads.

Query keys include session scope, cycle and filters, for example `['leads', schoolId, userScope, cycleId, filters]`. Detail/history keys include lead ID. Changing identity cancels in-flight requests and clears protected caches.

After a mutation, refresh all affected views: lead detail, activity history, caller queue, workload and notifications. Report totals can refresh after confirmation or on re-entry. Do not show a successful toast until the service confirms persistence.

Use pessimistic saves for workflow commands because they have multiple effects. Optimistic updates may be acceptable for marking a notification read, with rollback on failure.

## 16. Stateful dummy backend

### Persistence and sessions

Use a local database with tables corresponding to leads, tasks, activities, users, memberships, notifications, bookings, imports, rows and idempotency records. Save changes across browser/server restarts. A database transaction should cover each business command.

Provide demo-only endpoints for switching among seeded users and resetting a named scenario. Use independent browser sessions to test clerk/caller communication. A global role variable on the server would incorrectly change every user's identity.

### Scenario fixtures

| Scenario | Seed contents | Demonstrates |
|---|---|---|
| Small workflow | Around 30 varied leads | Each stage, due state and outcome |
| Balanced allocation | 10 empty callers and 1,000 valid import rows | 100 leads per caller |
| Capacity overflow | Same data, capacity 80 | 200 unassigned |
| Uneven workloads | Callers with different active counts | Least-workload allocation |
| Duplicate review | Same child/cycle, siblings, previous-year enquiry | Correct matching decisions |
| Staff absence | Caller on leave with existing callbacks | Exclusion and manager coverage |
| Multiple schools | Two schools with separate staff/data | Access boundaries |
| Concurrent editing | Two sessions opening the same lead | Version conflict handling |

Use deterministic seed identifiers and timestamps relative to an explicit demo clock. Never generate random states that make the same test unpredictable.

### Demo clock

Provide reset clock, advance 30 minutes and advance one day. Return service time in queue responses and use the same clock for both due buckets and UI labels. This lets callbacks become due without waiting a day. The production path uses actual server time.

### Fault controls

Support configurable latency, fail-next-read, fail-next-write and conflict-next-update. A failed transaction must leave all records unchanged. Also support a simulated lost response after a successful commit to verify that an idempotent retry does not duplicate activities/tasks.

Demo controls must be gated by development configuration and excluded/disabled in production. The dummy API is a workflow simulator, not evidence that production security, capacity or telephony has been implemented.

## 17. Accessibility and practical usability

- Use labelled inputs, visible keyboard focus and native table semantics where applicable.
- Keep dialog focus inside the dialog and restore focus when it closes.
- Make error messages accessible and associate them with their inputs.
- Support keyboard navigation through outcome controls and Save and next.
- Warn before discarding an unsaved call note when moving to another lead.
- Provide textual stage/overdue labels; colour alone is insufficient.
- Preserve typed notes after errors and conflicts.
- On small screens, prioritise contact, next action and outcome controls; allow secondary table data to scroll.
- Mask or restrict fields according to role where the school requires it; exports obey the same permissions as list access.

## 18. Implementation sequence and concrete deliverables

| Step | Build | Completion evidence |
|---|---|---|
| 1 | Inspect existing app; confirm Next.js version/router compatibility, auth, components and API conventions | Integration notes and agreed dependency choices |
| 2 | Domain contracts, dummy persistence, seeded roles and school boundaries | Session/lead endpoints work and persist |
| 3 | App shell, routes, permission gates, API client and shared feedback components | Each role lands on the right page; forbidden route tested |
| 4 | Add enquiry, lookup, directory and detail/history | Clerk creates a lead and finds it after refresh |
| 5 | Assignment algorithm, My Work, outcome form and callback tasks | Clerk-to-caller-to-callback scenario works end to end |
| 6 | Notes, callback requests, notifications and conflict handling | Two sessions see consistent changes without overwritten edits |
| 7 | Manager workloads, capacity and reassignment | Balanced/overflow/absence scenarios pass |
| 8 | Import wizard and background job processing | 1,000-row workbook imports with reconciled results |
| 9 | CBT/admission queues and closure/reopening | Direct CBT and caller handover paths reach final outcome |
| 10 | Reports, accessibility, fault states and reviewer walkthrough | Acceptance matrix completed with reproducible demo scenarios |

Build step 5 as the first complete vertical slice before polishing every dashboard. It validates the main operational problem while the module is still small enough to change.

## 19. Acceptance tests

Use unit tests for business decisions, service tests for command consistency, and browser tests for important user journeys. Avoid relying only on screenshots or static fixtures.

| Test | Expected evidence |
|---|---|
| Clerk creates enquiry | Persisted lead, assigned caller, visible first-call task |
| Ready parent at entry | CBT queue entry without enquiry call task |
| Busy callback from Interested | Stage unchanged, same owner, one callback at requested time |
| Advance clock past due | Callback moves to due/overdue in counts and list |
| Clerk reschedules callback | Previous time in history, new current task, caller notification |
| Save fails | Draft remains, queue stays unchanged, retry succeeds |
| Commit succeeds but response is lost | Retry returns original result; no duplicate history/task |
| Save and next | Next lead appears only after confirmed save |
| 1,000 leads with equal capacity | Exact allocation and count reconciliation |
| Capacity overflow | Unassigned queue visible; no silently dropped leads |
| Reassignment | Pending task owner changes; callback time/history preserved |
| Same phone for siblings | Distinct legitimate leads allowed |
| Import retry | Existing imported rows not recreated |
| Concurrent update | Conflict shown; user's draft is preserved |
| CBT handover | Enquiry tasks cancelled and receiving action exists |
| Closed lead | No further enquiry tasks offered |
| No-show | Reschedule/contact action remains; no automatic loss |
| Cross-school URL/API request | Service rejects access without returning lead data |
| Refresh or second browser session | Persisted shared state is consistent |
| Keyboard-only interaction | Capture and outcome submission usable without a mouse |

## 20. Senior-review walkthrough

1. Reset to the small workflow fixture and sign in as clerk.
2. Add an enquiry needing discussion; note its assigned caller.
3. Open a separate session as that caller and record Busy, tomorrow at 4 PM.
4. Return as clerk; reschedule the parent's callback and show the shared history.
5. Advance demo time; show the caller's due queue and notification.
6. Record readiness and hand over to CBT; show the calling queue removal.
7. Schedule and complete CBT; record the admission progression and final outcome.
8. Create another enquiry as Ready for CBT and demonstrate the bypass.
9. Load balanced and overflow fixtures to demonstrate lead allocation.
10. Demonstrate one duplicate, failed save and concurrent-edit conflict.

Capture the senior's feedback against business rules, interaction friction and missing information. Maintain a separate list for visual polish so workflow corrections remain visible.

## 21. Decisions to resolve before coding into Acadza

- Existing frontend repository, Next.js version/router compatibility, styling system, reusable components and API conventions. The Next.js frontend choice is already confirmed.
- Whether this is an integrated module or an isolated prototype intended for later integration.
- Who the calling staff belong to and how school membership is represented.
- Approved clerk permissions, closure/reopening permissions and assignment capacity rules.
- Working hours, callback grace window, retry limits and priority rules.
- Existing CBT APIs versus manual prototype booking/result tracking.
- Supported workbook formats, import limits and actual school sample columns.
- Exact definition of Converted and required admission completion information.

Until those choices are confirmed, keep uncertain policy values configurable in the dummy service. This specification is detailed enough to build and test the frontend workflow while leaving production integration decisions explicit.
