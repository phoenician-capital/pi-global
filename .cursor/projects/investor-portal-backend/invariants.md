# Invariants / footguns — Investor Portal

**Auth lifetimes (code):** challenge JWT 10m · access 15m · refresh 30d (or session 12h) · impersonation 15m readonly · KYC unlock 30m · OTP 5 fails→15m lockout. Auth rate **30/15min/IP** in code (INFRA doc may say 5 — prefer code).

**Footguns (describe only — never copy values into git):**
- App Store review fixed OTP may be enabled in Production
- MalwareScanEnabled may be false while quarantine exists
- Admin friction password in client bundle by design
- Seed credential CSVs may exist locally (gitignored)
- Nested mobile AGENTS.md may claim impersonation absent from nested source
- IrMail still supports ROPC — prefer client_credentials
- Email From drift across docs (`support@` vs `ic@`)
