# localStorage / session — Factsheet (v4)

| key | shape / rule |
|-----|----------------|
| `factsheet-month-overrides` | `Record<"{year}-{monthIndex}", number>` |
| `factsheet-top5-v6-session:{sessionDate}` | last completed US session |
| Hardcoded months | **locked** |
| `null` months | always editable; override only fills empties |
| Commit null | deletes override key |
| `?pdfInspect` | render PDF DOM for debug |
