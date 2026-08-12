# Links — capiq-screen-agent

| Direction | Edge | Evidenced |
|-----------|------|-----------|
| ← PI FE | iframe `CAPIQ_EMBED_URL` → sslip `/dashboard/` (+ postMessage ticker) | yes |
| ← PI .NET | `ScreenAgentClient` → `GET /screen/universe` | yes |
| → PI | Watch webhook `PHOENICIAN_WEBHOOK_URL` + `X-Webhook-Key` | yes |
| ↔ CapIQ.com | Chrome extension content scripts | yes |
| → CapIQ Snowflake | reader queries | yes |
| → Yahoo | quote-feed / live-price | yes |
| → Anthropic / GLM / DeepSeek / OR / OpenAI | LLMs + Managed Memory | yes |
| Sibling on EC2 | `phoenician-capiq` download PM2 → S3 | yes |
| ← PI Python | investor memory SSH/SQLite (CIO memory) historically on Screen EC2 | see PI `call-architecture` |
| Linker | **no** direct edge in this tree | — |
