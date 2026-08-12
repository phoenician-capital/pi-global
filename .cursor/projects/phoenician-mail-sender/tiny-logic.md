# Tiny logic — Mail sender (v3)

## Limits (parity with portal IrMail)

| knob | value |
|------|------:|
| max_recipients | 2000 |
| max_excel_bytes | 5 MiB (**standalone-only**) |
| max_pdf_bytes | 20 MiB |
| attachment_ttl_seconds | 1800 |
| send_delay_seconds | 1 |
| token_refresh_seconds | 2700 |
| send_retries | 1 (=2 attempts) |
| api_host/port | 127.0.0.1:8010 |
| body_html max | 200_000 |
| email max | 320 |
| filename max | 180 |
| PDF_MAGIC | `%PDF` |
| Graph 429 | max 3, wait 1–60s (default 5) |
| HTTP timeouts | 30s token / 60s send |

## Personalization

HTML-escape `{firstName}` (`html.escape(..., quote=True)`). Test send uses `[TEST]` prefix.

## Fail-closed startup

Refuse: missing API key (unless open+dev+loopback) · `MAIL_API_OPEN` in production · non-loopback without `MAIL_ALLOW_REMOTE` · non-loopback without API key.

## Flags

`MAIL_API_OPEN` · `MAIL_ALLOW_REMOTE` · `MAIL_TLS_VERIFY=false` · `MAIL_AUTH_MODE=ropc` · `MAIL_ENV`

## Never

No `VITE_*` API key · prefer client_credentials · campaign CSV may be PII under `logs/`


## v4 gap files

`http-status.md`, `excel-layout.md`.
