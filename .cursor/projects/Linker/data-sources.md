# Data sources — Linker

| Source | What |
|--------|------|
| CapIQ screening `.xls` | Input universe (e.g. `JK-MK.xls`) |
| CapIQ Key Stats Excel downloads | Per-company financials (USD period-rate FX) |
| `data/companyid_cache.csv` | ticker → CapIQ `companyId` |
| Claude Sonnet | Qualitative 0–40 |
| Parsers | CF / IS / Multiples → 10y FCF + uses-of-FCF + multiples |

Composite: 40% qualitative + 60% financial → **/100**. See `module-map.md`, `tiny-logic.md`.
