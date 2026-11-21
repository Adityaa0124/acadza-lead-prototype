# Extractable components

## AdmissionsShell
- Source: `src/components/admissions-app.tsx`
- Category: layout
- Description: Role-aware authenticated application shell with sidebar and top context bar.
- Extractable props: `activeItem`, `userName`, `userRole`, `schoolName`, `academicYear`, `notificationCount`.
- Hardcoded: Acadza logo placement, shell borders, nav icon system.

## PageTitle
- Source: `src/components/ui.tsx`
- Category: basic
- Description: Page eyebrow, title, description and right-aligned action area.
- Extractable props: `eyebrow`, `title`, `description`, `showAction`.
- Hardcoded: typography and spacing rules.

## StatusBadge
- Source: `src/components/ui.tsx`
- Category: basic
- Description: Stage status indicator for admissions records.
- Extractable props: `stage`.
- Hardcoded: stage color mapping.

## DataTablePanel
- Source: `src/components/operations.tsx`
- Category: basic
- Description: Filterable white data panel with table header, rows and per-record actions.
- Extractable props: `title`, `count`, `activeFilters`.
- Hardcoded: table rhythm, border and action placement.
