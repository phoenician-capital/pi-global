# Document naming — Portal (v4)

| type | pattern |
|------|---------|
| Statement canonical | `{yyyy-MM-dd} Statement - {ExactAccountName}` |
| Force-rename date priority | (1) yyyy-MM-dd prefix (2) Qn YYYY→QoE (3) YYYY→12-31 (4) YYYY[_-]Q[1-4] (5) year 2000–2030→12-31 (6) skip |
| AI rename statements | `{oldName} - {extractedAccountName}` · batch default 2 clamp 1–10 |
| Legacy flip | `Statement DATE` → `DATE Statement` |
| Annual report | `{year}_Annual_Report_{Company}.pdf` · year 1995…now+1 |
| Subscriptions | `{yyyy-MM-dd}_{strippedOriginal}` · batch 2 clamp 1–5 |
| KYC multi-file | `Bank Statement - {Holder} - {n}.pdf` |
| Quarantine retention | **7 days** auto-delete |
