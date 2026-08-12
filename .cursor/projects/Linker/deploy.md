# Deploy — Linker

| Piece | Host |
|-------|------|
| Flask `capiq_linker` | Lightsail (PI embeds `/linker` → CloudFront → Lightsail `63.184.47.249`) |
| Port | `CAPIQ_LINKER_PORT` default `5050`; systemd `capiq-linker.service` |
| CLIs | Run where CapIQ Playwright + creds available (`download_financials.py`, `analyze_capital_allocation.py`, `build_companyid_cache.py`) |

Details: local `capiq_linker/README.md`. Auth for linker web vs PI JWT cookie: `systems/auth-boundaries.md`.
