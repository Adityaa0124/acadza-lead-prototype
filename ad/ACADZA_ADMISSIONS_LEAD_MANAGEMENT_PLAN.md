# Acadza: School Admissions Lead Management Plan

**Status:** validation before implementation.  
**Prepared:** 20 November 2026  
**Scope:** Admission enquiries received by schools using Acadza. This is the school's parent/student admission workflow

## 1. Purpose and expected outcome

Build one shared lead-management module for front-desk staff, the calling team, admissions managers, and CBT staff. Each role sees the information and actions needed for its work.

The clerk captures enquiries or imports Excel data. The system routes each accepted lead to the right queue. Callers receive organised work, record conversations, and schedule follow-ups without manually selecting rows and phone numbers from spreadsheets. Parents already ready to proceed can move directly to CBT. Admissions staff track the eventual admission outcome.

Every active lead must have a responsible person or a visible team queue and a next action. Every closed lead must have a recorded outcome and history.

## 2. Requirements established in discussion

- Clerks and callers use the same database and lead records, with role-based permissions.
- Enquiries can be entered individually or imported from Excel.
- New leads needing discussion are distributed across the calling team.
- Callers must be able to record that a parent is busy and requests a later call.
- The system should reduce the effort of choosing whom to call and remembering follow-ups.
- Parents already ready at enquiry time can bypass calling and proceed to CBT.
- Leads that do not convert can be marked lost with a reason.
- Both teams need shared visibility of notes, callbacks, and progress.

Assignment policies, capacity limits, timing targets, CBT responsibilities, and the exact definition of completed admission below are proposed rules for review.

## 3. End-to-end process

1. A parent enquires through the front desk, phone, an event list, or another supported source.
2. A clerk enters the enquiry or imports it from Excel.
3. The system validates the data and flags possible duplicates.
4. The clerk indicates whether the parent needs discussion or is ready for CBT.
5. Leads needing discussion are assigned to an eligible caller. Ready parents go directly to the CBT queue.
6. The caller contacts the parent and records the outcome and next action.
7. Parents requesting more time receive a scheduled callback with the same caller.
8. When ready, the student is handed over for CBT scheduling.
9. CBT attendance and results are recorded or linked from the existing CBT system.
10. Eligible students proceed through admission. Completed admissions become Converted; closed opportunities become Lost with a reason.

**Two valid entry paths:**

- Enquiry → assigned caller → discussion/callbacks → Ready for CBT.
- Enquiry with readiness confirmed → Ready for CBT directly.

Both continue through scheduling, test completion, and the school's admission decision. Readiness for CBT does not itself mean admission is confirmed.

## 4. Roles and permissions

| Role | Responsibilities | Proposed access |
|---|---|---|
| Clerk / front desk | Capture enquiries, import files, correct contact details, record parent visits and callback requests | Search the school's leads; view progress and history; create leads; add notes; route ready parents to CBT if authorised |
| Calling team | Contact assigned parents, record outcomes, schedule callbacks, move ready leads to CBT, record losses | Work on assigned leads; view their history; update permitted stages and next actions |
| Admissions manager | Supervise the funnel, resolve duplicates, assign/reassign leads, handle exceptions | View all school leads, queues, workload and reports; override with a recorded reason |
| CBT staff | Schedule tests, record attendance/results, manage rescheduling and test decisions | Access CBT leads and relevant student/contact details |
| Admissions staff | Follow up documents, seat confirmation and admission completion | Access admission-stage leads and record final outcomes |
| School admin | Manage users, roles, admission periods and school settings | School-level administration and authorised reporting |

One staff member may hold multiple roles. Permissions must be enforced by the server, including for imports and exports. Each school sees only its own data. Any Acadza support access needs an explicitly defined permission model.

## 5. Lead data

### 5.1 Proposed minimum fields at capture

| Field | Purpose |
|---|---|
| Student name | Identify the child applying |
| Parent/guardian name | Identify the contact person |
| Primary phone number | Contact and duplicate review |
| Grade applying for | Route and qualify the enquiry |
| Academic year / admission cycle | Separate current and future applications |
| Enquiry source | Understand where enquiries originate |
| Readiness | Needs discussion or Ready for CBT |

