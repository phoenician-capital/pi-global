# HTTP status — Mail sender (v4)

| code | when |
|-----:|------|
| 401 | Unauthorized (API key) |
| 400 | bad file/body |
| 413 | oversize |
| 404 | attach/campaign missing |
| 409 | campaign in flight |
| 502 | Graph send fail |
| 503 | no API key / misconfig |

Health (no key): `{status:"ok", service:"phoenician-mail-sender", version, env, auth_mode, tls_verify}`
