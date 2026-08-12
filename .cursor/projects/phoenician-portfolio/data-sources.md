# Data — Portfolio (v2)

**Bucket** `phoenician-capital-strategy` (eu-north-1). Orphan `phoenician-capiq-data-*` — **do not use**.

Prefixes: `books/universe/**`, `custom/*`, `inputs/**`, `inputs/earnings/**`, `inputs/capiq/companies/`, `state/**` (performance, archives, insiders, fill journals, …).

| External | Use |
|----------|-----|
| PI | universe + DD/risk/DCF (ephemeral) |
| Yahoo | marks, FX, ADV, corr |
| FMP | meta, EOD, rf, helpers |
| SEC/Finnhub/EDINET/OpenFIGI | insiders |
| CapIQ downloader | earnings Hard refresh |
| Redis | LIVE tips (never seals fills) |
| Aurora | dual-write mirror; reads still S3 |
