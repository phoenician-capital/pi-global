# Tiny logic — PI Python (v3)

## Constants (selected)

| symbol | value | meaning |
|--------|------:|---------|
| `GEMINI_TEMPERATURE` | 0.1 | RAG temp |
| `GEMINI_MAX_OUTPUT_TOKENS` | 8192 | flash-lite cap |
| `RAG_CONTEXT_MAX_CHARS` | 800000 | RAG budget |
| `FINANCIALS_BUDGET_CHARS` | 400000 | CapIQ sheets |
| `PREVIOUS_PARTS_BUDGET_CHARS` | 300000 | prior sections |
| `WEB_CONTEXT_BUDGET_CHARS` | 150000 | web inject |
| `STRUCTURED_DATA_BUDGET_CHARS` | 150000 | structured |
| `RAG_PARALLEL_BATCH_SIZE` | 2 | parallel RAG |
| `QUERY_GEN_PARALLEL_MAX_WORKERS` | 4 | query gen |
| `COMPANY_REVIEW_HEADER_MATCH_MIN_SIMILARITY` | 0.30 | Trustpilot abort |
| `COMPANY_REVIEW_HEADER_MATCH_WARN_SIMILARITY` | 0.40 | Trustpilot warn |
| `EC2_MEMORY_CACHE_TTL_HOURS` | 8 | investor memory |
| `PV_GATE_MIN_RATIO` / `MAX` | 0.30 / 3.00 | P/V gate band |
| `PV_GATE_MAX_ATTEMPTS` | 2 | gate retries |
| `MAX_REPORTS_PER_CONTAINER` | 3 | → HTTP 429 |
| `_TICKER_RE` | `^[A-Za-z0-9:._-]{1,30}$` | path guard |
| DCF `MAX_RETRIES` / delays | 3 / [30,60,120]s | LLM retry |
| DCF `MIN_RAG_CHARS`/`MAX` | 60k / 160k | DCF RAG |
| `_PV_GATE_MAX_BPS_PER_CELL` | 0.03 | 300bps edit |
| `_PV_GATE_RETRY_MIN_BPS_DELTA` | 0.005 | 50bps min |
| `_PV_GATE_MAX_EDITS_ATTEMPT_1/2` | 24 / 12 | edits |
| `_PV_GATE_LLM_MAX_TOKENS` | 42000 | gate JSON |
| `_PV_GATE_THINKING_BUDGET` | 10000 | Sonnet thinking |
| Claude writing | temp=0, max_tokens=65536 | sections |
| Claude hard limit | 2_400_000 chars | refuse |
| Gemini cache TTL | 3600s or 300s | context cache |
| PDF crawl | max pages 200, delay 2s, depth 4, year−10 | crawler |
| `MIN_DD_REPORT_BYTES` | 10000 | brain scan |
| BS `DEFAULT_TOLERANCE` | 1.0 | balance gate |

## Formulas

- P/V = Excel `pv_ratio` or `price / intrinsic_value_per_share`
- Gate low: `0 < pv < 0.30` tighten; high: `pv > 3.00` raise
- Trustpilot: sim <0.30 abort; [0.30,0.40) warn; ≥0.40 pass
- AlphaSense filename Jaccard >0.7; chunk dedup ≥0.85
- Container: `active_jobs ≥ 3` → **429**

## Section / pipeline order

`SECTIONS_ORDER = [2,3,4,5,6,7,8,9,10,12,1]` then §11 ACS.  
Collect → RAG → web → sections → UE-DCF 8-step → callback → optional H2H/risk/brain.

## Feature flags (defaults)

| flag | default |
|------|---------|
| `USE_GEMINI_FILE_SEARCH` | false |
| `USE_VERTEX_AI_SEARCH` | false |
| `VERTEX_AI_SEARCH_ALLOW_FALLBACK` | **false** |
| `USE_ALPHASENSE_RETRIEVAL` | false |
| `USE_AGENTIC_QUERIES` | false |
| `USE_S3_STORAGE` | false |
| `RAG_PARALLEL_ENABLED` | false |
| `REUSE_RAG_ON_REGENERATE` | **true** |
| `QUERY_GEN_PARALLEL_ENABLED` | true |
| `QUERY_GEN_BATCH_ENABLED` | false |
| `SKIP_PV_COHERENCE_GATE` | false |
| `SAVE_DCF_PIPELINE_TRACE` | true |
| `DCF_LLM_PROVIDER` | openai |
| `SUBPROCESS_WORKFLOW_VARIANT` | main |

Many `SKIP_*` for collect steps.

## State machines

- Report phase: initializing → data_collection → generating → completed|failed|cancelled (+ risk_auditor)
- Callback: COMPLETED|FAILED|CANCELLED
- Async JobStatus: pending→running→completed|failed
- H2H: not_started|running|completed|failed; phases research|generating|saving
- Risk: none|running|completed|failed|cancelled
- Variant: main vs cheap (`companies/{t}/cheap/`)

## Prompt routing (tiny)

| step | model | notes |
|------|-------|-------|
| Section writing | claude-sonnet-4-6 | temp=0, 65536 |
| Writing fallback | gemini-2.5-pro | cross-provider |
| Agentic queries | claude-sonnet-4-6 | |
| File RAG | gemini-2.5-flash-lite | burst 3.1-flash-lite |
| DCF codegen | provider flagship | openai xhigh |
| DCF BS gate | claude-opus-4-8 | thinking 0 |
| DCF P/V gate | claude-sonnet-4-6 | thinking 10k |
| TAM | sonar-deep-research | 50k |
| Risk | opus-4-7 / sonnet-4-6 | |

## Fail-closed

- Missing SUBPROCESS identity → RuntimeError / refuse
- No hardcoded ticker fallbacks
- Vertex fallback off by default
- Prompt >2.4M chars → ValueError
- Callback secret never from client
- Cross-company contamination guards

## Cache

section_cache durable · gemini_file_cache.pkl · Gemini explicit 1h/5m · Claude cache 5m/1h · EC2 memory 8h · query-gen durable when agentic on


## v4 gap files

See `http-status.md`, `prompts-tiny.md`, `s3-efs-keys.md`, `concurrency.md`, `edge-cases.md`.


## Final-pass extras

See `brain-skills.md`, `prefetch.md`.
