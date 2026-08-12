# Env catalog — Linker (names only)

| Name | Role |
|------|------|
| CapIQ login vars | Playwright auth (see `.env.example`) |
| `CAPIQ_LINKER_PORT` | Flask bind (default `5050`) |
| Anthropic / Claude key | Qualitative 0–40 scoring (`qualitative.py`) |
| PI JWT / cookie related | Lightsail auth middleware — see `capiq_linker/auth.py` |

Never commit `.env`. Template: `Linker/.env.example`.
