# Factsheet-Automation (v2)

Client-side React 19.2 + Vite 8 factsheet for **Phoenician Offshore Fund Ltd** — PDF/Excel export. **No LLM, no prod backend.** Marketing collateral — not the portfolio engine.

| | |
|--|--|
| Fund name | PHOENICIAN OFFSHORE FUND LTD |
| Firm | PHOENICIAN CAPITAL |
| Domicile | Cayman Islands |
| Fees (copy) | 1% mgmt · 20% incentive over 6% hurdle |
| Liquidity copy | Quarterly / 30-day notice |
| Performance grid | Years 2009–2026 in `performance.ts` |
| Reweight | `weight×(priceNow/anchor)` — see `tiny-logic.md` |

Deep lists: [`fund-copy.md`](./fund-copy.md) · localStorage: [`localStorage.md`](./localStorage.md).  
Admin twin (server-backed): portal `admin-factsheet.md` / `/strategy-factsheet`.
