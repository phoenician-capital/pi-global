# docker-compose & scripts (final pass)

## Compose

| tree | services / ports |
|------|------------------|
| `Earnings_tracker/docker-compose.yml` | `postgres:5432`, `api:8001`, `web:5173` (db `earnings_tracker`) |
| `investor-portal-backend/backend/docker-compose.yml` | `postgres:5432`, `api:8080` (db `phoenician_capital`) |
| Note | `Earnings_tracker/web/docker-compose.yml` near-duplicate; api build context under `web/` looks broken vs root |
| Others | No other compose files in reference trees |

## Makefile (only one found)

`phoenician-intelligence/Makefile`: `clean`, `bootstrap` (uv + spacy `en_core_web_lg`), `setup-typescript`, `setup`, `install`

## Important CLIs / npm

| package | scripts |
|---------|---------|
| portfolio_manager | `pm-serve`, `portfolio-manager`, `pm-resolve-universe` |
| capiq-downloader | `capiq-downloader` |
| earnings_predictor | `ep-ingest`, `ep-market`, `ep-spine`, `ep-forecast`, `ep-predict` |
| FE packages | `dev`/`build`/`preview`; PI FE + vitest; portfolio FE + `check`+`test`; FA + oxlint; mobile `start` / EAS |
| statement-split | `probe` / `split` |
| pi-global | `dev`/`build`/`preview`/`check` |
