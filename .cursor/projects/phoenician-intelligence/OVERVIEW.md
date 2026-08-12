# phoenician-intelligence — Python DD engine (v2)

**Local:** `phoenician-intelligence/` · Package `phoenician-intelligence-dd-generator` **0.1.0** · Python `>=3.10,<3.14` (Docker **3.11**)

**Role:** Async DD factory — CapIQ/PDF/reviews → RAG → 12-section Claude (or DeepSeek cheap) → UE-DCF Excel → H2H/risk/chatbot/DD-Brain. FastAPI on ECS; callbacks to .NET.

## Stack highlights
FastAPI≥0.109, uvicorn, anthropic/openai/google-genai/xai/langfuse, chromadb, discoveryengine, playwright/selenium, openpyxl/pycel, LibreOffice Calc, boto3, PyJWT. Lock: `uv.lock`.

## Process model
- Docker: `uvicorn api.main:app --workers 2` + Xvfb; `:8000/health`
- Jobs: in-memory `_ActiveJobsDict`; work as **`python main.py` / `main_deepseek.py`** with `SUBPROCESS_*` env
- ECS task protection while jobs active (`api/ecs_task_protection.py`)
- Middleware: CORS, SecurityHeaders, SecurityAuth

## Sibling docs
`architecture` · `api-surface` · `ai-prompting` · `data-sources` · `deploy` · `env-catalog` · `invariants` · `links` · `read-first`
