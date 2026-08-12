# HTTP / exceptions — Portal (v4)

| exception | HTTP | code |
|-----------|-----:|------|
| Validation | 400 | |
| NotFound | 404 | |
| Unauthorized | 401 | |
| Conflict / DbUpdate | 409 | CONCURRENCY_CONFLICT / DB_UPDATE_ERROR |
| BusinessRule | 422 | e.g. PASSWORD_PWNED, RESET_TOKEN_INVALID |
| else | 500 | INTERNAL_ERROR |

Health: `GET /health` → `{status, checks:[{name:"postgresql", status, duration}]}`
