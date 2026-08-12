# Invariants — PI .NET

1. PathBase `/api` aligned with CloudFront.
2. Callback/internal require matching `X-Callback-Secret` — never write secret into EFS `progress.json`.
3. CORS must wrap exception handler.
4. Activity monitor email-only (no role bypass).
5. Email allow-lists sync with FE `productAccess.ts`.
6. CLIENT vs INVESTOR/DEVELOPER permission matrix.
7. Report generate 10/hour/user; OTP for INVESTOR/DEVELOPER.
8. Issues `pi_auth` for Linker.
