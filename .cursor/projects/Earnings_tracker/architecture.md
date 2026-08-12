# Architecture — Earnings_tracker (v2)

```
EventBridge Mon 08:00 UTC → Lambda earnings-tracker → Postgres
EventBridge hourly {"action":"generate_summaries"} → Lambda → POST ECS /summaries/generate/scheduled
FastAPI (ECS/ALB) ↔ same DB
CloudFront: /* → S3 web; /api/* → ALB
```

Locks: full-run 600s; company rescrape 180s. Summary retries 1h/2h/3h after event.
