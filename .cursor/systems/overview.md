# System overview (v2)

**AWS account:** `578736536410` · **Primary region:** `eu-north-1`  
**Exceptions:** Linker Lightsail `eu-central-1` (`63.184.47.249`); GCP Vertex RAG via WIF (project `461776887688`).

## Glue (one line)

**PI FE (S3/CF `E2CF5P57BJV2U3`)** → **.NET EB `phoenician-api-prod`** → **Python ECS `phoenician-intelligence-service`** + embeds (Portfolio Amplify `d13pt3zp42x49n`, Earnings CF `d2iniwuj4wwgj0`, CapIQ `13-62-39-214.sslip.io`, Linker `/linker`).

## Clusters

### A — Phoenician Intelligence

| Piece | Runtime | Notes |
|-------|---------|-------|
| SPA | S3 `phoenician-capital-frontend` + CF | `pi.phoeniciancapital.com` |
| .NET BFF | EB `phoenician-capital-api` / `phoenician-api-prod` | PathBase `/api`, RDS `investor_platform_db` |
| Python DD | ECS cluster/service `phoenician-intelligence-*` | FastAPI, 2 uvicorn workers, LibreOffice+Playwright |
| Shared FS | EFS `fs-069a92a202a9402c5` | `companies/`, `raw_data/` |
| Secrets | `phoenician-ai-api-keys` (+ callback secret) | `PI_DD`, `PI_CHATBOT`, … |

### B — Portfolio

| Piece | Runtime |
|-------|---------|
| SPA | Amplify `d13pt3zp42x49n` (GHA zip, not git-connected) |
| API | ECS Express `pm-serve-1b08`, ECR `pm-serve` |
| Books | S3 `phoenician-capital-strategy` (`STORE_READ=s3`) |
| Tips | Redis LIVE; Aurora dual-write mirror |

### C — Investor Portal

| Piece | Runtime |
|-------|---------|
| Web | CF + S3 `invest.phoeniciancapital.com` |
| API | WAF→ALB→ECS Fargate `portal-api.phoeniciancapital.com` |
| Mobile | Expo forks (nested + standalone) — **not in sync** |
| Docs | S3 `phoenician-capital-documents` + quarantine |
| Strategy book | Dynamo `phoenician-capital-strategy-book` ← S3 `custom/book.json` |

### D — CapIQ Screener (peer product — own map box)

| Piece | Runtime | Notes |
|-------|---------|-------|
| Screen Agent | EC2 `13.62.39.214` · PM2 `:3001–3004` · sslip HTTPS | Chrome ext + Express dashboard, Pass/Watch ~16k, Dreams — KB `projects/capiq-screen-agent/` |
| Linker | Lightsail `63.184.47.249` · CF `/linker*` | CapIQ hyperlink injector (+ CLI qualitative) — sits in Screener cluster on the map |
| Local DBs | SQLite on EC2 | `memory.db` + `screening.db` |

### E — Ops satellites

| Product | Role |
|---------|------|
| Earnings_tracker | Lambda+Postgres calendar/summaries; CF `earnings.phoeniciancapital.com` |
| Factsheet-Automation | Client PDF/Excel; static John's weights + FMP |
| phoenician-mail-sender | Loopback Graph IR; twin = portal `/api/ir-mail` |
| **pi-global** | Infra graph site Amplify `d3w0s20ak7lflk` |

## Auth (short)

| Boundary | Mechanism |
|----------|-----------|
| PI | JWT HS256 + OTP; cookie `pi_auth` for Linker |
| Python | Same JWT or `X-Internal-Secret` / `X-Callback-Secret` |
| Portal | Separate JWT + OTP/TOTP (**not Cognito**) |
| Earnings writes | `X-API-Key` |
| Mail local | `X-Api-Key` + loopback |
| Portfolio mutations | Optional `STRATEGY_TRIGGER_TOKEN` |
| CapIQ Screen | `dash_sess` / embed trust from PI origin; often `DASHBOARD_AUTH_DISABLED` |
