# Architecture — capiq-screen-agent

## Components

| Path | Role |
|------|------|
| `extension/` | MV3 content + service worker + popup; CapIQ overlay chat; `dashboard-bridge.js` |
| `backend/` | Express API (`server.js`), screening worker, SQLite, prompts, jobs |
| `backend/src/` | Domain slice (auditors) + composition root |
| `dashboard/` | SPA: Memory / Screening / Brain / Sessions (+ PWA) |
| `aws/` | Deploy, nginx (`capiq.conf`), PM2 CapIQ download configs, ops scripts |
| `snowflake-mcp/` | Read-only CapIQ Snowflake MCP + small web UI (`:4310/:4311`) — not public Express |

## Process model (prod)

```
systemd → pm2-ec2-user.service
 └── PM2
      ├── capiq-agent          :3001  (prod John)
      ├── capiq-agent-staging  :3002  (GLM bake-off)
      ├── capiq-agent-mk       :3003  (Danny/MK isolated DBs)
      ├── capiq-agent-llama    :3004  (DeepSeek desk)
      └── capiq-tunnel         cloudflared → localhost:3001
nginx 443 13-62-39-214.sslip.io
  → :3001 | /glm→:3002 | /mk→:3003 | /llama→:3004
```

In-process (not separate OS processes): screening worker, live-price refresh (15m), split-repair sweep, NE auto-rescore, screenBus webhooks, optional Dream scheduler.

## Data stores (host paths)

| DB | Role |
|----|------|
| `memory.db` | Investor profiles, mindNarrative, observations, companyComments |
| `screening.db` | ~16k universe, runs, claims, NE/shadow/corrections |
| `financials.db` | Financials explorer |
| `live-prices.db` | Yahoo/live quote cache |
| MK isolation | `data-mk/` |
| Anthropic Managed Memory | raw + curated stores (Dreams) |

Typical host root: `/home/ec2-user/capiq-agent/backend/data/`. CapIQ dump ingest may also touch `/home/ec2-user/phoenician-db/`.

## Stack

Node ESM + Express · `better-sqlite3` · Anthropic SDK (+ Managed Agents / Dreams betas) · optional Z.AI/GLM, DeepSeek, OpenRouter, OpenAI judges · `yahoo-finance2` · CapIQ Snowflake reader · **no Playwright inside this Express app**.
