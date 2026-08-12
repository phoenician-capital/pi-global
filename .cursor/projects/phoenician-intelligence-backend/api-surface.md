# API surface — PI .NET (v2)

Client URLs are `/api/...` after PathBase.

| Area | Highlights |
|------|------------|
| Auth | login, OTP verify/resend, logout, verify-email, suspend, passwords, invite*, test-email |
| TickerRequest | CRUD, dashboard-stats, presigned, download, status-stream, generate/cancel/regenerate/update, force-reset, screening, upgrade-to-dd, h2h*, risk-auditor*, versions, IR email, approach-company, data-status, efs-list |
| Companies | dcf-upload, raw-data-upload, dcf regenerate(+cheap), dcf-download |
| Python proxy | `GET health` + catch-all `/{**path}` |
| Screening/Universe | filter, metadata, universe/search |
| Chat/Notes | sessions/messages; notebooks/pages/comments/revisions/ai-context |
| Brain | playbooks approve/reject/regenerate/mine-status; skills compile |
| Costs/Vendor | costs/*, vendor-billing summary/by-provider/sync-status |
| Developer/Diagnostics | env-config, container-status, logs, universe seed/prefetch, efs markers |
| Internal | callbacks/report-completed; brain upsert; universe list/readiness/ensure-risk/file |
| Other | MarketData, TTS speech, Jobs, User, UserActivity, GET /health |

**Rate:** `report-generate` 10/hour/user. Policies: BrainPlaybookViewer/Admin, CostsViewer, ActivityMonitorViewer (email allow-lists; ActivityMonitor no DEVELOPER bypass).
