# earnings_predictor (final pass)

Standalone advisory package — **never → book ER/weights**. Bridge: Phoenician-locked live book; AI weights diagnostic-only; never hollow CapIQ on scrape fail; never orphan `phoenician-capiq-data-*`.

## Pipeline STAGES
`capiq_download → ingest → tidy → market_spine → p0_spine → priced_in → forecast → snapshot`

**HARD_STAGES (fail-closed):** `{ingest, tidy, market_spine, forecast}` · `capiq_download` hard only with `--refresh-capiq`

## CLIs (`pyproject` console scripts)
| CLI | subs / notes |
|-----|----------------|
| `ep-ingest` | `capiq-ui`, `tidy`, `tidy-verify` |
| `ep-market` | `spine`, `prices`, `moves`, `options`, `verify` |
| `ep-spine` | `spine`, `fx`, `macro`, `filings`, `shorts`, `verify` |
| `ep-forecast` | `stack`, `insider-llm`, `calendar`, `verify` (+ helpers) |
| `ep-predict` | `--refresh-capiq` → `capiq-downloader download-book`; skip flags for stages |

## Models
| role | default | env |
|------|---------|-----|
| Judge | `claude-sonnet-5` | `CLAUDE_EARNINGS_MODEL` / `CLAUDE_SYNTHESIS_MODEL` — **any opus forced → sonnet** |
| Insider | `claude-opus-5` | `CLAUDE_INSIDER_MODEL` |
| Effort | `high` | `CLAUDE_*_EFFORT` ∈ low/medium/high/xhigh/max |
| Calendar extract | `deepseek-chat` | `DEEPSEEK_MODEL` |

## S3 / data
- Prefixes: `inputs/capiq/companies/`, `inputs/earnings/` (`EARNINGS_DATA_DIR`)
- Hard refresh accounts: `CAPIQ_BOOK_ACCOUNTS=1-10` fail-closed if secret has &lt;10 accounts

## Parquet / table names (main)
`dim_company`, `artifact_catalog`, `raw_xls/<t>/<art>__<sheet>`, `rtf_documents`, `events_calendar`, `key_developments`, `surprise_eps`, `guidance_headlines`, `empty_sentinels`, `fact_estimates`, `fact_actuals`, `dim_event`, `week1_checklist`, `expectations`, `fact_prices_daily`, `event_moves`, `options_implied_*`, `fact_fx_daily`, `fact_macro_*`, `fact_filings`, `book_shorts*`, `fact_signal_stack`, `fact_nowcasts*`, `insider_llm_*`, `book_predictions`, `prediction_log`, `scorecard`, `lessons`, `event_clock`, `next_events*`
