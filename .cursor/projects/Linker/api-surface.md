# Flask routes — Linker

| Method | Path |
|--------|------|
| GET | `/`, `/jobs/<id>`, `/download/<id>`, `/healthz` (public) |
| POST | `/upload` |
| GET | `/api/accounts`, `/api/jobs`, `/api/jobs/<id>` |
| POST | `/api/jobs/clear`, `/api/jobs/<id>/cancel` |

Mounted under `/linker` via `SCRIPT_NAME`. All except `/healthz` need `pi_auth` JWT.
