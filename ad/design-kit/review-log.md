# Design review log

## Current status

Specification audited and expanded; working Next.js prototype created in `../frontend/`. Original references and selected rendered desktop/mobile screens inspected. Staff usability testing, full keyboard/screen-reader review and final brand-asset approval remain pending.

## Decisions in this revision

- Screenshot-based blue primary action replaces conflicting gold-primary guidance.
- One provisional system font stack replaces unverified mandatory font pairs.
- Two-column caller workspace replaces an obligatory three-panel layout.
- Four common call outcomes stay visible; less frequent outcomes use disclosure.
- Directory defaults reduced; secondary fields remain accessible.
- Missing route briefs and recovery contracts added.
- CSS variables are canonical; optional framework mapping references them.

## Evidence register

| Check | State |
|---|---|
| Five original screenshots inspected | Complete |
| Design-kit file/link consistency | Passed `node check-kit.mjs` across 30 Markdown files before evidence updates |
| Token contrast for declared foreground/background pairs | Nine pairs passed: body 15.67:1, muted 5.99:1, metadata 4.97:1, button 5.62:1, selected 4.87:1, attention 6.61:1, error 6.05:1, success 6.76:1; control border 3.03:1 |
| Real rendered screen review | Inspected desktop enquiries, capture, caller, assignments, tests, reports and import review; mobile caller inspected at 390px |
| Keyboard and screen-reader test | Full manual review pending; native controls/dialog used |
| Representative staff task test | Pending access to staff |
| Logo and font source verification | Pending assets |

## Record future reviews

Date, screen/state, viewport, reviewer, evidence path, finding, severity, change and retest result. Do not mark an item complete without evidence. Business-rule decisions remain tracked in the admissions plan.

## Findings addressed during implementation

- Small supporting text was hard to read in first captures: increased 9–11px UI text to at least 12px and primary operational text to 14px.
- Promotional headings added interpretation effort: replaced with direct task titles such as My calls, Add enquiry and Assignments.
- Initial disabled Save and next incorrectly resembled a pending save: separated disabled and busy states.
- Background refresh could advance an outcome draft's version: retained the draft's original version until explicit review, allowing the service to reject stale changes.
- Missing result data in a seeded completed test prevented result entry: corrected the fixture and added progression coverage.
- Transitive dependency audit identified UUID through ExcelJS: applied a scoped compatible override; install audit now reports zero vulnerabilities.

## Small-detail refinement

Named dialogs and descriptions, field/helper associations, keyboard focus containment/restoration, focused error summaries, 44px touch targets, long-name wrapping, visible secondary selections and conditional required explanations were refined. The first focused keyboard test exposed focus escaping the dialog at the end of the control list; explicit forward/backward wrapping fixed it. Type checking and all three browser/API journeys now pass. The refreshed 390px caller capture was visually inspected and has no page-wide overflow. Full screen-reader and staff usability review remain pending.

## Verification and prototype boundaries

Final verification: production build and TypeScript checks passed; six domain tests and two browser/API journeys passed. Browser coverage includes enquiry capture, caller callback, failed-save draft preservation, role boundaries, mobile overflow, workbook import, idempotent retry, transaction rollback and test-to-admission progression. Fifteen rendered screenshots were captured. These checks do not constitute staff acceptance or a complete accessibility audit.

Fixed-template, single-sheet Excel import rather than arbitrary column mapping; local scoped snapshot filtering rather than server pagination; basic current-cohort reports rather than full analytics. Identity switching is a demo facility. No real telephony, payments, document verification or production authentication. The [frontend README](../frontend/README.md) records setup and limits.
