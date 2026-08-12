# Tiny logic — Earnings_tracker (v3)

## Locks / TTLs

| item | value |
|------|------:|
| Full-run lock | 600s |
| Company lock (full run) | 180s |
| Manual API company lock | 300s |
| Summary lock | 400s |
| Fetch cache | 1800s |
| Summary lookback | 14d |
| Summary batch | 5 × max 6 |
| Checkpoints after event | **1h, 2h, 3h** |
| Same-day cutoff hour | 18 desk TZ |
| Serp window | event−14d … event+45d |
| MAX_DOCS_TO_FETCH | 3 |
| Fetch limits | 20s / 8k–50k / 25MB |
| CF SPA TTL | 86400; `/api/*` TTL 0 |

## Models

- Finder/webcast/extract default: `deepseek-v4-pro`
- Summary EXTRACTION_MODEL default: `deepseek-chat`
- Override: `DEEPSEEK_MODEL`; key often in `OPENAI_API_KEY` → `api.deepseek.com`

## Confidence adjustments

+0.30 official PDF · +0.15 any PDF · −0.20/−0.30 non-official/no-docs

## API habits

409 lock · 403 bad key · 204 deleted · 207 multi-status · 500 hard fail

## Never

No concurrent full runs without lock · keep only post-event search hits · ≠ CapIQ / ≠ portfolio earnings_predictor · don’t share DocumentFetcher across events


## v4 gap files

`http-status.md`, `edge-cases.md`.


## Final-pass extras

See `web-routes.md`.
