# Env catalog — phoenician-intelligence-frontend (names only)

Build-time `VITE_*` (from `AWS-DEPLOYMENT.md` / `.env.example`):

| Name | Typical prod |
|------|----------------|
| `VITE_API_URL` | `https://api.phoeniciancapital.com/api` |
| `VITE_API_BASE_URL` | `https://api.phoeniciancapital.com/python-api` |
| `VITE_PORTFOLIO_OPTIMIZER_URL` | `https://main.d13pt3zp42x49n.amplifyapp.com/` |
| Other embed URLs | Earnings / CapIQ Screen / Linker — see `systems/urls-and-domains.md` |

SPA cannot read Secrets Manager; TTS secrets stay on .NET (`docs/TTS_PRODUCTION_BACKEND.md`). Never commit real `.env` values.
