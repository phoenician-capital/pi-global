# phoenician-mail-sender

Standalone IR workstation app for composing and bulk-sending personalized emails via Microsoft Graph (`ir@phoeniciancapital.com`).

**Bind model:** loopback only (`127.0.0.1`) — not for public hosting. Portal twin: admin `/ir-mail` + `IrMailService`.

Browser (Vite) → relative `/api` (proxy injects `X-Api-Key`) → FastAPI `:8010` → Graph `sendMail` (client_credentials preferred; ROPC gated).
