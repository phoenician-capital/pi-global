# DocuSeal — Portal (v4)

| event | status |
|-------|--------|
| `form.completed` | completed |
| `form.declined` | declined |
| other | ignore unless `data.status` set |

Auth: prefer `X-DocuSeal-Signature`; `?token=` deprecated; constant-time compare.
