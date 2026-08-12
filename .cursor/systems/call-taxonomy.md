# Call taxonomy (shared labels)

Every project `call-architecture.md` uses these **exact** `call_kind` labels.

| Kind | Meaning | Typical examples |
|------|---------|------------------|
| `reasoning_llm` | Model **generation** (chat/completions, messages, judge, qualitative) | Claude, OpenAI, DeepSeek, Gemini write, Grok, Perplexity sonar |
| `embedding_rag` | Embeddings / vector / file-search retrieve (not free-form write) | Vertex AI Search, Gemini File Search, AlphaSense RAG |
| `data_fetch_market` | Market / vendor financial data | CapIQ Playwright, Yahoo/yfinance, FMP, Finnhub, shorts, FX |
| `data_fetch_web` | Open web search/scrape (non-market vendor portals) | SerpAPI, ScraperAPI, SEC EDGAR, IR Playwright, CSE |
| `data_fetch_internal` | Read own platform stores | RDS, Dynamo, EFS, S3 get, own BFF APIs |
| `data_write_internal` | Persist to own stores | RDS/EF SaveChanges, S3 put, EFS progress, Dynamo put |
| `auth_identity` | Login, tokens, OTP, TOTP, HIBP, vendor login bots | JWT issue, SMTP/Resend OTP, CapIQ login, Graph token |
| `realtime_push` | Live channels to clients | SignalR, SSE, Redis tip bus, Expo/FCM send, Graph SSE |
| `proxy_forward` | HTTP hop that mostly relays | .NET→Python proxy, CF→Lightsail, Vite→API key inject, docs proxy |
| `job_orchestrate` | Submit / cancel / poll / schedule work | Report generate, Hangfire, EventBridge→Lambda, ECS task protection |
| `binary_media` | Files as product | PDF/xlsx export, TTS audio, CapIQ Excel, S3 presign download |
| `billing_vendor` | Vendor spend/usage sync | Anthropic/OpenAI/AWS CE/BigQuery billing adapters |
| `health_ops` | Health, diagnostics, CSP, version gates | `/health`, EFS explore, iTunes version |
| `other` | Needs subtype | `other:embed`, `other:graph_mail`, `other:esign_vendor`, `other:transactional_email`, `other:workflow` |

## How to read a call-architecture doc

1. **Kind counts** — how the project’s external surface is skewed (LLM-heavy vs fetch-heavy).
2. **Dense table** — distinct caller→callee edges (not every overload).
3. **Mermaid** — runtime architecture for that project.
4. Cross-system edges live in [`call-architecture.md`](./call-architecture.md).

## Never confuse

| A | B |
|---|---|
| `reasoning_llm` | `embedding_rag` (retrieve ≠ generate) |
| CapIQ Playwright (`data_fetch_market`) | CapIQ Screen agent embed (`other:embed`) |
| Portal Resend OTP (`other:transactional_email`) | IrMail Graph (`other:graph_mail`) |
| Earnings_tracker DeepSeek | portfolio `earnings_predictor` LLMs |
| FE iframe navigate | BFF `proxy_forward` |
