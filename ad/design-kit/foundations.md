# Visual foundations

## Layout

Reference desktop: 1440×900. Sidebar 208px; header 64px; page padding 24px; content width fluid. At 1440px the usable width is 1184px. Single-task forms may use a maximum width of 1000px; operational directories use available width.

Use one page scroll region by default. The caller queue may scroll independently on wide desktops. Sticky actions must not cover the last field; include matching bottom space and mobile safe-area padding.

Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48px. Section gaps 24px; field gaps 16px; label/input gap 6px; helper gap 6px. Default panel padding 24px, reduced to 16px on mobile.

## Typography

One provisional system sans stack. Body/input 14/22px, mobile input 16/24px, label 14/20px medium, metadata 12/18px, page title 24/32px semibold, section 18/26px semibold, dialog 20/28px semibold, phone 20/28px semibold. Button 14/20px medium. Tabular numerals for time, counts and phone.

Do not use uppercase micro-labels, condensed text or thin font weights. Long names wrap to two lines in queues and fully on detail pages. Essential values never rely on hover to be readable.

## Shapes

Controls 6px radius, navigation/rows 8px, panels/dialogs 12px. Border 1px. Panels normally have no shadow. Menus/dialogs alone use overlay shadow. Do not enclose every section inside another rounded card.

Icons 18px, consistent outline stroke. Icon-only controls have 44px targets, accessible names and tooltips. Essential actions have text.

## Responsive contract

- 1360px and above: expanded sidebar; caller queue 264px and flexible conversation workspace.
- 1024–1359px: optional 72px labelled-on-hover rail; queue 240px when enough room remains; conversation minimum 480px.
- 768–1023px: navigation drawer; queue and selected lead become separate views with Back to calls.
- Below 768px: one-column forms, 16px padding, 44px controls; table offers accessible cards or horizontal scroll without shrinking text.

At any width, choose the simpler layout when content no longer fits. Test 200% zoom and long translations rather than relying only on viewport breakpoints.

## Semantics

Blue means interactive/selected; amber means attention; red means error/closed loss; green means confirmed success. Labels and icons accompany all colours. Readiness is not success. A “Call later” outcome never changes an Interested stage by itself.

Use a visible 2px focus outline with 2px offset. Verify rendered contrast; the token audit is only a preliminary check.
