# Tiny-logic index (v4)

## Per-project files

| Project | Core | Gap layer (v4) |
|---------|------|----------------|
| phoenician-intelligence | `tiny-logic.md` | `http-status.md`, `prompts-tiny.md`, `s3-efs-keys.md`, `concurrency.md`, `edge-cases.md` |
| phoenician-intelligence-backend | `tiny-logic.md` | `http-status.md`, `realtime.md`, `timers.md`, `edge-cases.md` |
| phoenician-intelligence-frontend | `tiny-logic.md` | `postmessage.md`, `timers.md`, `edge-cases.md` |
| phoenician-portfolio | `tiny-logic.md`, `kb-invariants.md` | `http-status.md`, `prompts-tiny.md`, `fx-currency.md`, `s3-keys.md`, `timers.md`, `test-goldens.md` |
| Earnings_tracker | `tiny-logic.md` | `http-status.md`, `edge-cases.md` |
| Linker | `tiny-logic.md` | `excel-layout.md`, `capiq-urls.md`, `edge-cases.md` |
| Factsheet-Automation | `tiny-logic.md` | `localStorage.md` |
| investor-portal-backend | `tiny-logic.md` | `http-status.md`, `password-policy.md`, `naming.md`, `docuseal.md`, `cors.md` |
| investor-portal-mobile | `tiny-logic.md` | `edge-cases.md` |
| phoenician-mail-sender | `tiny-logic.md` | `http-status.md`, `excel-layout.md` |
| **capiq-screen-agent** | `tiny-logic.md` | `call-architecture.md`, `auth.md`, `api-surface.md` |

## Never confuse (expanded)

| A | B |
|---|---|
| Portfolio score | Linker CapIQ /100 |
| Factsheet reweight | Portfolio validate bands |
| Earnings_tracker | portfolio earnings_predictor |
| PI P/V gate 0.3–3 | Portfolio display P/V |
| Portal JWT 15m | PI JWT ExpiryHours≈24 |
| TRADE_EPS / STATUS_BAND / FE 0.15pp | three different closenesses |
| GBp÷100 (pence) | JPY tip×FX (yen) |
| SignalR `/hubs/company-notes` | never `/api/hubs/` |
| EFS `.pending_updates` double-nest on EB | `companies/companies/` path quirk |
| Screen Pass/Watch + NE≥61 | Linker CapIQ /100 · Portfolio score |
| Screen Express `:3001` | Linker Lightsail · PI CapIQ Playwright |


## Final-pass additions

| File | Topic |
|------|-------|
| `phoenician-portfolio/earnings-predictor.md` | EP stages, CLIs, parquet, models |
| `phoenician-portfolio/capiq-downloader.md` | 43 artefacts, multi-account |
| `phoenician-intelligence/brain-skills.md` | 27 skills, mine/approve |
| `phoenician-intelligence/prefetch.md` | Phase 1/2 prefetch |
| `investor-portal-backend/tools.md` | statement-split/sync, book lambda |
| `investor-portal-backend/admin-factsheet.md` | vs Factsheet-Automation |
| `Earnings_tracker/web-routes.md` | SPA routes + polls |
| `Linker/qualitative-cache.md` | cache key = ticker only |
| `systems/compose-and-scripts.md` | docker-compose, Make, CLIs |
| `systems/COMPLETENESS.md` | coverage checklist |

## Call architecture (data fetch vs reasoning vs …)

| File | Topic |
|------|-------|
| `systems/call-taxonomy.md` | Shared `call_kind` labels |
| `systems/call-architecture.md` | Platform heatmap + cross-system mermaid |
| `projects/*/call-architecture.md` | Per-project dense caller→callee tables |

## Max-info deep inventories

| File | Topic |
|------|-------|
| `systems/deep-inventory.md` | Master index for this layer |
| `phoenician-intelligence/section-map.md` | Names, deps, engines, H2H, RA, Langfuse, Docker |
| `phoenician-intelligence/python-api-routes.md` | FastAPI route table |
| `phoenician-intelligence-backend/controllers-inventory.md` | Controllers, DbSets, seed, hosted |
| `phoenician-intelligence-frontend/routes-inventory.md` | Pages, services, storage keys |
| `phoenician-portfolio/module-map.md` | strategy/server/FE/EP trees |
| `investor-portal-backend/domain-enums.md` | All enum members |
| `investor-portal-backend/features-inventory.md` | Features, Hangfire, Infra, admin pages |
| `investor-portal-mobile/screens-inventory.md` | Both forks + versions |
| `Earnings_tracker/module-map.md` | tracker/api/web + DB cols |
| `Linker/module-map.md` | capiq/analysis + prompt opener |
| `Factsheet-Automation/fund-copy.md` | Components + fund statics + years |
| `phoenician-mail-sender/module-map.md` | Backend/FE modules |
| `capiq-screen-agent/*` | Screen agent full project + call architecture |
