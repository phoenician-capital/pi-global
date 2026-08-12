# Deploy — Portfolio (v2)

| Piece | Detail |
|-------|--------|
| FE | GHA `deploy-frontend.yml` → Amplify zip API · app `d13pt3zp42x49n` |
| BE | `deploy-backend.yml` → ECR `pm-serve` → ECS `pm-serve-1b08` · post-deploy drain |
| Account | `578736536410` |
| Secrets names | `phoenician/anthropic-api-key`, `phoenician/callback-secret`, `phoenician-capiq-accounts-*`, `phoenician-ai-api-keys-*`, `phoenician/aurora-database-url-*` |
| Docs | `DEPLOY.md`, `RUNBOOK.md`, `DESIGN.md`, `PRINCIPLES.md` |
| `amplify.yml` | Reference only |
