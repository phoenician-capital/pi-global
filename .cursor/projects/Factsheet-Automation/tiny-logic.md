# Tiny logic — Factsheet (v3)

## Ranking

```
score_i = weight_i × (priceNow_i / priceAnchor_i)   # invalid → factor 1
display_i = 100 × score_i / Σscore
top5 = sort display desc, take 5
```

Fail-soft: missing prices keep anchor weight.

## Fund numbers (`fund.ts`)

| item | value |
|------|------:|
| Management fee | 1.00% |
| Incentive | 20% over 6% hurdle |
| Liquidity | Quarterly |
| Notice | 30 days |
| Track record | Since 2009 |
| Sector (examples) | Fin 27.8 … Mat 4.2 |
| Geo | APAC 48.6 / EU 40.2 / NA 7.2 / EM 4.0 |
| Mcap | Mid 49.5 / Small 45 / Micro 5.5 |

## Timing

- US close **16:00 America/New_York**
- Auto refresh: `msUntilNextUsMarketClose() + 5 minutes` (one-shot, not poll)
- Session cache by `lastCompletedUsSessionDate()` (skips weekends; not holidays)
- FMP anchor window −5d/+2d; profile blurb maxLen 1400

## Never

Not pm-serve · no LLM · no $250M/two-book enforcement · fail-soft ranking


## v4 gap files

`localStorage.md`.
