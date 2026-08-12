# AWS inventory (v2)

Account `578736536410` · prefer `eu-north-1`.

| Resource | Product |
|----------|---------|
| CF `E2CF5P57BJV2U3` | PI FE + `/api` + `/linker` |
| S3 `phoenician-capital-frontend` | PI SPA |
| EB `phoenician-api-prod` | PI .NET |
| ECS `phoenician-intelligence-cluster/service` | PI Python |
| EFS `fs-069a92a202a9402c5` | PI shared files |
| Amplify `d13pt3zp42x49n` | Portfolio FE |
| Amplify `d3w0s20ak7lflk` | **pi-global** |
| Amplify `d3ruefkm8e3t3w` | frontend-kit |
| ECS `pm-serve-1b08` / ECR `pm-serve` | Portfolio API |
| S3 `phoenician-capital-strategy` | Portfolio books |
| Lightsail `63.184.47.249` (eu-central-1) | Linker |
| EC2 `i-0ef36803457fc6db4` EIP `13.62.39.214` | CapIQ Screen Agent (Express 3001–3004, nginx sslip, PM2, cloudflared); sibling CapIQ download jobs → S3 `phoenician-capital-capiq-data` |
| Portal WAF/ALB/ECS/RDS | invest + portal-api |
| S3 `phoenician-capital-documents` + quarantine | Portal docs |
| Dynamo `phoenician-capital-strategy-book` | Portal top5 |
| S3 `phoenician-earnings-tracker-web` + Lambda `earnings-tracker` | Earnings |
| Secrets `phoenician-ai-api-keys`, callback, linker-origin-auth, portal app/* | Many |

**CI:** `github-actions-pi-global` (Amplify zip) · `github-actions-frontend-kit` · role `github-actions-deploy` (OIDC; Amplify actions added; OIDC assume failed for pi-global → access keys used).
