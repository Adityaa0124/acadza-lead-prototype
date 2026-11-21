# Key page dependency trees

## `/admissions/admission-queue`

Entry: `src/app/admissions/[[...path]]/page.tsx`

- `src/components/admissions-app.tsx`
  - `src/components/context.tsx`
  - `src/components/ui.tsx`
  - `src/components/operations.tsx`
    - `AdmissionQueue`
    - `src/lib/types.ts`
  - `src/components/lead-pages.tsx`
  - `src/components/caller-workspace.tsx`
  - `src/app/globals.css`

## `/admissions/leads`

Entry: `src/app/admissions/[[...path]]/page.tsx`

- `src/components/admissions-app.tsx`
  - `src/components/lead-pages.tsx`
  - `src/components/ui.tsx`
  - `src/components/context.tsx`
  - `src/app/globals.css`

## `/login`

Entry: `src/app/login/page.tsx`

- `src/components/login-page.tsx`
  - `public/acadza-logo.svg`
  - `src/app/globals.css`
