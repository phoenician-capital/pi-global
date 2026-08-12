# Section map — phoenician-intelligence

Source: `src/engines/reportGenerator.py` (+ engines under `src/engines/`).

## Names & order

| # | `SECTION_NAMES` | Jinja | Notes |
|---|-----------------|-------|-------|
| 1 | Conclusion | `sections/section_1.jinja` | Depends on almost everything; generated last in `SECTIONS_ORDER` |
| 2 | Company Overview | `section_2.jinja` | No deps |
| 3 | Team & Culture | `section_3.jinja` | Needs 2 |
| 4 | Competitors | `section_4.jinja` | Needs 2; H2H engine also feeds competitive depth |
| 5 | Total Addressable Market | `section_5.jinja` | Needs 2,4 |
| 6 | Market Positioning | `section_6.jinja` | Needs 2,4,5 |
| 7 | Performance & Estimates | `section_7.jinja` | Needs 2,5 |
| 8 | Valuation (DCF) | `section_8.jinja` (+ `section_8_5.jinja`) | Needs 2,4,5,6,7 |
| 9 | Financial Health | `section_9.jinja` | Needs 2,5,7,8 |
| 10 | Technical Indicators | `section_10.jinja` | No deps |
| 11 | Research Challenge | *(no section_N.jinja — ACS workflow)* | Needs 1–10 |
| 12 | Red Flags | *(RFW workflow)* | No deps; runs before Conclusion in order |

- `reportGenerator.SECTIONS_ORDER` = `[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 1]` (11 ACS not in this helper loop).
- **Production** `workflow.py` `sections_order` = `[2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 1, 11]` (ACS last). Parallel pairs: **2∥10**, **6∥7**. §12 RFW starts as background from t≈0 and is collected before §1.
- `TOTAL_SECTIONS` = `12`.
- Progress file: `/app/companies/{ticker}/progress.json`.
- **Live UI depth:** `src/lib/ecosystem/ddSections.js` + Product guides → **DD engine** → **DD sections** tab (per-section calls, templates, models, subs CJA/UE/comps, optional H2H/RA/Brain).

## `SECTION_DEPENDENCIES`

| Section | Depends on |
|---------|------------|
| 1 | 2,3,4,5,6,7,8,9,10,12 |
| 2 | — |
| 3 | 2 |
| 4 | 2 |
| 5 | 2,4 |
| 6 | 2,4,5 |
| 7 | 2,5 |
| 8 | 2,4,5,6,7 |
| 9 | 2,5,7,8 |
| 10 | — |
| 11 | 1–10 |
| 12 | — |

## Engine folders (`src/engines/`)

| Folder | Role |
|--------|------|
| `analyst_challenge_workflow` | Section 11 ACS |
| `cashflow_bridge` | CF bridge artefacts |
| `cio_lens` | CIO lens |
| `competitors_workflow` | Competitor research (pre-H2H era / companion) |
| `customer_journey_workflow` | Customer journey |
| `h2h_workflow` | Head-to-head competitive report |
| `red_flag_workflow` | Section 12 |
| `repetition_analysis` | Repetition / consistency |
| `risk_auditor` | Risk audit JSON post-DD |
| `tam_commentary_research_workflow` | TAM commentary |
| `technical_indicators_workflow` | Section 10 |
| `unit_economics_workflow` | UE / DCF adjuncts |
| Modules | `reportGenerator.py`, `template_loader.py`, `template_report_generator.py` |

Other templates under `templates/sections/`: `competitor_info.jinja`, `dcf_executive_summary_prompt.jinja`, `full_report.jinja`, `unit_economics.jinja`, `h2h/`.

## H2H stages (`h2h_workflow/h2h_engine.py`)

