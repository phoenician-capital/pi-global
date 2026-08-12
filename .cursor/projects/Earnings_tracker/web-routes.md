# Web routes / polls (final pass)

| route | page |
|-------|------|
| `/` | Events home |
| `/summaries` | Summaries list |
| `/summary/:ticker/:eventDate` | Summary detail |
| `/companies` | Companies |

| poll | value |
|------|------:|
| Summary POLL_INTERVAL_MS | 4000 |
| Summary POLL_TIMEOUT_MS | 120000 |
| On 409 | wait `Retry-After` or **15s** then poll |
| Toast auto-clear | 5000ms |
