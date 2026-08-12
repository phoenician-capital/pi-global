# Completeness checklist (call-architecture pass)

Audited against all **11** reference trees (incl. `capiq-screen-agent`) + pi-global app. Status: **filled for known gaps + deep inventories + call kinds + Screen**.

| Area | Covered? | Where |
|------|----------|-------|
| Call taxonomy + platform heatmap | ✅ | `systems/call-taxonomy.md`, `systems/call-architecture.md` |
| Per-project call-architecture (all trees) | ✅ | `projects/*/call-architecture.md` |
| CapIQ Screen Agent (full KB + calls) | ✅ | `projects/capiq-screen-agent/*` · `systems/cap-iq-and-screen.md` |
| Interactive ecosystem map (pi-global UI) | ✅ | `src/lib/ecosystem/*` + `CommandCenter` · 36 nodes / 57 edges / 9 journeys |
| PI Python architecture / API / AI / deploy | ✅ | `projects/phoenician-intelligence/*` |
| PI section DAG + engines + H2H/RA + Langfuse + Docker | ✅ | `section-map.md` |
| PI Python FastAPI route table | ✅ | `python-api-routes.md` |
| PI Brain 27 skills + mine/approve | ✅ | `brain-skills.md` |
| Prefetch phases | ✅ | `prefetch.md` |
| PI .NET controllers / DbSets / seed / hosted | ✅ | `controllers-inventory.md` |
| PI FE routes / services / storage keys | ✅ | `routes-inventory.md` |
| Portfolio two-book + kb 00–14 + tiny logic | ✅ | `phoenician-portfolio/*` |
| Portfolio strategy/server/FE/EP module trees | ✅ | `module-map.md` |
| earnings_predictor CLIs/stages/parquet | ✅ | `earnings-predictor.md` |
| capiq-downloader 43 artefacts | ✅ | `capiq-downloader.md` |
| Earnings_tracker Lambda/web + modules/DB | ✅ | `module-map.md`, `web-routes.md` |
| Linker CLI+web+BIFF+qual + modules | ✅ | `module-map.md`, `qualitative-cache.md` |
| Factsheet copy + components + years | ✅ | `fund-copy.md`, OVERVIEW |
| Portal enums / features / Hangfire / services | ✅ | `domain-enums.md`, `features-inventory.md` |
| Portal admin + investor routes | ✅ | `admin-routes.md` |
| Portal AI extractors (class→model) | ✅ | `ai-prompting.md` |
| PI .NET DevOps Anthropic prompts | ✅ | `phoenician-intelligence-backend/ai-prompting.md` |
| Cross-project AI & calls atlas (UI) | ✅ | `PromptAtlas` · primary nav **AI & calls** · `intelligence.js` |
| DD per-section calls / prompts (UI+data) | ✅ | `ddSections.js` · Product guides → DD engine → **DD sections** |
| Screener own map box + Earnings in Research hub | ✅ | `domains.screener` · Earnings → `intelligence` · Side tools = Factsheet+Mail only |
| Mobile both forks screens/services/versions | ✅ | `screens-inventory.md` |
| Mail sender modules | ✅ | `module-map.md` |
| Linkage / AWS / URLs / auth / CapIQ map | ✅ | `systems/*` |
| Compose / Make / npm CLIs | ✅ | `compose-and-scripts.md` |
| Deep inventory index | ✅ | `systems/deep-inventory.md` |
| Tiny logic v3 + gap v4 | ✅ | tiny-logic + http-status/prompts/fx/… |

## Intentionally not copied into KB
- Secret **values** (keys, passwords, Firebase JSON contents, seed CSVs)
- Full Jinja prompt bodies (fragments only — see `prompts-tiny.md`)
- Entire portfolio `.cursor/kb` verbatim (condensed in `kb-invariants.md`; open local tree for surgery)
- Binary assets / node_modules / build outputs
- Exhaustive listing of every Python `@app.*` decorator beyond the representative table (~84 routes in `api/main.py` — browse source for rare admin variants)

## Call-architecture corrections captured
- Portal transactional email = **Resend**, not SES.
- Portal live e-sign = **DocuSeal**; DocuSign class present but not DI-wired.
- Only PI Python has `embedding_rag`.
- Linker Flask has **no** LLM; qualitative Claude is CLI-only.
- PI FE has **no** `reasoning_llm` (BFF/proxy only).

## If something still feels missing
1. Check `systems/call-architecture.md` then `systems/deep-inventory.md` then `systems/tiny-logic-index.md`.
2. Grep under `.cursor/projects/<name>/`.
3. Only then open the gitignored reference source tree.
