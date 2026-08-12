# Architecture — PI .NET (v2)

```
Kestrel (EB) + UsePathBase("/api")
  SecurityHeaders → static /uploads → CORS → ExceptionHandler → RateLimiter → Auth → Controllers
       │
       ├─ Scoped: Auth, Jwt, Email, User, TickerRequest, S3, Efs, Chat, Playbook, …
       ├─ Singletons: SSE, VendorBilling*, Slack
       ├─ Hosted: ReportCallbackFallback, ScreeningMetricsBackfill, VendorBillingSync
       └─ HttpClients: anthropic, openai(+tts), cursor, deepseek, gcp, slack, PythonProxy(300s), screener
```

**Realtime:** SignalR `/hubs/company-notes`; SSE ticker status.  
**Cookie:** `pi_auth` HttpOnly for Linker SSO.
