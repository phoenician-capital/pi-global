# Routes & client storage — phoenician-intelligence-frontend

## Pages → routes (`App.tsx`)

| Page file | Route(s) |
|-----------|----------|
| `Login.tsx` | `/login` |
| `Signup.tsx` | `/signup` |
| `VerifyEmail.tsx` | `/verify-email` |
| `ForgotPassword.tsx` | `/forgot-password` |
| `ResetPassword.tsx` | `/reset-password` |
| `Hub.tsx` | `/hub` |
| `Dashboard.tsx` | `/dashboard` (embed frame: diligence) |
| `ClientDashboard.tsx` | `/client-dashboard` |
| `RequestTicker.tsx` | `/request-ticker` |
| `Developer.tsx` | `/requested-ticker` |
| `PendingUpdates.tsx` | `/pending-updates` |
| `UserManagementPage.tsx` | `/manage-users` |
| `Screening.tsx` | `/screening` |
| `PortfolioOptimizer.tsx` | `/portfolio-optimizer` (embed) |
| `EarningsTracker.tsx` | `/earnings` (embed) |
| `CapiqAgent.tsx` | `/screen` (embed CapIQ Screen) |
| `ReportSample.tsx` | `/report-sample`, `/report/:requestId` |
| `ReportSampleSection.tsx` | `/report-sample/:section` |
| `InviteClient.tsx` | `/invite-client` |
| `InviteUser.tsx` | `/invite-user` |
| `JsonUploadPage.tsx` | `/json-to-pdf` |
| `ScreeningValidation.tsx` | `/screening-validation` |
| `EnvironmentConfig.tsx` | `/environment-config` |
| `EFSBrowser.tsx` | `/efs-browser` |
| `EFSManagement.tsx` | `/efs-management` |
| `LogsDashboard.tsx` | `/logs` |
| `LogsViewer.tsx` | `/logs/viewer` |
| `ReportDebugDashboard.tsx` | `/report-debug` |
| `InvestorAnalytics.tsx` | `/investor-analytics` |
| `UniverseTracker.tsx` | `/universe-tracker` |
| `BrainPlaybooks.tsx` | `/brain/playbooks` |
| `RisksWorkspace.tsx` | `/risks` (embed) |
| `CompanyNotesWorkspace.tsx` | `/company-notes` |
| `CostsHub.tsx` | `/costs` (embed) |
| `UserActivityMonitor.tsx` | `/user-activity` |
| `NotFound.tsx` | `*` |
| `RootLanding` (inline) | `/` |
| Legacy redirect | `/cost-tracker` → `/costs` |
| Orphan (no route) | `Index.tsx`, `ManualReportSync.tsx` |
| Child of CostsHub | `CompanyCostOverview.tsx`, `CostTracker.tsx` |

## `src/services/*`

`asyncJobService`, `authApi`, `brainPlaybookApi`, `brainSkillsApi`, `companyNotesApi`, `h2hPdfExport`, `jsonUploadPdfExport`, `liveCostApi`, `pdfExport`, `pdfExportV1`, `pythonFinanceApi`, `riskPdfExport`, `screeningApi`, `section13PdfExport`, `section14PdfExport`, `section2PdfExport`, `section3PdfExport`, `tickerRequestApi`, `universeSearchApi`, `userApi` (+ `*.test.ts`).

## Storage keys

| Key | Where | Purpose |
|-----|-------|---------|
| `authToken`, `authUser`, `rememberEmail` | authStorage | Auth |
| `ph_ticker_list_v10` | local | Ticker list cache |
| `ph_prices_v3` | session | Prices |
| `ph_init_prices_v4` | session | Init prices |
| `ph_report_{screening_?}{requestId}` | ReportSample | Report cache |
| `chatbotWidth` | local | Chat UI width |
| `ph_h2h_{ticker}` | CompetitionTab | H2H cache |
| `pi_last_activity_at` | local | Idle session |
| `pi_activity_session_id` | session | Heartbeat |
| `pi_risk_table_v1` | session | Risk table |
| `pi_diligence_table_v1` | session | Diligence table |
| `pi.tts.openAiVoice` | local | TTS voice |

Logout wipe: all keys starting `ph_` in localStorage + sessionStorage (`AuthContext`).
