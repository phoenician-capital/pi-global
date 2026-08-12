# CapIQ Screen Agent (`capiq-screen-agent`)

CapIQ Investor Intelligence Agent: Chrome extension on CapIQ pages + Node/Express backend + static dashboard. PM debates companies with an AI partner trained on their framework, screens ~16k names in the background, consolidates chat into SQLite + Anthropic Managed Memory / Dreams.

| | |
|--|--|
| Host | EC2 `13.62.39.214` · `eu-north-1` · instance `i-0ef36803457fc6db4` |
| Prod port | `:3001` (PM2 `capiq-agent`) |
| HTTPS | `https://13-62-39-214.sslip.io` (nginx → Express; also CF tunnel) |
| PI FE embed | `/dashboard/` (often `embed=1&mode=readonly`) |
| PI .NET | `ScreenAgentClient` → `GET /screen/universe` |

**Not the same as:** Linker Flask, PI CapIQ Playwright dumps, portfolio `capiq-downloader`. Sibling CapIQ download PM2 jobs live on the **same EC2** (`aws/*-download.config.js`) but are outside the Express app.

Local tree: gitignored `capiq-screen-agent/`. Docs: `README.md`, `docs/ARCHITECTURE.md`, `aws/DEPLOYMENT.md`, `DB-ACCESS.md`.