| Stage | What |
|-------|------|
| 0 | Landscape + `TRIAGE_JSON` + `POSITIONING_MAP_JSON` (`h2h_0_landscape.jinja`) |
| 0.5 | Evidence scans all comps concurrent (`h2h_p0_evidence_scan.jinja`) → Tier1/2 by value_at_risk |
| Tier1 P1–P4 | evidence_ledger → thesis → red_team → chapter_write; verify max 2 regen |
| Tier2 | `h2h_t2_dossier.jinja` + verify |
| 5 | Competitive synthesis (`h2h_5_synthesis.jinja`) + full-report verify |
| Persist | `companies/{ticker}/reports/{ts} H2H Analysis.json`, `latest_h2h.json`, `h2h_meta.json` |

Langfuse span: `H2H_Competitor_Research`.

## Risk auditor steps (`risk_auditor/ra_main.py`)

1. Parse DD JSON  
2. Deterministic extract evidence + risk signals  
2.5. Link router (`route_and_merge`, Sonnet) → `mapping_evidence_ids`  
3. Optional company-type overlay (OpCo / Financial Intermediary / Insurance)  
4. Render whole DD to text for cached prompt  
5. Cluster signals → major risks (Sonnet)  
6. Audit each risk (Opus); risk1 sync cache-warm, rest parallel ≤5  
7. Executive summary (Sonnet) + renumber by materiality  
8. Write `risk_audit.json`

## UE-DCF steps (`unit_economics_workflow` / §8)

Provider via `DCF_LLM_PROVIDER` ∈ `{openai, claude, grok, deepseek}` → `dcf_llm_registry.DCFStepRole`.

| Step | Role / action | Prompt (typical) |
|------|---------------|------------------|
| 0 | STRUCTURED discovery | `unit_economics_discovery_prompt.jinja` |
| 1 | EXTRACTION (filings RAG) | `rag_dcf_extraction_prompt.jinja` |
| 1b | EXTRACTION (prior sections) | `dcf_context_extraction_prompt.jinja` |
| 1c | CONSTRAINTS map | `constraints_guidance_prompt.jinja` |
| 2 | CODEGEN 7-tab openpyxl | `generate_dcf_model_prompt.jinja` |
| 2b | SANITY_REVIEW (+ optional fix) | `code_sanity_review_prompt.jinja` |
| 3 / 3b | Review + CODE_FIX | `code_review_prompt.jinja` / `code_correction_prompt.jinja` |
| 3c | BS_BALANCE_GATE (skippable) | `bs_balance_gate_prompt.jinja` |
| 4 | Compile (no LLM) | — |
| 5 | Execute → `.xlsx` | sandbox |
| 5.6 | LibreOffice cache | `soffice` |
| 5.8 | P/V coherence (0.3–3.0, skippable) | `pv_coherence_gate*.jinja` |
| 6 | DOCUMENTATION | `documentation_prompt.jinja` |
| §8 prose | WRITING / `call_claude_writing` | `dcf_executive_summary_prompt.jinja` |

## CJA (§2.5) / ACS (§11) / RFW (§12) / TIW (§10)

- **CJA:** steps 1–6 in `cja_steps.py` (Gemini structured + Perplexity step2 + Claude draft).
- **ACS:** steps 2–4 in `acs_steps.py` (`step2_trigger_analysis` → contrarian → cross-exam).
- **RFW:** Serp preflight → parallel group web → `synthesis.jinja`.
- **TIW:** Python calcs → Perplexity sentiment → unified Claude write.

## Langfuse (`src/core/workflow.py`)

| Kind | Name |
|------|------|
| `@observe` | `REPORT_GENERATION` |
| span | `Parallel_Web_Search` |
| span | `RAG_Retrieval_Section_{section_num}` |
| generation | `LLM_Call_Section_{section_num}` (via `safe_generation_span`) |

## Docker

| Item | Value |
|------|-------|
| `EXPOSE` | `8000` |
| `USER` | *(absent — default/root)* |
| `HEALTHCHECK` | interval 30s, timeout 10s, start-period 120s, retries 3 · `curl -f http://localhost:8000/health` |
| `CMD` | `Xvfb :99 … & uvicorn api.main:app --host 0.0.0.0 --port 8000 --timeout-keep-alive 300 --workers 2` |
