# Screen index

All briefs are specified. Core routes are implemented in the local prototype; captured screens are linked in [screenshots](../screenshots/README.md). Staff approval remains pending. Some advanced interactions remain design requirements rather than implemented features; see the [prototype boundaries](../../frontend/README.md). Routes preserve the implementation contract; visible navigation uses simpler labels.

| Route | Brief | Primary role |
|---|---|---|
| /admissions/leads | [Enquiries](lead-directory.md) | Clerk/manager |
| /admissions/leads/new | [Add enquiry](add-enquiry.md) | Clerk |
| /admissions/leads/:id | [Record](lead-detail.md) | Authorised staff |
| /admissions/my-work | [My calls](caller-workspace.md) | Caller |
| /admissions/imports | [Imports](imports-list.md) | Clerk/manager |
| /admissions/imports/new | [Upload list](import-wizard.md) | Clerk/manager |
| /admissions/imports/:id | [Batch result](import-detail.md) | Clerk/manager |
| /admissions/assignments | [Assignments](assignments.md) | Manager |
| /admissions/cbt | [Entrance tests](cbt-queue.md) | Test staff |
| /admissions/admission-queue | [Admissions](admissions.md) | Admissions staff |
| /admissions/reports | [Reports](reports.md) | Manager |
| /admissions/settings | [Settings](settings.md) | Admin |

Default /admissions redirects to the role landing page. Staff profile is a menu, not a promised unimplemented route. Follow shared [states](../states.md) and [components](../components/README.md) on every page.
