# Shared UI components

## `src/components/ui.tsx`

Reusable primitives: `Badge`, `PageTitle`, `Empty`, `Field`, `Pending`, `Modal`, `Submit`, and `ErrorText`.

The component source is the canonical implementation used by every authenticated route. Key visual contracts: `PageTitle` renders eyebrow, title, description and actions; `Modal` is a native dialog with focus handling; `Badge` is stage-driven; `Field` associates labels and hints to controls.

## `src/components/whatsapp-contact.tsx`

Reusable parent-contact action. Creates a personalised WhatsApp draft and keeps the current admissions context.

## `src/components/manage-lead.tsx`

Reusable lead management actions. Renders only for roles that are permitted to change the selected record.

## `src/components/context.tsx`

Shared application context exposing snapshot data, commands, notifications, request handling and dirty-state tracking.
