# Shared layouts

## `src/app/layout.tsx`

The global Next.js root layout imports `src/app/globals.css` and renders the app body.

## `src/components/admissions-app.tsx`

The authenticated shell owns the desktop sidebar, compact top bar, mobile navigation, demo controls, notification panel and route switch. The active sidebar item is role-dependent. This is the layout to redesign for every post-login screen.

Layout shape: fixed-width left navigation; top context bar with school and academic year; wide workspace canvas; route content rendered inside `main.app-content`.
