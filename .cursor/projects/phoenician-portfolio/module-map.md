# Module map — phoenician-portfolio

## `portfolio_manager` packages

### Top-level (`src/portfolio_manager/`)

`benchmark`, `books`, `cache_ttl`, `cli`, `debate/`, `dollar_volume_store`, `durable_pins`, `earnings_bridge`, `earnings_live_book`, `engine/`, `exec_replay_cache`, `fill_journal`, `insiders/`, `liquidity`, `live_intrinsic`, `live_quotes`, `live`, `market_close`, `performance/`, `pi_client`, `pi_orchestrator`, `prices`, `rates`, `rebalance`, `redis_hot`, `serve_cache`, `server/`, `store_pg`, `store_pg_reconcile`, `strategy/`, `technical_trader/`, `universe`, `universe_run`, `universe_stage0`, `ytd_reset/`.

### `strategy/`

| Area | Modules |
|------|---------|
| Top-level | `cache`, `claude`, `config`, `cost`, `deepseek`, `inputs`, `lessons_ingest`, `providers`, `simulate`, `stage0`, `store`, `telemetry`, `validate` |
| `pipeline/` | `company`, `core`, `errors`, `research`, `risk`, `scoring`, `stages` |
| `models/` | `allocation`, `assessment`, `constants`, `critique`, `risk`, `stage0` |
| `reflect/` | `apply`, `prompts`, `runner`, `schemas` |
| `forecast_grade/` | `aggregate`, `constants`, `extract`, `grade`, `llm`, `windows` |
| `lessons/` | `constants`, `critique`, `divergence`, `math`, `outcomes`, `schemas`, `serve` |
| `prompts/` | `book`, `company`, `helpers`, `objective`, `risk`, `stage0` |

### `server/`

`bootstrap`, `helpers`, `payload`, `shared`, `_handler_shared`, `stage0_ui`, `state_default`, `state_universe`, `handler/{get,post,http}`.

## Frontend routes (`portfolio_manager_frontend/src/routes/`)

`/`, `/book`, `/cost`, `/debate`, `/execution`, `/graphs`, `/inception`, `/insiders`, `/insights`, `/lessons`, `/lessons/cost`, `/library`, `/method`, `/performance`, `/signals`, `/trades`, `/universe`, `/universe/cost`, `/universe/method`, `/universe/performance`, `/universe/trades`.

### `src/lib/sections/`

`CompareGraphs`, `CompareInception`, `ComparePerformance`, `CompareTrades`, `InsightsEarnings`, `InsightsInsiders`, `InsightsTradePlan`, `LibraryCost`, `LibraryMethod`.

## `earnings_predictor` packages

`calendar`, `calibration`, `config`, `filings` (+`adapters`), `forecast`, `fx`, `ingest`, `llm_battery`, `macro`, `market`, `net`, `nowcasts`, `predict`, `shorts`, `signals`, `spine`, `tidy`.

See also `earnings-predictor.md` (CLIs/stages/parquet) and `capiq-downloader.md` (43 artefacts).
