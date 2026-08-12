# Timers — PI .NET (v4 gaps)

| timer | value |
|-------|------:|
| UserActivity OnlineWindow / MaxTick | 90s / 120s |
| SSE heartbeat | 15s |
| VendorBillingSync startup / tick | 15s / 60s |
| ScreeningMetricsBackfill startup | 5s |
| BigQuery client timeout | 45s |
| MarketData SemaphoreSlim | **8** (Yahoo throttle) |
| Password min length (auth) | 8 |
| Universe search limit clamp | 1–50 |
