# Screenshot evidence

`references/` contains the five original Acadza product screenshots supplied as brand and layout references. Their original filenames are preserved; they are not admissions implementation QA captures.

Store approved visual references using `<screen>-<state>-<viewport>.png`.

`desktop/`, `tablet/`, and `mobile/` hold normal viewport captures. `states/` holds key UI states such as validation error, callback scheduled, save failure, conflict, empty queue, and overdue work.

## Actual prototype captures

These are Playwright captures of the running Next.js prototype, not generated mockups or staff-approved designs. Desktop viewport: 1440×1000, full-page capture. Mobile: 390×844, full-page capture. Empty folders do not indicate completed testing.

- [Caller workspace](desktop/caller-workspace.png)
- [Enquiry directory](desktop/enquiries.png)
- [Add enquiry](desktop/add-enquiry.png)
- [Enquiry detail](desktop/enquiry-detail.png)
- [Assignments](desktop/assignments.png)
- [Entrance tests](desktop/entrance-tests.png)
- [Admissions](desktop/admissions.png)
- [Reports](desktop/reports.png)
- [Team settings](desktop/settings.png)
- [Imports](desktop/imports.png)
- [Upload workbook](desktop/upload.png)
- [Import review](desktop/import-review.png)
- [Mobile caller queue](mobile/caller-queue.png)
- [Mobile conversation](mobile/caller-conversation.png)
- [Failed callback save with preserved note](states/callback-save-failed.png)

Regenerate with `npx playwright test` from `ad/frontend` while the local app runs. The tests reset synthetic demo data. The review log distinguishes captured evidence from inspected/approved evidence.
