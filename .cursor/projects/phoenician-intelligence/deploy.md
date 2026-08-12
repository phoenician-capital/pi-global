# Deploy — PI Python (v2)

| Item | Value |
|------|-------|
| Workflow | `.github/workflows/deploy.yml` (+ claude-pr-review, pr-review-gate) |
| Region | `eu-north-1` |
| ECR | `phoenician-intelligence` |
| ECS | cluster `phoenician-intelligence-cluster`, service `phoenician-intelligence-service` |
| Secrets ARN | `…secret:phoenician-ai-api-keys-Wf6vHX` |
| Account | `578736536410` |
| Docker | LibreOffice + Chromium + Playwright; `GIT_SHA`; EXPOSE 8000 |
| Manual | `deploy.sh` |
| Public path | `https://api.phoeniciancapital.com/api/python/...` (via .NET) |
