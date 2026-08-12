# Tiny logic — PI Frontend (v3)

## Constants

| symbol | value | meaning |
|--------|------:|---------|
| IDLE_TIMEOUT_MS | 2h | inactivity logout |
| IDLE_CHECK_INTERVAL_MS | 30s | idle poll |
| ACTIVITY_TOUCH_THROTTLE_MS | 5s | |
| Heartbeat INTERVAL_MS | 30s | presence |
| TICKER_LIST_TTL_MS | 24h | |
| PRICE_TTL_MS | 15m | |
| ticker list poll | 30s | |
| SESSION_CACHE_TTL_MS | 30s | universe search |
| SESSION_CACHE_SIZE | 40 | |
| Risk POLL_INTERVAL_MS | 5s | |
| prompt-lab poll | 3s | |
| status mapPool | 3 | RisksWorkspace |

## Cache keys (`ph_*` / `pi_*`)

`ph_ticker_list_v10` (24h) · `ph_prices_v3` / `ph_init_prices_v4` (15m) · `ph_report_*` · `ph_h2h_{ticker}` · `ph_company_sources_v1_*` · `ph_dataroom_v2_*` · `pi_last_activity_at` · `pi_activity_session_id` · `pi_diligence_table_v1` · `pi_risk_table_v1` · `authToken`/`authUser`/`rememberEmail`

Clear all `ph_*` on load/logout.

## Workspace / authz logic

- CapIQ email → Screen; INVESTOR|DEVELOPER → Diligence+Risks; email lists → Portfolio/Earnings/Costs
- Home: ≥2 workspaces → `/hub`; else DEVELOPER→`/requested-ticker`, INVESTOR→`/dashboard`, CLIENT→`/request-ticker`
- postMessage in: `PI_REQUEST_TICKER`; out: `PI_REQUEST_TICKER_RESULT`
- CapIQ readonly: `?embed=1&mode=readonly`
- Cost embeds: Portfolio `/cost`; Screen `?section=costs&embed=1`

## Allowlists (names)

CAPIQ: rr,jk,aa,ea · readonly: mk, thomaskhabbaz@gmail.com  
Brain viewers: mk,jk,aa,ea (+DEV) · mining: rr,ea  
Portfolio/Earnings: jk,rr,ea,mt,mk,aa,pr  
Costs: jk,aa,mk (+DEV) · Activity: rr,jk (**no** DEV bypass)

## UI state mirrors backend

on-watch / in-coverage / PROCESSING · screening GENERATING|COMPLETED|FAILED · H2H/risk/playbook enums as backend


## v4 gap files

`postmessage.md`, `timers.md`, `edge-cases.md`.
