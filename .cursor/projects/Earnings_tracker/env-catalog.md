# Env catalog — Earnings_tracker (names only)

| Name | Role |
|------|------|
| `OPENAI_API_KEY` | Often holds DeepSeek key (SDK base `api.deepseek.com`) |
| `SUMMARY_API_URL` | Production API base for summary auto-gen |
| `SUMMARY_AUTO_MAX_BATCHES` | Batches per hourly cron (default `6`) |
| `X-API-Key` / API key env | Write auth for scrape/actions routes |
| DB URL / RDS vars | Postgres for `companies` + `earnings_events` |

Full examples: local `Earnings_tracker/.env.example`, `lambda_env_exemple.json` (do not commit values). Behavior: `tiny-logic.md`.
