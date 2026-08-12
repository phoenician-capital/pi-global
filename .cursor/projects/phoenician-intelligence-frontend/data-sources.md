# Data / env — PI FE

| Source | Env |
|--------|-----|
| .NET | `VITE_API_URL` |
| Python | `VITE_API_BASE_URL`, `VITE_FASTAPI_BASE_URL` |
| FMP | `VITE_FMP_BASE_URL`, `VITE_FMP_API_KEY` |
| Yahoo RapidAPI | `VITE_YAHOO_FINANCE_API_KEY` |
| Embeds | `VITE_PORTFOLIO_*`, `VITE_EARNINGS_TRACKER_URL`, `VITE_CAPIQ_EMBED_URL`, `VITE_SCREEN_COST_EMBED_URL` |
| PDF | `VITE_PDF_OPEN_PASSWORD` |
| TTS | `VITE_TTS_API_URL`, `Open_AI_tts` (dev) |

**Note:** GHA may bake `VITE_*` keys at build — treat as secret inventory.
