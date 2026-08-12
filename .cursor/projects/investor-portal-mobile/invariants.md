# Invariants — investor-portal-mobile

- Auth island = **portal** JWT/OTP/TOTP — not PI JWT / `pi_auth`.
- Standalone vs nested `mobile-app` are **forks** (screens/services/versions diverge) — see `screens-inventory.md`.
- PIN wipe behavior differs by fork (`edge-cases.md`).
- Impersonation / admin picker exist on standalone; TotpManager / PrivacyScreen on nested.
