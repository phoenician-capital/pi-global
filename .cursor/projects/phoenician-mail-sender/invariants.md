# Invariants — phoenician-mail-sender

- Loopback-first: refuse non-`127.0.0.1` without explicit remote gate + key.
- Never bake `MAIL_API_KEY` into Vite `VITE_*` when using the proxy.
- Graph client_credentials preferred over ROPC.
- Portal IrMail is a **different** deployment with its own limits (2000/20MB) — do not assume parity.
