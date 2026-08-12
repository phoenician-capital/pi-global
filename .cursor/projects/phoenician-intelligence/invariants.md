# Invariants — PI Python

1. **No hardcoded company fallbacks** — missing `SUBPROCESS_TICKER` (+ name/website) → `RuntimeError` (anti cross-ticker contamination).
2. Parent must not mutate company globals; children inherit env at import.
3. `main` vs `cheap` isolation under `companies/{ticker}/cheap/`.
4. `VERTEX_AI_SEARCH_ALLOW_FALLBACK` default **false**.
5. LibreOffice required for correct DCF cached values (pycel).
6. UE-DCF is the only DCF path.
7. P/V coherence gate default 0.3–3.0 unless skipped.
8. Brain Phase 1: mine/review — do not auto-inject into generation until approved.
9. ECS protection while jobs active; OpenAPI hidden in prod when flags set.
10. DeepSeek research must not silently go offline when search required.
