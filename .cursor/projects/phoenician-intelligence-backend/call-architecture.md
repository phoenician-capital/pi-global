# Call architecture — phoenician-intelligence-backend (.NET)

BFF between PI FE and Python. PathBase `/api`. Labels: [`systems/call-taxonomy.md`](../../systems/call-taxonomy.md).

## Kind skew

| Kind | ~edges | Role |
|------|-------:|------|
| billing_vendor | 7 | Anthropic/OpenAI/DeepSeek/Cursor/GCP/AWS CE + Slack alerts |
| job_orchestrate | 5 | Python report/jobs/brain + inbound callbacks |
| data_fetch_internal | 5 | RDS, EFS, S3, Python status, fallback poll |
| data_write_internal | 4 | EF SaveChanges, S3, EFS markers |
| auth_identity | 3 | JWT/OTP, SMTP mail, Secrets Manager callback secret |
| proxy_forward | 2 | `/api/python/*`, DCF multipart forward |
| realtime_push | 2 | SignalR notes + SSE ticker status |
| data_fetch_market | 2 | Yahoo chart, Screen agent |
| binary_media | 2 | OpenAI TTS, DCF files |
| health_ops | 2 | Diagnostics, active-reports |
| reasoning_llm | 1 | Anthropic **log triage only** (DeveloperController) |
| other | 1 | ChatService persistence (no LLM) |

**.NET does not run DD reasoning** — only devops Anthropic analyze.

## Dense edges

| caller | callee | kind | purpose | auth |
|--------|--------|------|---------|------|
| `DeveloperController.AnalyzeError*` | api.anthropic.com/v1/messages | reasoning_llm | log triage | ANTHROPIC_API_KEY |
| `MarketDataController` | query1.finance.yahoo.com | data_fetch_market | quotes/hist | none |
| `ScreenAgentClient` | Screen Agent `GET /screen/universe` (default `http://13.62.39.214:3001`) | data_fetch_internal | universe search for PI | none; 2500ms; Postgres fallback — see `capiq-screen-agent/` |
| EF / controllers | RDS `investor_platform_db` | data_fetch_internal / write | entities | conn string |
| `EfsService` | EFS `/app/companies` | data_fetch_internal / write | reports/markers | mount |
| `S3Service` | S3 uploads bucket | data_fetch_internal / write | presign/get/put | IAM |
| `PythonReportService.Get*` | Python reports/status/efs/IR | data_fetch_internal | status/H2H/RA | callback secret |
| `ReportCallbackFallbackService` | EFS + Python active_reports | data_fetch_internal | orphan poll | hosted |
| `AuthService` + AuthController | JWT + OTP | auth_identity | login/invite/reset | bcrypt+JWT |
| `EmailService` | SMTP / MailKit | auth_identity | OTP + transactional | SMTP |
| Internal controllers | Secrets Manager `phoenician/callback-secret` | auth_identity | shared secret | IAM |
| `CompanyNotesHub` `/hubs/company-notes` | SignalR clients | realtime_push | Yjs CRDT | JWT |
| `TickerRequestController.StatusStream` | SSE | realtime_push | report status | JWT query token |
| `PythonProxyController` | PythonApi BaseUrl | proxy_forward | FE→Python stream | FE JWT |
| Companies DCF upload | Python dcf-upload* | proxy_forward | multipart | JWT |
| `PythonReportService` generate/cancel/H2H/RA | Python `/api/reports/*` | job_orchestrate | DD jobs | callback secret |
| `JobsController` | Python `/jobs/*` | job_orchestrate | notes AI jobs | JWT |
| Brain playbooks/skills | Python `/api/brain/*` | job_orchestrate | mine/compile | callback secret |
| `CallbacksController.ReportCompleted` | inbound Python | job_orchestrate | completion sink → SSE | callback secret |
| `TextToSpeechController` | OpenAI `/v1/audio/speech` | binary_media | TTS | Open_AI_tts |
| VendorBilling adapters | Anthropic/OpenAI/DeepSeek/Cursor/BQ/AWS CE | billing_vendor | spend sync | vendor keys |
| `SlackAlertService` | Slack webhook | billing_vendor | budget alert | webhook |
| Diagnostics / Developer | EFS + Python status | health_ops | ops | JWT developer |
| `ChatService` | RDS only | other:persistence | chat CRUD — **no LLM** | JWT |

## Architecture

```mermaid
flowchart LR
  FE[PI FE] -->|JWT| API[Controllers]
  FE -->|SSE| SSE[StatusStream]
  FE -->|WS| HUB[CompanyNotesHub]
  API --> RDS[(RDS)]
  API --> EFS[(EFS)]
  API --> S3[(S3)]
  API --> YAHOO[Yahoo]
  API --> SCREEN[Screen :3001]
  API --> TTS[OpenAI TTS]
  API --> BILL[Vendor billing]
  API -->|PythonReport / Jobs / Brain| PY[Python ECS]
  PROXY[/api/python proxy] --> PY
  PY -->|callbacks| API
  API --> SMTP[SMTP OTP]
```

## Never under `/api/hubs/`

SignalR path is **`/hubs/company-notes`** (outside PathBase quirk) — see `realtime.md`.
