# Routes

| URL | Entry | Screen |
| --- | --- | --- |
| `/login` | `src/app/login/page.tsx` | Acadza sign-in |
| `/admissions` | `src/app/admissions/[[...path]]/page.tsx` | Redirects to the signed-in role workspace |
| `/admissions/leads` | `src/components/admissions-app.tsx` → `Directory` | Enquiries for clerk/caller/manager |
| `/admissions/admission-queue` | `src/components/admissions-app.tsx` → `AdmissionQueue` | Admissions verification queue |
| `/admissions/my-work` | `src/components/admissions-app.tsx` → `CallerWorkspace` | Calling team desk |
| `/admissions/cbt` | `src/components/admissions-app.tsx` → `TestQueue` | Entrance test team |
| `/admissions/assignments` | `src/components/admissions-app.tsx` → `Assignments` | Manager assignments |

The catch-all admissions page renders `AdmissionsApp`; client-side pathname selection determines the visible role-appropriate route.
