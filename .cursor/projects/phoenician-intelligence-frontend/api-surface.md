# Routes — PI FE (App.tsx)

| Path | Guard |
|------|-------|
| `/login` `/signup` `/verify-email` `/forgot-password` `/reset-password` | public |
| `/hub` `/` `/dashboard` | INVESTOR, DEVELOPER |
| `/client-dashboard` | CLIENT |
| `/request-ticker` | INVESTOR, CLIENT |
| `/screening` `/report/:requestId` `/company-notes` `/risks` | INVESTOR, DEVELOPER |
| `/report-sample` `/invite-client` | INVESTOR |
| `/brain/playbooks` | DEVELOPER + brain emails |
| `/portfolio-optimizer` `/earnings` `/screen` | email allow-lists |
| `/costs` | DEVELOPER + costs emails |
| `/user-activity` | activity-monitor emails |
| Dev ops (`/efs-*`, `/logs*`, `/universe-tracker`, …) | DEVELOPER |
| `/linker` | full navigation (not SPA client-route) for cookie |

Services call .NET/Python: authApi, tickerRequestApi, brain*, liveCostApi, pythonFinanceApi, TTS `POST /api/tts/speech`.
