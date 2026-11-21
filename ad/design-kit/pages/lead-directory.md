# Enquiries

**Route:** /admissions/leads. **Role:** clerk/manager; callers see their permitted scope. **Primary action:** Add enquiry for clerk, contextual management action for manager.

Header has title, year context and Add enquiry. Upload list is secondary. Default toolbar: search and stage, plus Filters for grade, source, owner and due state. Applied filters appear as removable text chips. No metric-card row.

Default columns: Student/grade, Parent/phone, Stage, Next action, Caller where relevant. Optional columns: source, last outcome, updated date. Row menu contains secondary permitted actions. Student name is a link; checkbox/menu clicks do not navigate.

Use 64px minimum rows, 16px horizontal cell padding, text wrapping and stable column alignment. Display “Waiting for caller” and “Action needed” explicitly. Do not display unexplained dashes for missing responsibilities.

Search/filter/page/sort state persists in URL. Clear filters action exists on no-results state. Table errors preserve filters. Bulk assignment appears only for managers after selection and says how many records were selected.

Mobile uses a readable stacked record or horizontally scrollable table, never microscopic columns. Test long names, no leads, filtered empty, 1,000 records paginated, duplicate family contacts and forbidden actions.
