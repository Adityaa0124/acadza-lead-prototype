# Add enquiry

**Route:** /admissions/leads/new. **Role:** clerk/manager. **Primary action:** Save enquiry.

## Layout and content

Page title and Back to enquiries above a single form. Form max-width 1000px. At wide desktop the optional matching-record area can sit beside phone lookup; below 1024px it appears inline. No statistics or greeting banner.

Required fields in order: parent phone, student name, parent/guardian name, grade, source. Year/school are prefilled and visible. Grade/source choices come from school settings. Labels above fields, 44px controls, 16px field gaps. Two columns only where natural pairing helps; phone lookup spans full width.

Phone lookup shows a quiet checking label, then matching opportunities with child, grade, year and current stage. Open existing is an actual link. “Different child or application” remains available with a reason; shared family numbers are legitimate.

Next step uses two clearly described radio rows: “Needs a call” and “Ready for entrance test”. No option is inferred from import/source. First can be a visible default only where school policy approves it. More details expands alternate phone, current school, locality and notes.

## Action and feedback

Footer: Cancel text action and Save enquiry primary. Save and add another is secondary only if repeated entry is a demonstrated need. On success display the actual assigned person or destination. Failure preserves input; invalid phone explains accepted format.

## States and acceptance

Test new contact, existing child, sibling, direct test route, all callers full, invalid form, pending save, failed save and unsaved navigation. A new clerk must understand where the enquiry will go before saving. Do not show a guessed owner.
