# CapIQ URLs & workers — Linker (v4)

| item | value |
|------|------|
| Base | `https://www.capitaliq.com` |
| Overview (hyperlink) | `/ciqdotnet/company.aspx?leftlink=true&companyId={id}` |
| Key stats | `/CIQDotNet/Financial/KeyStats.aspx?companyId={id}` |
| Dashboard | `/CIQDotNet/my/dashboard.aspx` |
| companyId regex | `companyId=([A-Za-z0-9_]+)` |
| Account select | UI indices → `CAPIQ_LINKER_ACCOUNT_INDEX` → `CAPIQ_LINKER_WORKERS` → all |
| Empty indices | **cache-only** (no login) |
| DEFAULT_MAX_WORKERS | 6 (prod often 8) |
| DEATH_LIMIT / RECYCLE_EVERY_N / MAX_REQUEUES | 3 / 75 / 3 |

Health: `GET /healthz` → `{"status":"ok"}` public.
