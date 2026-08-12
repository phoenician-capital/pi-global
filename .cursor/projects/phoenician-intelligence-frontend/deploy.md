# Deploy — phoenician-intelligence-frontend

| Item | Value |
|------|-------|
| Hosting | S3 + CloudFront |
| Bucket | `phoenician-capital-frontend` |
| CloudFront | `E2CF5P57BJV2U3` |
| Domain | `pi.phoeniciancapital.com` |
| CI | GitHub Actions **manual** `workflow_dispatch` → sync S3 + invalidate CF |

Source: local `AWS-DEPLOYMENT.md`. Routes inventory: [`routes-inventory.md`](./routes-inventory.md).
