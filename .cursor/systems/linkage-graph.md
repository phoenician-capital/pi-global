# Linkage graph (v2)

Legend: `HTTP` · `iframe` · `JWT/cookie` · `S3/EFS` · `CI` · `conceptual` · `fork`

## Edges

```
PI FE --HTTP JWT--> PI .NET --HTTP+callback--> PI Python
PI FE --iframe--> Portfolio Amplify (d13pt3zp42x49n)
PI FE --iframe--> Earnings CF (d2iniwuj4wwgj0 / earnings.phoeniciancapital.com)
PI FE --iframe--> CapIQ Screen Agent (13-62-39-214.sslip.io/dashboard)
PI FE --postMessage--> Screen iframe (PI_REQUEST_TICKER)
CapIQ Chrome ext --HTTP--> Screen Express :3001
PI FE --navigate+pi_auth--> Linker (/linker on CF E2CF5P57BJV2U3)
PI .NET --EFS--> Python (fs-069a92a202a9402c5)
PI .NET --HTTP--> Screen GET /screen/universe (:3001, 2500ms)
Screen --webhook Watch--> PI .NET (PHOENICIAN_WEBHOOK_URL)
Screen EC2 --PM2 sibling--> phoenician-capiq download → S3 phoenician-capital-capiq-data
PI .NET --issues cookie--> Linker JWT validation
Portfolio pm-serve --HTTP secret--> PI /api/internal/universe (+ DD/risk/DCF)
Portfolio FE --HTTP--> pm-serve ECS
Portal --Dynamo←Lambda←S3--> Portfolio custom/book.json (johns-portfolio)
Portal IrMail --logic twin--> phoenician-mail-sender
Portal admin factsheet --conceptual--> Factsheet-Automation
Mobile nested --fork≠sync--> investor-portal-mobile (same API + store IDs)
```

## Explicit non-links

- Earnings_tracker ≠ portfolio `earnings_predictor` (different products).
- Factsheet ≠ live `pm-serve` (static `portfolio.json` + FMP).
- PI approach-company SMTP ≠ Graph IrMail / mail-sender.
- Portal JWT ≠ PI JWT (separate secrets).
- Orphan S3 `phoenician-capiq-data-*` — do not use (active dumps: `phoenician-capital-capiq-data`).
- Screen Express ≠ Linker ≠ PI CapIQ Playwright ≠ portfolio capiq-downloader.

## Matrix (selected)

| From → To | Type | Detail |
|-----------|------|--------|
| PI FE → Portfolio | iframe | `VITE_PORTFOLIO_OPTIMIZER_URL` |
| PI FE → Earnings | iframe | `VITE_EARNINGS_TRACKER_URL` |
| PI FE → Screen | iframe | `VITE_CAPIQ_EMBED_URL` → sslip `/dashboard/` |
| PI .NET → Screen | HTTP | `ScreenAgentClient` `/screen/universe` |
| Screen → PI | webhook | Watch verdicts + `X-Webhook-Key` |
| Portfolio → PI | HTTP | `PI_API_BASE` + secret |
| Portal → Portfolio S3 | Lambda sync | `custom/book.json` → Dynamo |
| Linker ↔ PI | JWT cookie + CF | `pi_auth`, Origin-Auth secret |
