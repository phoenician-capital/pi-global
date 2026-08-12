# Data sources — Factsheet-Automation

| Source | What |
|--------|------|
| `src/data/fund.ts` | Fund copy, exposures, operating info |
| `src/data/performance.ts` | Monthly returns 2009–2026 |
| `src/data/sp500.ts` | Benchmark months for charts |
| Holdings book | Client file / local state (`HoldingsBook`) — not live portfolio API |
| Prices for reweight | User-entered / book fields → `weight×(priceNow/anchor)` |

Not wired to `phoenician-portfolio` ECS or portal StrategyBook (admin factsheet is the server-backed twin).
