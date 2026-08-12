# Deploy — phoenician-mail-sender

**Local IR workstation only.** Not Amplify/EB/public.

| Setting | Value |
|---------|-------|
| API host | `MAIL_API_HOST=127.0.0.1` (refuse non-loopback unless `MAIL_ALLOW_REMOTE=true`) |
| API port | `MAIL_API_PORT=8010` |
| FE | Vite `localhost:5173`; proxy injects API key from root `.env` |
| Auth | `MAIL_API_KEY` required; `MAIL_API_OPEN=false` |

Do not put API key in `VITE_*`.
