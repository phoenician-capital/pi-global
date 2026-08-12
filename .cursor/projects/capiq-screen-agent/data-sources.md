# Data sources — capiq-screen-agent

| Source | What | Kind |
|--------|------|------|
| CapIQ.com (browser) | Extension context — company page entity detect | UI |
| CapIQ Snowflake `MI_XPRESSCLOUD` | Financials, IDs, mcap, industry, ownership/price feeds | data_fetch_market |
| Yahoo Finance (`yahoo-finance2`) | Live quotes, FX, sector | data_fetch_market |
| Anthropic web_search tool | Live web evidence for chat/screen/auditor | data_fetch_web |
| SQLite DBs | memory / screening / financials / live-prices | internal SoT |
| Anthropic Managed Memory | raw + curated Dream stores | memory write/read |
| CapIQ Excel dumps (sibling PM2) | Ingest into financials/universe via `phoenician-capiq` | market → write |
| Chat transcripts / observations | From PM debates | write internal |
| Portfolio holdings list | `portfolio-holdings.js` static list for context | local |

≠ PI EFS CapIQ dumps; ≠ Linker companyId cache; ≠ portfolio `inputs/capiq/`.
