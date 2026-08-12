# API surface — capiq-screen-agent

~100 handlers in `backend/server.js`. Highlights:

## Auth / static / embed

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/__login` | Dashboard login → `dash_sess` |
| GET | `/__logout` | Clear session |
| GET | `/dashboard/*` | Static dashboard |
| GET | `/dashboard/config` | Public config JSON |
| GET | `/screen`, `/costs` | Embed redirects → dashboard sections |
| GET | `/tunnel-url` | Live Cloudflare tunnel URL |

## Chat / research

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/chat-opener`, `/chat-turn`, `/suggest`, `/chat-finish` | Agent chat loop |
| POST/GET | `/chat-transcript*` | Persist/restore open transcript |
| POST | `/prefetch-company` | Warm research cache |
| GET | `/company-research` | Cached research |
| POST | `/upload` · GET `/attachment/:investorId/:id` | Attachments |

## Investor memory

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/investor/:id/{profile,observations,mind-narrative,company-comments,summary,export.*}` | Memory reads |
| POST | `/refresh-mind` | Re-synth mind |
| GET | `/latest-profile` | Slim poll payload |
| GET | `/dashboard/stats` | Sidebar stats |

## Screening

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/screen/universe` | Filtered universe (**PI .NET uses this**) |
| GET | `/screen/stream` | SSE live updates |
| GET | `/screen/summary`, `/prices`, `/company/:ticker(*)`, facets | Reads |
| POST | `/screen/run`, `/screen/as-of/run` | Queue screen |
| GET | `/screen/run/:id`, `/runs`, `/active` | Run status |
| POST | `/screen/shadow-rescreen`, `/john-agree-screener` | Shadow / adopt |
| GET/POST | `/screen/split-repair/*`, `/screen/live-prices/status` | Ops |
| GET/POST | `/capiq/search`, `/add-company`, `/screen`, `/bulk-add` | CapIQ helpers |

## NE / research / financials / compare / brain

| Area | Paths |
|------|-------|
| Next Evolution | `/ne-watch*`, `/ne/as-of/run` |
| Deep research | `/research/start`, `/research/company|session|active` |
| Financials | `/financials/search`, `/company/:ticker`, `/sheet/...`, `/all/...` |
| Compare | `/screen/compare-claude-glm*`, `/screen/compare-claude-llama*` |
| Brain/Dreams | `/admin/run-dream`, `/admin/brain/*`, `/admin/refresh-all*` |
| Cross-notes / events / playbooks / skills / usage | `/cross-notes*`, `/events*`, `/tasks*`, `/playbooks*`, `/admin/skills*`, `/admin/usage` |

Full list: local `docs/ARCHITECTURE.md` + `server.js`.
