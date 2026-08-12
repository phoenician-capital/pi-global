# Env catalog — phoenician-mail-sender (names only)

| Name | Role |
|------|------|
| `MAIL_API_HOST` | Bind (default `127.0.0.1`) |
| `MAIL_API_PORT` | Default `8010` |
| `MAIL_API_KEY` | `X-Api-Key`; required at startup |
| `MAIL_API_OPEN` | Must stay closed in prod |
| `MAIL_ALLOW_REMOTE` | Gate non-loopback bind |
| `MAIL_CORS_ORIGINS` | Dev origins list |
| Graph creds | Client credentials (preferred) / ROPC gated vars in `.env.example` |
| `VITE_MAIL_API_KEY` | Prefer **unset** — use proxy |
| `VITE_API_URL` | Optional direct API URL |

Template: root `.env.example` + `frontend/.env.example`.
