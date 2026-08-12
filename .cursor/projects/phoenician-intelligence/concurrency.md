# Concurrency — PI Python (v4)

| surface | limit |
|---------|------:|
| Active reports / container | 3 → 429 |
| Query-gen LLM semaphore | = max_workers (default 4) |
| httpx DeepSeek pool | keepalive 20 / conn 40 |
| PDF/S3 upload workers | 10 |
| PDF process | 6 |
| Selenium / prefetch | 8 |
| PDF categorize | 10 |
| H2H pool | 3 |
| Risk auditor clusters | min(n-1, 5) |
| Section pairs §2&10 / §6&7 | pool 2 |
| Cleaning_Excels ProcessPool | min(3, files) |
| Gemini cleanup | 20 |
| Data collection ThreadPool | 4 |
