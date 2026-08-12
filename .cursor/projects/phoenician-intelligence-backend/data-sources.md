# Data / entities — PI .NET (v2)

## DbSets
`User`, `TickerRequest`, `EnvironmentConfig`, `ChatSession`, `ChatMessage`, `UniverseTicker`, `ExchangeMapping`, `ModelRate`, `ReportRunCost`, `Playbook`, `VendorBillingRecord`, `UserActivitySession`, `CompanyNotebook`, `CompanyNotePage`, `CompanyNoteComment`, `CompanyNoteRevision`

## Stores / clients
| Store | Detail |
|-------|--------|
| RDS | `investor_platform_db` |
| S3 | `phoenician-capital-uploads` |
| EFS | `fs-069a92a202a9402c5` → `/app/companies` |
| Python | `PythonApi:BaseUrl` |
| Screen | default `http://13.62.39.214:3001` |
| SMTP | Office365-style `Email:*` |
| Vendor APIs | Anthropic/OpenAI/Cursor/DeepSeek/AWS CE/GCP BQ |

Does **not** generate DD — delegates to Python.
