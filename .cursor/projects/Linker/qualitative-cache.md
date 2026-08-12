# Qualitative cache (final pass)

| fact | value |
|------|------|
| Key | **`ticker` only** (model **not** in key — stale score reused if model changes) |
| Path | default `data/qualitative_cache.csv` |
| Columns | `ticker,score,rationale,model,scored_at` |
| Policy | append-only |
| Workers default | 8 |
| Model | `claude-sonnet-4-6` (`CAPIQ_QUALITATIVE_MODEL`) |
