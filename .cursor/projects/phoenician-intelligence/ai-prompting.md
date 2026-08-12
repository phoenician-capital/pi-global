# AI / prompting — PI Python (v2)

## Model IDs found in code
- Claude: `claude-sonnet-4-6`, `claude-opus-4-6/4-7/4-8`, `claude-fable-5`, `claude-mythos-5`, dated sonnet/opus/haiku builds
- Gemini: `gemini-2.5-flash-lite` (**search default**), `gemini-2.5-pro/flash`, `gemini-3.1-*`
- DeepSeek: **`deepseek-v4-flash` only**
- OpenAI cascade: `gpt-5.5`→`gpt-5.4`→`gpt-4.1`→`gpt-4o`…
- Grok: `grok-4.20-*`, `grok-4`, `grok-3`, …
- Perplexity: `sonar-deep-research`, `sonar-reasoning-pro`, `sonar-pro`, `sonar`
- Query gen: `AGENTIC_QUERY_MODEL = "claude-sonnet-4-6"`

## Prompt corpus
~**142 `.jinja`** under `templates/{sections,research,retrieval,query_generation,evaluation,valuation,dcf,utils_prompts,base}`, `src/brain/prompts`, engine `prompts/`, `src/n8n_helpers/prompts`, Company_Review prompts.

## Pipeline order
1. Data collection (SKIP_* flags)  
2. Prefetch/RAG (`USE_VERTEX_AI_SEARCH` primary; fallback flag default false)  
3. Web research  
4. Sections `[2,3,4,5,6,7,8,9,10,12,1,11]`  
5. UE-DCF 8-step + P/V gate (0.3–3.0 unless skipped)  
6. Callback .NET  
7. Optional H2H / risk / brain  

## n8n helpers
`agentic_query`, `apply_modification`, `load_report`, `modify_section`, `notes_ai_query`, `query_report`, `search_excels`, `search_pdfs`, `suggest_modification`

## Langfuse
`LANGFUSE_{PUBLIC_KEY,SECRET_KEY,HOST}` — `@observe(name="REPORT_GENERATION")`
