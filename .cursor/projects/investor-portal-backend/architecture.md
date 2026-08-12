# Architecture — Investor Portal (v2)

```
invest.phoeniciancapital.com (CF/S3)
  Admin + /portal/* + factsheet + IrMail UI
        │
portal-api (WAF → ALB TLS1.3 → ECS Fargate :8080)
  ├── RDS Postgres 16 Multi-AZ
  ├── S3 documents + quarantine
  ├── DynamoDB phoenician-capital-strategy-book ← Lambda ← S3 custom/book.json
  ├── Resend / Firebase / OpenAI / DocuSeal / FMP / Graph
  └── Hangfire (KYC expiry, refresh cleanup, form recovery)

Layers: API → Application (Features/*) → Domain → Infrastructure
```
