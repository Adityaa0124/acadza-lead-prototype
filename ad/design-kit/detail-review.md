# Small-detail review standard

Apply this to every new component and page. A clean-looking first screenshot is not enough.

## Labels and decisions

- The title names the task. Supporting text answers a real question.
- Field labels remain visible after typing; helper text is linked through `aria-describedby`.
- Required information changes with the outcome: choosing Other makes the explanation visibly required.
- Collapsing secondary outcomes never hides the selected outcome.
- Disabled and loading are different states; no spinner before a request starts.
- Dates include the school's timezone. Stage, last outcome and next action remain distinct.

## Geometry and readability

- Control hit areas are at least 44px even when the visible icon is smaller.
- Spacing, border, radius and type follow the shared tokens.
- Long names and notes wrap without covering actions or causing page-wide horizontal overflow.
- Check actual 390px, tablet and desktop rendering; also check zoom, not just screenshots resized by an image viewer.
- Use no text below 12px for supplementary information; operational copy is at least 14px.

## Interaction and recovery

- Dialog has a programmatic name, description, focus containment and focus restoration.
- Queue filters use honest button semantics and expose their selected state.
- Keyboard can reach outcomes, conditional fields and the save action in reading order.
- Error summary receives focus after a failed submit; the draft remains intact.
- Save and next never advances on failure.
- Notifications and refreshes do not steal focus or erase selected context.
- Touch, keyboard, mouse, empty, loading, error, disabled and long-content states are checked separately.

## Evidence from this refinement

Implemented named dialogs, associated field hints, error-summary focus, honest queue-filter semantics, retained secondary selection, conditional required explanation, 44px hit areas and long-name wrapping. A focused browser test covers the changed interactions. Full assistive-technology review and school-staff validation remain separate pending activities.
