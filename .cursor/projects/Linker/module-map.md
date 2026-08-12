# Module map — Linker

## `capiq/` package

`accounts`, `auth`, `browser_utils`, `companyid_cache`, `config`, `key_stats`, `logging_utils`, `models`, `parallel`, `runner`, `screening_loader`, `search` + `analysis/`

### `capiq/analysis/`

`cash_flow_parser`, `classifier`, `income_statement_parser`, `metrics`, `multiples_parser`, `peer_index`, `qualitative`, `ranker`, `report`

## Qualitative system prompt (fragment)

From `capiq/analysis/qualitative.py` `_SYSTEM_PROMPT` (first lines):

> You are an institutional equity analyst helping prescreen a universe of companies already exported from Capital IQ.  
> Your task is to assess the *qualitative business quality* of one company on a 0–40 scale. …

Cache key = **ticker only** → `qualitative-cache.md`. CapIQ score scale `/100` → `tiny-logic.md`. Excel BIFF path never xlrd→xlwt → `excel-layout.md`.
