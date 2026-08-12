# Architecture — Mail sender

```
TipTap UI → Vite proxy (injects X-Api-Key from root .env)
  → FastAPI (ApiKeyMiddleware)
      excel_parser · attachments (PDF magic) · graph (cc|ropc) · campaigns SSE · cancel
```

Modules: `config` (fail-closed), `models`, `excel_parser`, `attachments`, `graph`, `campaigns`, `security`, `sse`, `main`.
