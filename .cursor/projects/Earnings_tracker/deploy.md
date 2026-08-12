# Deploy — Earnings_tracker

| Piece | How |
|-------|-----|
| Scraper / summaries | AWS Lambda `earnings-tracker` |
| Weekly scrape | EventBridge `EarningsTrackerWeeklyTrigger` · `cron(0 8 ? * MON *)` |
| Hourly summaries | `EarningsTrackerSummaryTrigger` · `cron(0 * * * ? *)` · input `{"action":"generate_summaries"}` |
| Rule definitions | `deploy/eventbridge.json` |
| Web SPA | Static (S3+CloudFront / any static host) — see `web-routes.md` |
| API | Separate FastAPI (or Lambda-backed) — `api/routes/*`; writes gated by `X-API-Key` |

Summary retry window: 1h / 2h / 3h after event (each hourly cron = one attempt). Env names: `SUMMARY_API_URL`, `SUMMARY_AUTO_MAX_BATCHES` (default 6) — see `env-catalog.md`.