Optional fields: alternate phone, current school, locality/city, programme interest, preferred callback time, preferred contact language, referral/campaign, and notes. Confirm required fields with the school before finalising the form.

### 5.2 System-managed fields

Lead ID, school ID, creation time, creator, import batch if applicable, admission stage, assigned caller, current responsible team/person, last call outcome, next action and due time, last contact time, call attempt count, closure reason, and activity history.

One lead represents one student's admission opportunity for a school and admission cycle. A parent may have multiple children and therefore multiple legitimate leads.

## 6. Keep stage, call outcome, ownership and next action separate

These answer different questions:

| Field | Question answered | Example |
|---|---|---|
| Admission stage | Where is the student in the admission process? | Interested |
| Assigned caller | Who owns the calling relationship? | Caller A |
| Last call outcome | What happened during the latest attempt? | Busy; callback requested |
| Next action | What must happen next, and when? | Call tomorrow at 4 PM |

**New**, **Unassigned**, **Follow-up due**, and **Overdue** are operational views or assignment/task states. They should not compete with admission stages in one status dropdown.

### 6.1 Proposed admission stages

| Stage | Meaning / exit condition |
|---|---|
| Enquiry | Captured; interest/readiness still being established |
| Interested | Parent expressed interest but is not yet ready for CBT |
| Ready for CBT | Readiness confirmed; awaiting a test booking |
| CBT scheduled | Test booking exists |
| CBT completed | Student took the test; result or admission decision may remain pending |
| Admission in progress | School has allowed progression; remaining admission actions are tracked |
| Converted | School-defined admission completion has been confirmed |
| Lost | Opportunity closed with a business reason |
| Invalid | Record cannot be used, such as unusable contact details with no alternative |

Duplicates are resolved by linking or merging into the existing lead, rather than counted as lost admissions. Reopening a closed lead should require a reason and retain the earlier closure event.

### 6.2 Call outcomes and required actions

| Outcome | Effect on stage | Required action |
|---|---|---|
| No answer | No change | Schedule retry under the school's policy |
| Busy / call later | No change | Record requested callback date and time |
| Interested | Set Interested if appropriate | Record next step and due time |
| Wants school visit | Usually remains Interested | Record visit and responsible staff |
| Ready for CBT | Set Ready for CBT | Hand over to CBT queue |
| Not interested / admitted elsewhere | Set Lost | Select reason and record useful notes |
| Wrong number | Do not infer lack of interest | Try an available alternative; mark Invalid only if contact cannot be corrected |

No answer is not automatically Lost. The retry limit and escalation procedure require school approval.

## 7. Callback workflow: parent is busy

1. Caller opens a lead and reads its recent history.
2. Parent says, for example, “I am at work; call tomorrow at 4 PM.”
3. Caller selects Busy / callback requested and records that time.
4. The system preserves the existing admission stage and assigned caller.
5. Saving the outcome completes the current call task and creates or replaces the pending callback.
6. The lead leaves the immediate calling queue and remains visible under Upcoming.
7. At the due time it appears under Due now. If missed, it appears under Overdue.
8. The manager can see unresolved overdue callbacks and reassign where needed.

Example record:

| Field | Value |
|---|---|
| Stage | Interested |
| Last outcome | Busy — requested callback |
| Next action | Call parent |
| Due | Tomorrow, 4 PM in the school's timezone |
| Owner | Same caller |
| Note | Parent requested contact after work |

If no exact time is provided, the caller proposes/records a reasonable follow-up time using school policy. Store the distinction between a parent-requested appointment and an internal retry target. Do not silently replace a parent's requested time with an automatic retry rule.

## 8. Communication between clerk and calling team

Both work on one lead record with a chronological activity history. Entries show the author, timestamp, action, and relevant details.

Example: a parent calls the front desk after speaking with a caller.

1. Clerk searches the parent phone number and selects the correct child/application.
2. Clerk sees the assigned caller, current stage and pending callback.
3. Clerk uses Request callback and records “Parent requests tomorrow at 11 AM.”
4. The existing pending callback is rescheduled, with the previous time preserved in history.
5. The assigned caller receives an in-app notification.
6. The caller records the later conversation in the same history; the clerk can see the updated stage.

Routine notes are visible in history. Changes needing action—callback requests, reassignment, handover and overdue escalation—generate notifications. An internal note is not a message to the parent.

