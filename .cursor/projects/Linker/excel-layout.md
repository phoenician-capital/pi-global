# Excel layout — Linker (v4)

| rule | value |
|------|------:|
| Title row (0-based) | idx **5** |
| Header row | idx **7** (1-based row 8 — known) |
| Data start | ≥ idx **8** / `DATA_START_ROW=8` |
| Sheet name | `Screening` |
| NAME_COL / TICKER_COL | 0 / 1 |
| Industry Classifications col | index **12** |
| Footer filter | name starts with `*` |
