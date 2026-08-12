# API surface — PI Python (~84 routes)

| Area | Routes |
|------|--------|
| health | `GET /health`, `GET /` |
| jobs | `POST /jobs/submit`, `GET /jobs/{id}/status|result` |
| reports | `POST /api/reports/generate`, `/generate-cheap`, `/update`, `/cancel/{id}`, `/cancel-all`; `GET /status`; `POST /regenerate-sections`; `GET /{ticker}/versions`; H2H + risk-auditor CRUD/regen |
| companies/DCF | check, sources, dcf-links, dcf-download, dcf-upload(+cheap) |
| data/IR/EFS | data-status, ir-email/lookup, efs rename/list |
| admin | EFS browse/download/upload/delete/rename/backup/presign; extract-from-s3; ecs env-vars; migrate-data-room; manual-report-sync |
| logs | list/download/tail/search per ticker |
| chatbot | determine-action, load/query/stream-query, search-pdfs/excels, suggest/apply/modify/manual-edit, upload-file |
| prompt-lab | section-info, template, preview, improve-prompt, approve |
| internal | prefetch, prefetch/running, watch-verdict webhook |
| brain/skills | mine+status; skills CRUD/compile/calibrate/reload |

**Auth tiers:** developer `/api/admin|/api/efs|/api/logs`; authenticated `/api/reports|/chatbot|/jobs`; public `/health`. `SECURITY_AUTH_ENFORCE` default log-only.
