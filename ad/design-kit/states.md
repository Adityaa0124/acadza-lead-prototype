# Shared state and recovery contracts

| State | Required behaviour |
|---|---|
| First load | Skeleton matching layout; no invented example data |
| Background refresh | Preserve visible data and focus; small refresh indicator |
| Empty | Explain whether no records exist or filters exclude them; one useful action |
| Input error | Inline message, associated input, focus first invalid field |
| Save pending | Disable duplicate submit, preserve button width and draft; announce progress |
| Save failed | Keep input and selection; inline retry; do not advance queue |
| Save succeeded | Confirm actual server result; refresh affected views; then advance if requested |
| Response lost after commit | Retry with same command identity; do not create duplicate tasks |
| Conflict | Preserve draft, display latest changes, require intentional review |
| Reassigned/closed while open | Stop stale actions, explain and offer next eligible work |
| Offline | Persistent notice; preserve draft in current session; never claim queued sync unless implemented |
| Forbidden | No protected data; return to permitted page |
| Session expired | Reauthenticate; preserve draft only in appropriately scoped memory |
| Missing record | Neutral unavailable message without revealing another school's data |

## Dialog behaviour

Title and description, visible close control, focused first meaningful control, trapped keyboard focus, Escape where safe, return focus to opener. No stacked dialogs. Destructive actions have explicit labels. Confirmations explain the actual effect, including task cancellation.

## Interruptions

Warn before navigating away from a dirty form. Identity/school changes require resolving unsaved work, then clear protected state. Do not persist contact data indiscriminately in browser storage. A callback notification must not steal focus while the caller types.

## Due-time behaviour

Service time and school timezone determine due status. Refresh counts and list together; do not move the active record unexpectedly. Appointments due now must remain visible even when a backlog of overdue work exists. Queue priority remains an explicit school policy, not an invisible frontend guess.
