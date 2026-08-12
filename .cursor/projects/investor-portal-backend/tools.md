# Ops tools (final pass)

| tool | role |
|------|------|
| `statement-split-pdf/` | Split JPM combined quarterly packs (1 page = 1 investor) or pass legacy one-account PDFs → `{Investor}_{YYYY-MM-DD}.pdf` under `{InvestorStem}/{year}/qN/` |
| `statement-sync/` | Upload split tree via `POST /api/documents/upload` (`Category: Statements`); match account by name stem; JWT from live admin session |
| `s3-book-sync-lambda/` | S3→Dynamo: watch `custom/{book,seed,performance}.json` → table `phoenician-capital-strategy-book`, `bookId` default `johns-portfolio` |
| other | `ProbeBundledPdf`, `probe-jpm-nav.py`, `export-portfolio-companies.mjs`, `patch-waf-strategy-share.py`, `live-db-switch-fund` |
