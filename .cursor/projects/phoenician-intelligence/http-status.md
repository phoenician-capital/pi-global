# HTTP status — PI Python (v4 gaps)

| code | when | body / note |
|-----:|------|-------------|
| 202 | generate* accepted | async |
| 400 | DCF not xlsx; too many files (>2000) | |
| 401 | bad JWT / webhook / callback / internal secret | `{"detail":"Unauthorized"}` |
| 403 | EFS browse outside `/app/raw_data`\|`/app/companies` | jail |
| 409 | H2H/risk busy; brain mine in progress | single-flight |
| 413 | DCF upload > 50 MB | |
| 422 | invalid risk ticker (`_SAFE_RISK_AUDITOR_TICKER_RE`) | |
| 429 | `Container at capacity (3 reports). Retry on another instance.` | ALB-safe |
| 503 | shutting down | drain |
