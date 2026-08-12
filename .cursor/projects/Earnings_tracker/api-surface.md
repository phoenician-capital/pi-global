# API — Earnings_tracker

| Method | Path |
|--------|------|
| GET | `/api/health`, `/api/auth/status`, `/api/stats`, `/api/scrape-runs`, `/api/events`, `/api/companies`, `/api/companies/all`, summaries, deletion-status, `/api/operations/status` |
| POST | companies, rescrape, webcast-refresh, tracker/run, calendar-invite, summaries/generate(+scheduled) |
| PATCH | `/api/companies/{ticker}/active` |
| DELETE | `/api/companies/{ticker}` |

Writes need `X-API-Key` in production.
