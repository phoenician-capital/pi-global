# Architecture — Linker (v2)

```
CLI: screening → Playwright Key Stats → analyze (Claude /40 + financial /60) → ranking xlsx
Web: PI pi_auth → CF /linker* + X-Origin-Auth → nginx → gunicorn Flask :5050
     → Playwright resolve → BIFF/xlsx patch → download
```

Prod: gunicorn 1 worker, 8 threads, timeout 1800. One active job mutex; ON_HOLD 90min×3; jobs_data 24h TTL.
