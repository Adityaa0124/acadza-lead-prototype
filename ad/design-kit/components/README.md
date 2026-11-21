# Component contracts

All components use semantic tokens and inherit the single type scale. “Approved” is reserved for reviewed rendered artefacts; these contracts are specified, not yet approved.

| Component | Anatomy and variants | Key rules |
|---|---|---|
| Button | Label, optional icon, pending indicator; primary/secondary/text/danger | 44px target; one local primary; no icon-only consequential action |
| Field | Visible label, control, helper/error | Required indication; aria association; no placeholder-only label |
| Select | Selected text, chevron, option list | Keyboard support; search only for long lists; explicit empty/loading |
| Date/time | Date, time, timezone, interpreted appointment | Preserve parent-requested values; validate future time using school policy |
| Status badge | Short text, optional icon | Separate stage/outcome/due state; no colour-only meaning |
| Lead row | Student/grade, parent/contact, stage, next task, owner when relevant | Default columns limited; optional metadata through Columns |
| Filter bar | Search, stage, Filters, active chips | Advanced filters secondary; clear empty results and URL state |
| Queue row | Student/grade, parent, due reason/time | Selected highlight; no repeated badge stack |
| Conversation header | Parent contact, student context, current commitment | Copy/call labels; alternate contact secondary |
| Outcome form | Four common options, More outcomes, conditional fields, note, save | No preselected outcome; no stale hidden field submission |
| Next-action summary | Verb, appointment, owner, reason | One reschedule action; explicit missing-action state |
| Timeline | Actor/action, timestamp, note, relevant old/new values | Latest relevant events first; older history expandable |
| Notification | Event, student reference, timestamp, unread state | Reading never completes task |
| Import summary | Total/ready/review/failed counts, row links | Counts reconcile; no fake progress |
| Workload row | Caller, available status, active/capacity, overdue, action | Numbers accompany progress bar |
| Dialog | Header, scrollable body, persistent footer | 480/560/720px widths; max viewport minus 32px |
| Toast | Status, concise text, dismiss | Not sole error channel; important details remain in record |
| Empty state | Small neutral icon, title, explanation, action | No stock illustration or decorative metrics |

## Button state contract

Primary blue/white; hover darker blue; pressed darker again. Secondary white with visible control border. Focus uses independent outline. Disabled has readable grey text and no hover effect. Pending label remains meaningful. Minimum gap between adjacent touch controls 8px.

## Form state contract

Default border is distinguishable from fill; error has red border plus text. Read-only is readable and visually different from disabled. Conditional fields appear in normal reading order; screen readers are notified when important details change. Do not jump focus unexpectedly on radio selection.

## Table interactions

Checkbox hit area does not open row. Row name is an actual link. Selection says whether it covers this page. Changing school/filter clears incompatible selection. No all-results selection without a server-backed definition. Sort order is both visible and accessible.

## Deferred component

A full admission-stage ribbon is optional detail-page disclosure, not a mandatory header element. Default shows current stage plus next action. This avoids forcing every staff member to scan a process diagram to place one call.
