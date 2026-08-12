# Invariants — Portfolio (v2)

| Invariant | Source |
|-----------|--------|
| Two books only; wire `ai`→410; display AI ≠ wire `ai` | kb/10, books.py |
| $250M locked; book-notional no-op | performance.NOTIONAL, kb/01 |
| AI validate: max name 35%, max cash 20%, min 0.1%; Phoenician may 0% | validate.py |
| No backtest / hist-return → ER | kb/00 |
| Advisory never → ER/weights | kb/00, kb/09 |
| Fail-closed 0–5; Stage 6 soft | kb/06 |
| Replay sells-first; TRADE_EPS 0.05% ≠ STATUS_BAND 2% ≠ FE 0.15pp | kb/03 |
| Checkpoints exec v9 / perf v16 / journal v3 | kb/02 |
| Compare `cmp5:`; T0=max(inceptions) | kb/10 |
| ADV 20%/day, window 63d, min_obs 30 | liquidity.py |
| FX poison 20×; mild must not wipe ADV | kb/04 |
| YTD genesis ops-only | kb/11 |
| Never fire billable LLM POSTs without human OK | kb/00 |
