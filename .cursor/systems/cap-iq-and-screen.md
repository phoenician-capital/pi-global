# CapIQ & Screen (v3 — includes `capiq-screen-agent` tree)

| Consumer | Job | Tech | KB |
|----------|-----|------|-----|
| **CapIQ Screen Agent** | Screener UI + API `:3001` + SQLite memory + Dreams | EC2 `13.62.39.214` · sslip HTTPS · Chrome ext + Express | [`projects/capiq-screen-agent/`](../projects/capiq-screen-agent/) |
| PI FE | Embed Screen dashboard | iframe `13-62-39-214.sslip.io` · postMessage | FE `postmessage.md` |
| PI .NET | Universe search | `ScreenAgentClient` → `GET /screen/universe` (2500ms) | backend call-architecture |
| PI Python | DD financials / Excel dumps | Playwright/Selenium → EFS | PI call-architecture |
| Screen EC2 sibling jobs | CapIQ financial downloads | PM2 `phoenician-capiq download` → S3 `phoenician-capital-capiq-data` | screen-agent `deploy.md` |
| Linker web | companyId hyperlinks in screening sheets | Flask + BIFF | Linker |
| Linker CLI | Key Stats + Claude qualitative /100 | Separate from web | Linker |
| Portfolio `capiq-downloader` | EP Hard refresh → `inputs/capiq/` | Playwright — **not** Screen Express | portfolio |

## Screen agent quick facts

- Ports: **3001** prod · **3002** GLM · **3003** MK · **3004** DeepSeek desk  
- Verdicts: Pass/Watch · NE promote ≥ **61** · claim TTL **5m** · concurrency default **5**  
- Stores: `memory.db` + `screening.db` (+ financials/live-prices) + Anthropic Managed Memory  
- Watch → PI webhook; .NET reads universe only  

**Do not conflate** pipelines. CapIQ kicks duplicate sessions → multi-account rotation / single Linker job. Orphan bucket `phoenician-capiq-data-*` — unused (active dump bucket is `phoenician-capital-capiq-data`).
