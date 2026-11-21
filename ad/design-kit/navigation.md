# Shell, roles and navigation

## Shell anatomy

Header: school name, academic-year selector, notifications, staff menu. Keep the school/year visible but prefilled. Orange 2px divider is the only decorative brand strip. No global search until it has a real, scoped implementation; the enquiry directory already provides search.

Sidebar: actual logo or explicit prototype placeholder, 44px navigation rows with 18px icons and text, help/profile area at bottom. Active row uses blue text and pale-blue fill, plus a left marker. Only render authorised destinations.

## Default navigation

| Role | Landing | Main destinations |
|---|---|---|
| Clerk | Enquiries | Enquiries, Imports |
| Caller | My calls | My calls, My enquiries |
| Manager | Assignments | Enquiries, Assignments, Imports, Entrance tests, Admissions, Reports |
| Test staff | Entrance tests | Entrance tests, relevant student records |
| Admissions staff | Admissions | Admissions, relevant student records |
| Admin | Settings or permitted operational landing | Settings plus explicitly granted operational destinations |

Use “My calls” as the visible label for /admissions/my-work. Use “Entrance tests” for CBT queue; explain “Computer-based test (CBT)” in the page description. Backend values and routes stay unchanged.

Roles can be combined. Do not assume that administration permission grants unrestricted access to every student record.

## Navigation behaviour

Preserve list filters in URL when returning from details. Breadcrumbs offer a clear return destination. Opening a row does not discard an unsaved draft without warning. Identity changes clear scoped caches before showing new data. Route checks and API checks are both required.

Staff profile dropdown: name, role, school, Help and Sign out; show My profile only if a real screen exists. No student purchase/bookmark controls.

Notifications: 380px panel on desktop; full-width sheet on mobile; unread dot plus text; event, student, time, link. Read does not mean task complete. Callback reminders do not disappear merely because they were opened.
