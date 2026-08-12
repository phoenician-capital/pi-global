# HTTP status — Earnings_tracker (v4)

| code | when |
|-----:|------|
| 201 | company create |
| 400 | bad date (need YYYY-MM-DD) |
| 403 | API key required / invalid |
| 404 | not_found scrape code |
| 409 | locks (known) |
| 502 | serpapi_quota |
| 503 | scrape_service_unavailable |
| 504 | timeout |
| 500 | internal_error |

Friendly: `full_run_in_progress`, `company_being_updated`, `serpapi_quota`, `timeout`, `webcast_no_url`, …

Health: `GET /api/health` → `{"status":"ok","db": <bool>}`
