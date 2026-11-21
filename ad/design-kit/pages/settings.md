# Settings

**Route:** /admissions/settings. **Role:** authorised admin.

Local sections: Team, Assignment, Admission years, Workflow options. Avoid putting every option on one long form. Only expose settings the backend supports.

Team: name, roles, availability, capacity, Edit. Assignment: policy explanation and capacity/availability controls. Years: name/date/state. Workflow: approved reasons and timing configuration.

Save settings is the primary action for the current section. Show unsaved changes. High-impact changes show affected scope before confirmation. Routine value saves do not require repeated dialogs.

Demo role/clock/reset controls live in a separate labelled Demo controls drawer, not these production settings. Test validation, failed save, insufficient permission and capacity below current workload; never silently drop existing assignments.