Concurrent edits must not silently overwrite each other. If someone changes the lead while another staff member is editing it, show the latest data and require conflicting changes to be reviewed.

## 9. Distribution: 1,000 leads and 10 callers

### 9.1 Recommended initial policy

Assign each accepted enquiry needing calling to the eligible caller with the fewest active calling leads. Rotate between callers when counts are equal. Keep ownership stable after assignment, unless a manager reassigns it.

Eligibility means the caller belongs to the school, has the required role, is enabled for assignment, is not on leave, and has spare configured capacity. Language, grade or programme matching can be added if the school needs them.

If all 10 callers start with zero active leads and each has capacity for 100, 1,000 valid leads are distributed as 100 each. This is ownership allocation; it does not imply that each caller must call all 100 on the same day.

If all callers have a capacity of 80, 800 leads are assigned and 200 stay in the visible Unassigned queue. The manager receives an alert and can increase capacity or add staff. The system must not hide or discard overflow.

### 9.2 Assignment rules

- Count leads requiring calling-team work as active workload.
- Exclude Converted, Lost, Invalid and leads handed over to CBT/admissions from active calling workload.
- Keep future callbacks with their existing caller to preserve context.
- Exclude callers on leave from new assignments. Existing due tasks need explicit coverage or reassignment.
- Preserve history, pending tasks and callback times when reassigning.
- Reattempt allocation from the Unassigned queue when capacity becomes available.
- Record every assignment and reassignment with time, actor and reason.

Assignment and workload reservation must be atomic. Concurrent saves/imports must not assign a lead twice or use the same stale workload counts repeatedly. Automatic assignment may run immediately after save; until it succeeds, the lead must remain visibly Unassigned.

### 9.3 Caller work queue

The My Work screen shows Overdue, Due now, New enquiries and Upcoming callbacks. The proposed Next lead order is overdue tasks, callbacks due now, then uncontacted enquiries oldest first. Future callbacks are excluded from Next lead until due.

A manager should be able to identify when overdue work is preventing new enquiries from being reached and arrange coverage. Exact priority between overdue calls and appointments due at the current moment needs validation.

The caller sees student/parent details, grade, source, previous notes, last outcome and next action. They call, select an outcome, save the next step, and continue to the next lead. A click-to-call link can launch a supported phone app; automatic dialling and verified call logs require a separate telephony integration.

## 10. Clerk entry and Excel import

### 10.1 Individual entry

Start with phone lookup to find existing records. If a matching parent exists, show children/application cycles so the clerk can choose an existing opportunity or create a legitimate new one. Do not merge solely on phone number.

After validation, save the enquiry and route it according to readiness. The confirmation should show the lead ID and assigned caller or destination queue.

### 10.2 Bulk import

1. Provide a template and accept an agreed spreadsheet format.
2. Map uploaded columns to supported fields.
3. Preview rows, required-field failures and possible duplicates.
4. Normalise phone formats while preserving usable country codes and original input.
5. Let the clerk correct or exclude invalid rows before confirmation.
6. Create approved new records and route each by readiness.
7. Show totals for created, duplicate-review, skipped and invalid rows.
8. Provide a row-level error report and batch history.

Possible duplicates should be reviewed. Do not silently overwrite an existing lead's owner, stage, notes or callback from a spreadsheet. Any permitted update mode must preview its effects explicitly.

Duplicate matching uses school, admission cycle, student details and parent contact. Shared phone numbers can represent siblings. Repeating the same confirmed import request must not create duplicate leads or assignments; use an import batch identity and row processing records.

## 11. CBT handover and admission tracking

Ready for CBT and CBT scheduled are separate: readiness can be confirmed before a slot is available.

1. Clerk or caller records readiness and sends the lead to the CBT queue.
2. The lead leaves the calling queue; pending enquiry calls are cancelled with a reason.
3. CBT staff schedules the test and records date/time, grade, test type and location or online details.
4. Staff confirms arrangements with the parent. Automated parent messages can be added later.
5. CBT staff records attendance and links or enters results.
6. Authorised school staff records the progression decision.
7. Admission staff owns remaining actions, such as document checks, fees or seat confirmation.
8. An authorised user marks Converted when the school's completion criteria are satisfied.

