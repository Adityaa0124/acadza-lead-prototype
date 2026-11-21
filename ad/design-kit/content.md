# Language and microcopy

Use familiar task language and consistent nouns: enquiry, parent/guardian, student, caller, callback, entrance test, admission. Never expose enum values, “mutation”, “tenant”, “payload” or implementation status in staff flows.

| Concept | Visible wording |
|---|---|
| New lead | New enquiry |
| Calling workspace | My calls |
| BUSY_CALLBACK | Call later |
| NO_ANSWER | No answer |
| READY_FOR_CBT | Ready for test |
| CONVERTED | Admission completed |
| LOST | Closed — not admitted |
| INVALID | Invalid contact / invalid enquiry, with reason |
| Unassigned | Waiting for a caller |
| Version conflict | This enquiry changed while you were editing |
| Import | Upload enquiry list; Imports may remain navigation label |

Common outcomes: No answer, Call later, Interested, Ready for test. More outcomes: School visit requested, Not interested, Admitted elsewhere, Wrong number. Keep selected expanded outcome visible after disclosure.

## Feedback examples

- Success: “Enquiry saved. Assigned to Priya.”
- Overflow: “Enquiry saved. Waiting for an available caller.”
- Direct route: “Enquiry saved. The test team can now schedule a test.”
- Callback: “Saved. Call Kavita tomorrow, 21 November, at 4:00 PM IST.”
- Failure: “We couldn't save this update. Your notes are still here. Try again.”
- Conflict: “Priya changed the callback time. Review the latest details before saving.”
- Empty queue: “No calls due now.” Show next appointment if present.
- No matches: “No enquiries match these filters.” Action Clear filters.
- Parent opt-out: “Do not contact.” Show why and stop outreach actions.

Avoid blame, unexplained codes, “Oops!”, excessive celebration and unsourced performance claims. Error messages identify the field or recovery step. Always show a date and timezone with callback commitments; Today/Tomorrow alone is insufficient.
