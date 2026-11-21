# Acadza Admissions: authenticated workspace design system

## Product

Acadza is a school admissions operations tool. Authenticated users are clerks, callers, test staff, admissions officers and managers. Their main job is to progress an enquiry clearly and safely: find a parent/student, contact them, schedule or record a test, verify documents and complete admission.

## Creative direction

Use the visual language of `../design-kit2`, but make it Acadza's own system. The signed-in experience should feel more like a calm editorial operations workspace than a generic SaaS dashboard: confident hierarchy, breathable panels, warm off-white canvas, tactile pill controls and restrained navy/orange brand moments. Never reuse Nument/Sarvam words, marks or imagery.

## Brand

- Use the supplied real Acadza gear-and-wordmark logo in every logo position. Never replace it with initials, an emoji, a generic gear or text alone.
- Brand navy: `#122b59` / `#102551` for dark moments and ink-adjacent UI.
- Accent orange: `#e45c0b`, used sparingly for progress, emphasis and warm blurred light. Indigo is the interactive/selected color.
- Canvas: `#fcfcfc`; cards: white; dividers: `#f0f0f0` and `#e6e6e6`.

## Typography

- Display headings: Newsreader, Georgia fallback. Use only for page headings, 32px desktop with light editorial weight.
- UI/body: Figtree, system sans fallback, 14-16px.
- Labels/meta: DM Mono, 11-12px uppercase letter spacing.
- Do not use heavy bold body copy. Use medium weights for active labels/actions.

## App shell

- Wide desktop layout. Left sidebar 272px white with a hairline right border. It contains the real Acadza lockup, a small workspace label, navigation sections and a school card at the bottom.
- Top bar is 64px, white, hairline bottom border: school chip, academic year, unobtrusive search/notifications/profile controls.
- The main canvas has a 1200px maximum content width and generous breathing room.
- Active nav: pale indigo capsule with a 3px left-side accent; inactive items remain quiet neutral text.

## Page composition: Admissions queue

- A compact editorial hero at the top: mono eyebrow `ADMISSIONS OFFICE`, Newsreader page title `Admissions`, short operational subtitle, right-aligned ink pill action.
- Add a small hero-side status strip or a soft blurred orange/periwinkle light field, never a large saturated banner.
- Below: a single white rounded work panel. Its header shows the list name and a quiet student count.
- The search and filters appear as a composed filter bar: wide pill search left, compact select pills right. Keep controls 44px tall.
- Table headers are mono uppercase. Rows are 72-80px, separated by hairlines. Names create hierarchy; status uses colored low-contrast pills. Scores are compact metric blocks, not plain cells.
- Keep the inline Remaining action select prominent enough to use but visually calm. Pair it with a document status pill. The primary per-row action uses an outline or soft pill, never a rectangular generic button.
- Use the existing exact table content/roles. No invented admissions features.

## Components

- Cards: 16px radius, white, `1px #f0f0f0` border, very soft `0 0 40px rgba(0,0,0,.06)` optional shadow.
- Buttons and filters: full pill, 40-44px height. Primary is deep navy/ink with subtle inset bevel. Secondary is soft grey or white with a border.
- Inputs: soft `#f5f5f5` fill or white with a hairline border; focus indigo ring.
- Statuses: indigo for in progress/selected; green for verified/success; amber for awaiting review; red for needs documents. Avoid overly saturated fills.
- Icons: existing Lucide rounded line icons, 1.5px visual weight.

## Motion and accessibility

- Page/panel entry: only a subtle 16-24px fade-up over 500-800ms. No looping decorative movement inside the data table.
- Hover: calm border and background shifts under 200ms; primary button can use a low-key cursor glow.
- Honor reduced motion. Maintain 40px hit targets and visible indigo keyboard focus.

## Constraints

- No em dashes or en dashes in displayed copy.
- Do not introduce generic gradient dashboard cards, stock people photography, dark-mode screens, huge KPI grids or marketing copy.
- Use only the colors, typography, spacing and component rules above.
