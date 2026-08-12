# Architecture — Factsheet

```
portfolio.json (+ FMP EOD / optional VITE_HOLDINGS_API_URL)
  → score = weight × (priceNow/priceAnchor)
  → top5 normalize to 100%
  → Page1/Page2 + localStorage month overrides
  → jspdf/html2canvas + Excel
```

Dev-only Vite plugins: `vite.portfolioApi.ts` (`/api/portfolio/top5`), `vite.sp500Api.ts`.
