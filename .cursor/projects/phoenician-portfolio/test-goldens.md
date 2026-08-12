# Test goldens — Portfolio (v4)

| test | golden |
|------|--------|
| liquidity max_weight_pct | 500e6,50e6,p=0.20 → **2.0** |
| feasible | 0.02@1d True; 0.10@1d False |
| unknown ADV | weight **uncapped** |
| exchange infer | `.L→LSE`, `.T→TSE`, bare→NASDAQGS |
| fable rates default | $5/$25 per MTok |
| lessons cost | must **not** increment `runs` |
| JPY / GBp tips | see `fx-currency.md` |
