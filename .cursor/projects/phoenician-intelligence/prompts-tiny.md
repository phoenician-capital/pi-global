# Prompt fragments — PI Python (v4)

| location | key instruction (1 line) |
|----------|--------------------------|
| `call_claude._SONNET_QUERY_SYSTEM` | precise company-specific retrieval queries |
| `call_deepseek` writing/web/query | senior equity research analyst / expert web / precise queries |
| `templates/sections/section_1.jinja` | GLOBAL WRITING RULE — first section IC reads; never heard of company |
| `section_8.jinja` | all financials MUST use **{{ currency }}**; DO NOT convert to USD |
| `unit_economics.jinja` | expert business analyst — unit economics |
| `generate_dcf_model_prompt.jinja` | top-bucket IB associate — openpyxl 3-statement DCF |
| `query_generation/base_query_prompt.jinja` | RAG query specialist — semantic search queries |
| `h2h/h2h_0_landscape.jinja` | STAGE 0 landscape+triage BEFORE per-competitor work |
| DCF Rf rule | always US 10Y; never country Rf; FX via WACC dep row |
