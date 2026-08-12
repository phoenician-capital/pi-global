# Admin factsheet vs Factsheet-Automation (final pass)

| dimension | Admin portal `src/factsheet/` | Factsheet-Automation |
|-----------|------------------------------|----------------------|
| Data | Always `/api/strategy-book/top5` (Dynamo+FMP) | Vite `/api/portfolio/top5` + SP500 middleware; optional `VITE_HOLDINGS_API_URL` |
| Auth / share | `POST /api/strategy-book/share` → public token links | No share tokens / no prod backend |
| UI math | Same reweight/top5 ranking | Same |
| Hosting | Embedded at `/strategy-factsheet` on invest.* | Standalone Vite app |
