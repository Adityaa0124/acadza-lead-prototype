# Import result

**Route:** /admissions/imports/:id. **Role:** clerk/manager.

Header filename, uploader/time, status and batch identifier. Compact counts reconcile total rows to created/skipped/failed/unresolved categories. Tabs filter results; created rows link to records, failed rows explain correction.

Actions: View imported enquiries, Download errors, authorised retry. Mapping and source-sheet details are under Details. Running jobs show actual progress and survive refresh.

Never treat all rows as failed because one response was lost. Failed rows and committed records must remain distinguishable. Test batch unavailable, long error text and retry results.
