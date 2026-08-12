# Auth — capiq-screen-agent

1. **Dashboard HTML:** when `DASHBOARD_USER` + `DASHBOARD_PASS` set and not `DASHBOARD_AUTH_DISABLED=1`, login form → cookie `dash_sess` = SHA-256 of credentials with salt `capiq-dash-v2`; HttpOnly; SameSite=Lax; **session-scoped**.
2. **API / extension / fetch:** not gated by that HTML middleware.
3. **PI iframe:** if `Sec-Fetch-Dest` is iframe/frame/embed and parent Origin/Referer ∈ `DASHBOARD_EMBED_ORIGINS` (default `https://pi.phoeniciancapital.com` + webhook origin), silently set session — no password form.
4. **CSP:** `frame-ancestors 'self' + EMBED_FRAME_ANCESTORS`.
5. **Prod PM2:** often `DASHBOARD_AUTH_DISABLED=1` (network + PI email allowlists).
6. **PI FE:** email allowlists in `capiqEmbed.ts` (write vs readonly `mode=`).
7. **Watch webhook:** `X-Webhook-Key` shared secret — not user session.
8. **.NET ScreenAgentClient:** no user JWT observed on `/screen/universe` (network trust + short timeout).

≠ Portal JWT. ≠ PI JWT for Screen API (cookie is dashboard session / embed trust).
