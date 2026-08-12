# Edge cases — Earnings_tracker (v4)

| rule | value |
|------|------:|
| EventBridge weekly | `cron(0 8 ? * MON *)` |
| EventBridge hourly summaries | `cron(0 * * * ? *)` |
| Fetch bot-block HTTP set | `{401,403,406,409,429,503}` → curl_cffi bypass |
| Fetch failure TTL | 120s (success 1800s) |
| MERGE_WINDOW_DAYS | 14 |
| CORS default | localhost:5173 |
