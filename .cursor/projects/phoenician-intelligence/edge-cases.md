# Edge cases — PI Python (v4)

- Risk ticker regex: `^[A-Za-z0-9.\-:_]{1,64}$` (longer than general ticker RE)
- Citation harvest: `_SOURCES_URL_RE` for `[SOURCE:…][PUBLIC_URL:https?://…]`
- progress.json must **never** persist `callback_secret` (test-enforced)
- CapIQ→Yahoo map goldens: `LSE:ASAI→ASAI.L`; `OM:LAGR B→LAGR-B.ST`
- Security headers: nosniff, strict-origin-when-cross-origin, HSTS, CSP-RO
- GBp dashboard helper: price/=100; currency=GBP
- RISK_AUDITOR runtime 1800s, poll 5s
