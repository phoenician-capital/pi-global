# FX / currency — Portfolio (v4)

| rule | value |
|------|------:|
| Minor→major | GBp→GBP, ZAc→ZAR, ILA→ILS |
| Suffix ÷100 prior | `.L` / `.JO` |
| Generic minor divisor | reported not upper ∧ ≠ currency → 100 |
| Suffix→CCY prior | `.T→JPY`, `.L→GBP`, `.KQ/.KS→KRW`, … |
| USD stamp guard | bare USD never overrides non-USD suffix |
| Trading vs reporting | use `currency` not `financialCurrency` |
| ADV share frac sanity | `_MAX_PLAUSIBLE_MEDIAN_ADV_SHARES_FRAC=0.05` |
| Poison / mild (known) | 20× / 1.15±30% |

## Test goldens
- JPY tip: `2061×0.00625 → 12.88125`
- GBp tip: `231×1.35 → 3.1185` (=231/100×FX)
- Poison reject KRW/GBp vs USD mid False; near mid True
