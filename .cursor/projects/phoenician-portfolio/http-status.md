# HTTP status — pm-serve (v4 gaps)

| code | body / when |
|-----:|-------------|
| 401 | `unauthorized` on billable POSTs |
| 202 | async pipeline accepted |
| 409 | `ENABLE_LESSONS is off.` / lock busy |
| 410 | retired wire (ai/default/main/production) |
| 503 | `The engine is not ready yet.` |
| (+ see tiny-logic for 400/404/413/429/stale) |