Missed tests remain actionable: record No-show and a rescheduling/contact task. Do not automatically mark them Lost. A student who does not qualify follows the school's policy on retests, alternatives or closure.

The first release tracks these milestones. Building a new CBT engine, fee collection system or document-verification system is outside this module unless separately approved. If Acadza already provides relevant capabilities, confirm the integration contract and source of truth.

## 12. Lost, invalid and reopened leads

Proposed lost reasons: not interested, admitted elsewhere, fees, distance/transport, programme unavailable, admission eligibility decision, or another specified reason.

Require a reason; require explanatory notes for Other. Cancel pending outreach on closure and preserve the full history. A parent's request not to be contacted must stop future outreach and be visible to staff.

Lost leads can be reopened by an authorised role when circumstances change, with a reason, new owner and next action. Invalid records and merged duplicates should be reported separately from genuine lost opportunities.

## 13. Screens for the first release

| Screen | Main functions |
|---|---|
| Add enquiry | Contact lookup, capture, readiness and routing |
| Excel import | Template, mapping, preview, errors, duplicate review and summary |
| Lead directory | Search and filters by stage, source, grade, cycle, owner and due date |
| Lead detail | Contact data, stage, owner, next action, notes and history |
| My Work | Due/overdue/new queues, upcoming callbacks, Next lead and outcome form |
| Manager workspace | Assignment, unassigned leads, capacity, reassignment and overdue work |
| CBT queue | Readiness, scheduling, attendance, results and handover |
| Admission queue | Remaining actions and completion/closure |
| Reports | Funnel, source performance, workload and losses |
| Administration | Roles, users, school settings and admission cycles |

## 14. Dashboard and reporting

Operational reports should include unassigned leads, first-contact pending, due and overdue tasks, workload per caller, CBT bookings/no-shows and pending admission actions.

Funnel reports should include enquiries, reached parents, interested students, CBT readiness/bookings/completions, admission in progress, Converted and Lost. Include the direct-to-CBT path: contacting a parent by the calling team is not mandatory for every admission.

Report by admission cycle, date range, source, grade and responsible staff. Distinguish current-stage counts from historical stage transitions. Reopened leads and repeated calls must not inflate unique-lead counts.

Proposed definitions for validation:

- Call attempts: recorded attempts, including no answer. Label these self-reported until integrated telephony verifies them.
- Contact rate: unique leads reached divided by unique leads attempted in the chosen reporting scope.
- Conversion rate: converted opportunities divided by valid unique opportunities in the selected admission cohort.
- Follow-up timeliness: due tasks completed by their agreed due time, with an approved tolerance if needed.

First-contact targets, working hours, retry spacing and escalation thresholds must be configurable. Earlier examples such as a 15–30-minute response target are suggestions, not agreed requirements.

## 15. Suggested technical data model

This is a conceptual model; adapt it to Acadza's existing application after inspecting its architecture.

| Entity | Purpose |
|---|---|
| School | Tenant boundary and school settings |
| User / SchoolRole | Staff membership, permissions and assignment availability |
| AdmissionCycle | Academic year and admissions window |
| Lead | Student opportunity, contacts, source, stage and current responsibility |
| Activity | Notes, call outcomes, stage changes and audit events |
| FollowUpTask | Action, owner, due time, status and completion/cancellation |
| AssignmentHistory | Caller/team transfers and reasons |
| ImportBatch / ImportRow | Upload identity, row validation and processing results |
| CBTBooking / ResultLink | Test booking, attendance and result reference |
| AdmissionOutcome | Completion or closure details |

Core integrity rules:

- Scope every read, write, assignment and duplicate check to an authorised school.
- Allow one current calling owner per lead and preserve prior assignments.
- For the MVP, maintain at most one open admission-enquiry callback per lead; reschedule it instead of creating conflicting duplicates.
- Save an outcome, stage change, next task and history consistently so partial updates do not lose work.
- Use version checks for concurrent edits and reliable assignment/task processing.
- Store timestamps consistently and display appointments in the school's timezone.
- Retain an audit trail for closure, reopening, merging and reassignment.

## 16. MVP scope and later additions

### First release

