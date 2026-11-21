# Acadza admissions prototype

Next.js frontend with a shared, persistent dummy backend. All seeded parent/student details are synthetic. The [design kit](../design-kit/README.md) defines the visual direction.

## Run

Use Node.js 24 and npm. From this directory:

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000 on the machine running the app. If that machine is remote, forward port 3000 to your own computer. This is a local preview, not a published site.

This work session installed Node at `/tmp/node-v24.22.3-linux-x64/bin`; on this machine prepend that path to PATH if `node` is unavailable. That temporary runtime is not bundled with the project.

## Try it

1. Start as Priya in My calls. Choose Call later and schedule a callback.
2. Open Demo in the header and switch to Ananya (front desk).
3. Add an enquiry, find its assigned caller and inspect the shared history.
4. Switch to the assigned caller to record the next conversation.
5. Switch to Meera (manager) for allocation, reports and team capacity.
6. Use the test/admissions identities to schedule a test, record attendance/results and complete admission.
7. Upload an `.xlsx` file using the downloadable template to preview valid/duplicate/invalid rows.

Demo controls also advance time, fail the next save and load 1,000-lead allocation scenarios. Reset replaces synthetic data only. The SQLite store is `.demo/admissions.sqlite` and survives browser/server restarts.

## Implemented

- Role-specific navigation and server-checked school/record access in the simulator.
- Enquiry creation, duplicate warning, direct-to-test routing, directory search/filter/page URL state, detail and shared notes.
- Caller queues, four common outcomes, conditional callback fields, save/next and draft-preserving failure states.
- SQLite transactions, version checks and idempotent workflow commands.
- Contact corrections, callback requests/notifications, individual reassignment and reopening.
- Least-active-workload assignment, caller availability/capacity, overflow and bulk assignment.
- Fixed-template Excel preview/import with skipped duplicate/invalid rows and downloadable results.
- Test booking/rescheduling, attendance/no-show, results and manual admission completion.
- Basic current-cohort reports; responsive desktop/mobile layouts.

## Deliberate prototype boundaries

- The identity picker is demo authentication, not a production security system. No real personal data should be used in this simulator.
- Production builds require `ACADZA_DEMO=true` to enable this dummy API. Do not publish it as a real admissions service.
- Excel uses one worksheet and fixed template headings. Arbitrary column mapping, background jobs and interactive row correction are still specified in the kit but not implemented.
- Queues and lists fetch a scoped snapshot, then paginate/filter locally. A real backend should provide server pagination and background allocation.
- Call buttons open `tel:`; there is no telephony, WhatsApp, payment or document verification integration.
- Admission completion is an explicit manual confirmation. School completion rules need validation.
- Reports are current-cohort summaries; advanced date-cohort exports and trend comparisons are not implemented.
- The text wordmark is a temporary brand placeholder pending Acadza's actual logo/font assets.
- Browser tests and visual checks do not replace testing with school staff. Screen-reader testing remains pending.

## Verification

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npx playwright test
node ../design-kit/check-kit.mjs
```

Browser tests expect the development server on port 3000 and reset synthetic data. They produce screenshots in the design kit. In this work environment browsers were installed in `/tmp/acadza-playwright`; use `PLAYWRIGHT_BROWSERS_PATH=/tmp/acadza-playwright` when running those checks here.

The lockfile pins installed packages. ExcelJS's UUID dependency is overridden to 11.1.1 to address the reported transitive advisory; import/template tests exercise compatibility.

## Structure

`src/app`: Next.js routes and CSS. `src/components`: role workspaces and forms. `src/lib/domain.ts`: workflow rules. `src/lib/store.ts`: local SQLite transaction store. `src/app/api/v1/[...path]/route.ts`: dummy API. `tests`: domain and browser checks.

Implementation reference: [Next.js App Router documentation](https://nextjs.org/docs/app/getting-started).
