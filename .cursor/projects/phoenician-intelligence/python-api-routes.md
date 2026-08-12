# Python API routes — phoenician-intelligence

Source: `api/main.py` (representative; not every admin variant). FastAPI on `:8000`. PathBase on .NET side is `/api`; Python is called from EB proxy / internal.

## Health / jobs

| Method | Path | Notes |
|--------|------|-------|
| GET | `/health` | Docker HEALTHCHECK |
| GET | `/` | Root |
| POST | `/jobs/submit` | Legacy job submit |
| GET | `/jobs/{job_id}/status` | |
| GET | `/jobs/{job_id}/result` | |

## Reports

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/reports/generate` | 202 — full DD |
| POST | `/api/reports/generate-cheap` | 202 — cheap path |
| POST | `/api/reports/update` | 202 |
| POST | `/api/reports/cancel/{ticker_request_id}` | |
| POST | `/api/reports/cancel-all` | |
| GET | `/api/reports/status` | |
| POST | `/api/reports/regenerate-sections` | 202 |
| GET | `/api/reports/{ticker}/versions` | |

## Company / DCF / data

| Method | Path |
|--------|------|
| GET | `/api/data-status/{ticker}` |
| GET | `/api/ir-email/lookup` |
| GET | `/api/companies/check/{ticker}` |
| GET | `/api/companies/sources/{ticker}` |
| GET | `/api/companies/dcf-links/{ticker}` |
| GET | `/api/companies/dcf-download/{ticker}/{file_type}` |
| POST | `/api/companies/dcf-upload/{ticker}` | 202 |
| POST | `/api/companies/dcf-upload-cheap/{ticker}` | 202 |

## EFS / admin

| Method | Path |
|--------|------|
| POST | `/api/efs/rename-ticker` |
| GET | `/api/efs/list` |
| GET | `/api/efs/list/{ticker}` |
| GET | `/api/admin/list-reports-on-efs` |
| POST | `/api/admin/manual-report-sync` |
| POST | `/api/admin/upload-presign` |
| POST | `/api/admin/extract-from-s3` |
| POST | `/api/admin/upload-raw-data-folder` |
| POST | `/api/admin/upload-companies-folder` |
| GET | `/api/admin/efs/browse` |
| GET | `/api/admin/efs/download` |
| POST | `/api/admin/efs/download-folder` |

Auth for admin/EFS: see `api/security_auth.py` + `http-status.md`. Also brain/prefetch/RAG routes live in same app or routers — check `tiny-logic.md` / `prefetch.md` / `brain-skills.md` for behavioral gates.