- School-scoped login and roles.
- Individual lead capture and Excel import with validation and duplicate review.
- Shared lead details and activity history.
- Automatic assignment by active workload, capacity limits and visible overflow.
- Caller queue, call outcomes, callbacks and overdue tracking.
- Clerk-to-caller callback requests and in-app notifications.
- Direct CBT routing, booking/status tracking and admission outcome tracking.
- Lost/invalid reasons and controlled reopening.
- Manager workload/funnel reports and authorised exports.

### Later additions

- Integrated telephony, automatic dialling and call logs.
- Automated WhatsApp/SMS confirmations and reminders.
- Website enquiry forms and campaign integrations.
- Parent self-service, document uploads and payment integration.
- More advanced assignment by language, speciality or workload effort.
- Lead scoring and deeper campaign analytics.

## 17. Delivery sequence

1. Validate school operations, roles, stages, callback rules and CBT boundaries with the senior and a school representative.
2. Inspect the existing Acadza application, authentication, school tenancy and CBT capabilities.
3. Build a complete single-enquiry flow: capture, assignment, caller action, callback, handover and closure.
4. Add Excel import, duplicate resolution, capacity handling and manager reassignment.
5. Add reporting and remaining operational exceptions.
6. Pilot with a small school team, observe missed tasks and unnecessary clicks, then adjust before wider rollout.

Do not commit to an implementation timeline until the existing codebase, integration scope and available team are known.

## 18. Acceptance scenarios for review and implementation

| Scenario | Expected result |
|---|---|
| Clerk saves a normal enquiry | Exactly one lead is created and assigned or visibly Unassigned |
| Parent is already ready | Lead goes directly to Ready for CBT; no compulsory calling task |
| Parent requests tomorrow at 4 PM | Stage remains unchanged; same caller receives a callback at that time |
| Clerk reschedules the callback | Caller is notified; old and new times remain in history |
| Parent does not answer | Attempt is recorded and retry scheduled; lead is not automatically Lost |
| 1,000 leads; 10 empty callers; capacity 100 each | Each receives 100 leads |
| 1,000 leads; 10 empty callers; capacity 80 each | Each receives 80; 200 remain visibly Unassigned |
| Caller has more existing work | New assignments favour eligible callers with lower active workloads |
| Two imports/save requests run concurrently | No duplicate ownership; configured capacity remains respected |
| Same import confirmation is retried | Already processed rows do not create new leads |
| Siblings share a phone | Separate legitimate student opportunities can be created |
| Lead moves to CBT | Enquiry callback is cancelled; CBT queue becomes responsible |
| Student misses CBT | No-show and next action recorded; no automatic loss |
| Lead is Lost or Converted | Pending enquiry calls stop; history remains accessible |
| Caller goes on leave | New allocation excludes them; existing callbacks remain visible for coverage |
| Two staff edit the same lead | Conflicting updates are detected instead of silently overwritten |
| Staff from another school requests the lead | Access is denied on the server |

## 19. Decisions requested from the senior

| Decision | Proposed starting point / question |
|---|---|
| Calling-team ownership | School employees or a shared Acadza team? If shared, define authorised school access |
| Clerk authority | Can clerks route directly to CBT and reschedule callbacks? Proposal: yes, with history |
| Distribution | Approve least-active-workload assignment with rotating ties? |
| Capacity | What maximum active workload is realistic per caller? |
| Callback priority | How should overdue tasks compete with appointments due now and new enquiries? |
| Timing | Define working hours, first-contact target, retry intervals and escalation |
| Closure policy | Who can mark Lost/Invalid, merge duplicates and reopen a lead? |
| CBT | Who schedules it, what qualifies a student, and how are results linked? |
| Handover | Which team owns no-shows, retests and post-CBT follow-ups? |
| Conversion | What exact event confirms admission: approval, fee, documents, or another milestone? |
| Imports | Which columns/files must be supported, and who resolves duplicate matches? |
| Existing architecture | Which authentication, school tenancy, CBT and notification features can be reused? |
| Reporting | Approve cohort definitions and treatment of reopened/invalid/duplicate records |

## 20. Review record

- Reviewer:
- Review date:
- Approved scope:
- Required changes:
- Decisions still pending:
- Pilot school/team:

Approval of this proposal should establish the MVP workflow and business rules before detailed implementation estimates are prepared.
