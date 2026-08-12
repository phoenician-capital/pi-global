# AI / prompting map (v2 — model strings from source)

For **every** call kind (not just LLMs) — data fetch, RAG, jobs, Graph, push — see [`call-taxonomy.md`](./call-taxonomy.md) + [`call-architecture.md`](./call-architecture.md) + each project’s `call-architecture.md`.

## PI Python DD (`phoenician-intelligence`)

| Concern | Exact / typical |
|---------|-----------------|
| Main report | Claude `claude-sonnet-4-6` (+ opus/fable/haiku IDs in client registry) |
| Cheap path | DeepSeek **`deepseek-v4-flash` only** (pro ignored in code) |
| Agentic query gen | `AGENTIC_QUERY_MODEL = "claude-sonnet-4-6"` |
| RAG search | `gemini-2.5-flash-lite` (`GEMINI_SEARCH_MODEL` / `ALPHASENSE_SEARCH_MODEL`) |
| DCF LLM | `DCF_LLM_PROVIDER` ∈ `{claude, openai, grok}` |
| Web | Perplexity (`sonar-*`), DeepSeek web |
| Prompts | **~142 `.jinja`** under `templates/**`, `src/brain/prompts/**`, engine prompts, `src/n8n_helpers/prompts/**` |
| Section order | `[2,3,4,5,6,7,8,9,10,12,1,11]` |
| §8 UE-DCF | 8-step: discovery→RAG→constraints→codegen→sanity→review→compile→LibreOffice+P/V gate |
| Observability | Langfuse `@observe(name="REPORT_GENERATION")` |
| Chatbot helpers | `agentic_query`, `apply_modification`, `load_report`, `modify_section`, `notes_ai_query`, `query_report`, `search_excels`, `search_pdfs`, `suggest_modification` |
| RAG flags | `USE_VERTEX_AI_SEARCH`, `USE_GEMINI_FILE_SEARCH`, `USE_ALPHASENSE_RETRIEVAL`, `USE_AGENTIC_QUERIES`, `VERTEX_AI_SEARCH_ALLOW_FALLBACK` default **false** |

## Portfolio (`portfolio_manager`)

| Role | Model env / string |
|------|---------------------|
| Stages 0/1/2, debate, lessons | `claude-sonnet-5` family via `CLAUDE_MODEL` |
| Synthesis / refine / Stage-6 | `claude-opus-5` |
| Review | `claude-fable-5` |
| Optional universe-run | `deepseek-v4-flash` |
| Earnings judge | `claude-sonnet-5` (Opus rejected for judge) |
| Earnings insiders | `claude-opus-5` |

**Stage order:** 0→1→2→3→4→5→6(soft)→validate.  
**Prompt modules:** `portfolio_manager/src/.../strategy/prompts/{stage0,company,book,risk,objective,helpers}.py`, `strategy/reflect/prompts.py`.  
**Score:** `1.0*sharpe + 0.5*(effN/n) - tanh(target gap) - W_LIQ*liq_penalty`.  
**Never → ER/weights:** earnings, insiders, TT, debate, lessons (`injected=false`), P/V overlay, Graphs, CapIQ surprise forecasts, backtests.

## Earnings_tracker

DeepSeek via OpenAI SDK `base_url=https://api.deepseek.com`. Defaults vary: `deepseek-v4-pro` (finder/webcast/extract) vs `deepseek-chat` (summary constants). Key often stored as `OPENAI_API_KEY` pointed at DeepSeek.

## Linker

- CLI analyzer only: `claude-sonnet-4-6` (`CAPIQ_QUALITATIVE_MODEL`) → qualitative /40.  
- Web Flask linker: **no LLM**.

## CapIQ Screen Agent (`capiq-screen-agent`)

| Role | Typical |
|------|---------|
| Chat / synthesis | Anthropic Opus-class (env-overridable) |
| Screen + Dream | Sonnet-class; temp default **0** |
| Staging :3002 | Z.AI GLM |
| Desk :3004 | DeepSeek / OpenRouter |
| Suggest / Dreams | Anthropic Managed Agents + Managed Memory |
| Compare judges | OpenAI + Claude |
| Prompts | `backend/prompts/*.j2` (screen.*, chat-*, future-study, auditor-*) |

Full: [`projects/capiq-screen-agent/ai-prompting.md`](../projects/capiq-screen-agent/ai-prompting.md) · call kinds in `call-architecture.md`.

## Investor portal

OpenAI `gpt-4o-mini` (+ `gpt-4o` vision for some extract/amount paths) on admin document AI rename/verify endpoints.

## PI control (.NET)

| Role | Model |
|------|-------|
| Error / log triage | `claude-haiku-4-5-20251001` (`DeveloperController`) |
| Run analysis + log chat | `claude-sonnet-4-6` |
| TTS (not report writing) | OpenAI `/v1/audio/speech` |

Full: [`projects/phoenician-intelligence-backend/ai-prompting.md`](../projects/phoenician-intelligence-backend/ai-prompting.md).  
Does **not** write DD sections — that is PI Python.

## No AI (generation)

Factsheet-Automation · phoenician-mail-sender · pi-global scaffold · PI frontend (proxies only) · Linker **web** (CLI qualitative Claude is separate).

## Live UI

Open **`AI & calls`** in the product map for the cross-project atlas (models × jobs, writing rules, call-type legend, per-product connection tables). Per-product depth also lives under **Product guides → Talks to / AI**. For DD engine extreme depth: **Product guides → DD engine → DD sections** (`src/lib/ecosystem/ddSections.js`).
