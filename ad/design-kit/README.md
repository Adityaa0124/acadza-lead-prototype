# Acadza admissions design kit

**Required frontend:** Next.js. **Status:** specification plus working local prototype; staff validation and brand-asset approval pending.

The [Next.js prototype](../frontend/README.md) implements the core workflows. See the [rendered screenshot index](screenshots/README.md) and [review log](review-log.md) for evidence and limitations.

This directory is the authoritative visual and interaction specification for the admissions module. It covers novice staff working under interruptions. The main requirement is a clear next action with essential context and no unnecessary clutter.

## Read in this order

1. [Design direction](DESIGN.md) and [brand evidence](brand-reference.md).
2. [Foundations](foundations.md) and [CSS tokens](tokens/tokens.css).
3. [Navigation and roles](navigation.md).
4. The relevant [page brief](pages/README.md).
5. [Component contracts](components/README.md), [content rules](content.md), and [state rules](states.md).
6. [Review checklist](checklist.md) before accepting a screen.
7. [Small-detail review](detail-review.md) for labels, control states, focus, hit areas and long content.

## Authority and boundaries

- Confirmed user requirements: Next.js, shared role-based lead records, low cognitive load, uncluttered screens.
- Business workflow: [lead-management plan](../ACADZA_ADMISSIONS_LEAD_MANAGEMENT_PLAN.md).
- Technical workflow/API: [implementation plan](../ACADZA_FRONTEND_IMPLEMENTATION_PLAN.md).
- Visual decisions: this kit. It supersedes conflicting visual suggestions in earlier standalone specifications, including gold primary buttons and three permanently visible caller columns.
- CSS token values are the colour/spacing source of truth. Framework mappings reference those variables.
- Proposed dimensions and wording remain subject to implementation checks and staff testing.
- Screenshot references are evidence of the current student product, not approved admissions mockups.

## Working practice

Build the clerk capture and caller callback flows first. Show realistic long names, failed saves and overdue tasks before polishing reports. Record review status in [review log](review-log.md). Only put real rendered captures in screenshot QA folders. Never label a document or empty folder as a completed visual review.

## Contents

- `pages/`: all route briefs, with states and acceptance conditions.
- `components/`: shared controls, task patterns and interaction contracts.
- `tokens/`: semantic CSS and optional Tailwind mapping.
- `screenshots/references/`: five original Acadza captures.
- `raw/`: future inspectable prototypes; not production source.
- `assets/`, `fonts/`: asset provenance and pending dependencies.
- [Next.js handoff](nextjs-handoff.md): integration boundaries, not application code.
