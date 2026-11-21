# Next.js design handoff

Next.js is the confirmed frontend requirement. App Router and TypeScript are proposed defaults for a new project; inspect the target repository before choosing versions or changing existing routing.

- Global tokens belong in the application stylesheet once, not copied into each component.
- Share the shell in the admissions layout. Keep role navigation derived from authorised session data.
- Use interactive client components for forms, queue controls and disclosures; keep secrets and server permissions out of browser code.
- Pages consume the typed API boundary from the implementation plan. Screens never import seed arrays.
- Reuse one field, button, dialog, badge and feedback implementation.
- Use CSS tokens directly. The Tailwind mapping is optional and version-specific; do not paste a configuration example into an incompatible Tailwind version.
- Page route conventions are documented in the page index. Use standard links so keyboard and new-tab behaviour work.
- Asset/font implementation is pending real source files. A font fallback must not block task completion.
- A dynamic dummy clock is development-only. It must update UI labels and server queue state together.
- The design kit does not select a component library or authorise replacing an existing one.

## First build slice

Shell → Add enquiry → caller My calls → Call later → due callback → Save and next. Include failure and duplicate states in this slice. Verify the layout at desktop and mobile widths before multiplying the pattern across other routes.
