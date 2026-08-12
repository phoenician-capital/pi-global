# Auth boundaries (v2)

| Product | Mechanism | Details |
|---------|-----------|---------|
| PI .NET | JWT HS256 + email OTP | Roles INVESTOR/CLIENT/DEVELOPER; cookie **`pi_auth`** |
| PI Python | Same JWT **or** internal/callback secrets | `SECURITY_AUTH_ENFORCE` default log-only; headers `X-Internal-Secret`, `X-Callback-Secret` |
| Linker | Validates `pi_auth` | Shared HS256; CF `X-Origin-Auth` |
| Portfolio | Optional `STRATEGY_TRIGGER_TOKEN` | FE may bake `PUBLIC_STRATEGY_TRIGGER_TOKEN` |
| Earnings | `X-API-Key` on writes | Public GETs |
| Portal | Separate JWT + OTP/TOTP | Challenge 10m · access 15m · refresh 30d/12h · impersonation 15m readonly · **not Cognito**; OTP/tx mail via **Resend** (not SES); IrMail campaigns via **Graph** |
| Mail local | `X-Api-Key` + loopback | Portal IrMail uses Admin JWT → Graph (separate from Resend OTP) |
| CapIQ Screen | `dash_sess` cookie / PI iframe trust (`DASHBOARD_EMBED_ORIGINS`) | Express `:3001`; API mostly ungated; Watch webhook key to PI; .NET universe read unauthenticated (network) |

**Never assume PI JWT works on Portal or vice versa.**
