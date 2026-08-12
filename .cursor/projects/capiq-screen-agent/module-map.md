# Module map — capiq-screen-agent

| File | Role |
|------|------|
| `backend/server.js` | All HTTP routes, auth, proxies, boot jobs |
| `backend/memory.js` | Investor SQLite profile |
| `backend/screening-db.js` | Universe, runs, claims, NE fields |
| `backend/screening-worker.js` | LLM screener |
| `backend/question-engine.js` | Chat/opener/extract prompts |
| `backend/llm.js` | Multi-provider Claude-compatible client |
| `backend/managed-agents.js` | Managed Memory + Dreams |
| `backend/raw-store-mirror.js` | Chat → raw store |
| `backend/webhooks.js` | Watch → PI |
| `backend/future-study.js` | Next Evolution scoring |
| `backend/financials.js` / `financials-metrics.js` / `financials-fx.js` | Financials + gates |
| `backend/quote-feed.js` / `live-price-*` / `capiq-price-feed.js` | Market data |
| `backend/capiq-*.js` | Search, screener, IDs, ownership, ADV, auditor facades |
| `backend/auditor-gate.js` + `src/domains/auditors/**` | Auditor quality gate |
| `backend/playbooks.js` / `skills-*.js` | Playbooks + skills |
| `backend/company-events.js` / `cross-notes.js` | Events/tasks / cross-notes |
| `backend/research.js` | Deep research Managed Agent |
| `backend/deepseek-screen.js` / `openrouter-screen.js` / `zai-web-search.js` | Alt providers |
| `backend/openai-*-judge.js` / `claude-llama-*.js` | Compare judges |
| `backend/jobs/nightly-dream.mjs` | Dream consolidation |
| `backend/jobs/backup-to-s3.sh` | S3 backups |
| `extension/{content,background,popup,dashboard-bridge}.js` | CapIQ UX + PI bridge |
| `dashboard/index.html` | Ops UI |
| `snowflake-mcp/src/*` | CapIQ Snowflake client/MCP |
| `aws/*` | Deploy + CapIQ download PM2 configs |
