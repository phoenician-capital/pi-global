# Controllers — Investor Portal API (v2)

| Controller | Base | Highlights |
|------------|------|------------|
| Auth | `api/auth` | login, verify-otp, fallback-otp, refresh, logout, me, passwords, fcm-token, sessions/devices, kyc-access OTP, totp/* |
| Impersonation | `api/admin/impersonation` | start/end (Admin) |
| Users/Accounts/Funds | `api/*` | CRUD, access-tree, move-fund, login-link, mobile invite |
| DocumentFolders/Documents | `api/...` | tree, upload, proxy, quarantine, AI rename*, distribute, scan-broken |
| Kyc | `api/kyc` | templates, requirements, review, joint, quarantine |
| InvestorForms | `api/investor-forms` | DocuSeal sync, signing-url, webhook |
| Notifications/ClientRequests | | send/read/review |
| PortfolioCompanies/Portfolio | | quotes, news, videos, summary |
| StrategyBook | `api/strategy-book` | top5, share create, public share/{token} |
| Trades/Transactions | | import, backfill, fix-amounts |
| IrMail | `api/ir-mail` | status, upload-attachment, test-send, send-stream SSE, cancel — **no parse-excel** |
| Audit/Monitoring/ScanWebhook/Security/App | | Admin audit; CSP; malware webhook secret; app version |

Health: `GET /health`
