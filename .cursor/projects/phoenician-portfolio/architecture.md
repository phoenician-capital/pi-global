# Architecture — Portfolio (v2)

```
PI API ──universe+DD/DCF/risk──► StrategyEngine
Yahoo/FMP/FX/ADV ──────────────► prices + liquidity
Claude Sonnet/Opus/Fable (or DeepSeek flash)
        ▼
pm-serve (stdlib HTTP, ECS Express, 1 task)
  S3 STORE_READ=s3 · Redis LIVE tips · Aurora dual-write mirror
        ▼
Amplify SPA Compare desk
```

**AI pipeline:** 0 membership → 1 valuation → 2 red-team → 3 synthesis → 4 refine → 5 review → 6 risk (soft) → validate.  
**Phoenician:** research-only Stages 1+2+6 under `custom/research/*` — never re-sizes.  
**FE chapters:** Positions · Performance · Trades · Graphs · Go-live ledger.
