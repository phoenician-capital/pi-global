# Tiny logic — Mobile (v3)

## Standalone `investor-portal-mobile/` (weaker)

| rule | value |
|------|------:|
| PASSCODE_LENGTH | 6 |
| Passcode storage | **plaintext** SecureStore `pc_passcode` |
| Failure counter / wipe | **none** |
| REQUEST_TIMEOUT_MS | 15000 |
| Tokens | SecureStore access/refresh (no WHEN_UNLOCKED_THIS_DEVICE_ONLY) |
| Impersonation | **in-memory only**; 401 under impersonation does not refresh |
| KYC/statements unlock cache | 30 min (`pc_kyc_access_until`, `pc_statements_access_until`) |
| API base | `https://portal-api.phoeniciancapital.com` |

## Nested `investor-portal-backend/mobile-app/` (stronger)

| rule | value |
|------|------:|
| MAX_PASSCODE_FAILURES | **5 → wipe** passcode + force full login |
| Passcode v1 | `v1:<b64-salt>:<sha256-hex>` (+ legacy plaintext upgrade) |
| SALT_BYTES | 16 |
| SecureStore | `WHEN_UNLOCKED_THIS_DEVICE_ONLY` for passcode **and** tokens |

## Shared

Scope UI `readonly` · admin JWT stays in SecureStore during impersonation · AsyncStorage auth/account/bio keys · DocuSeal scheme `phoeniciancapital://`

## Never

Do not assume forks are in sync · do not commit Firebase plist/json into pi-global · push path must match backend FCM


## v4 gap files

`edge-cases.md`.
