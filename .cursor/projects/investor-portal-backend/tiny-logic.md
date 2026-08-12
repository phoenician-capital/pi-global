# Tiny logic — Investor Portal backend (v3)

## Auth lifetimes

| stage | value |
|-------|------:|
| Access JWT | **15 min** |
| Refresh remember-me | **30 days** |
| Refresh session | **12 hours** |
| OTP challenge JWT | **10 min** |
| Impersonation JWT | **15 min**, scope always `readonly` |
| Password lockout | 5 fails → **15 min** |
| OTP lockout | 5 fails → **15 min** |
| Forgot-password | **1 hour** |
| Login-link email | **24 hours** |
| KYC/statements unlock | **30 min** |
| TOTP window | ±1 step |
| Email OTP | 6 digits |
| Refresh cleanup | delete > **90 days** |
| ClockSkew | Zero |

Challenge types: `email_otp`, `totp`, `totp_setup`, `kyc_access`, password-change OTP.

## Rate limits (app)

| policy | permit | window | partition |
|--------|-------:|--------|-----------|
| auth | 30 | 15 min | IP |
| otp-resend | 5 | 10 min | IP |
| upload | 10 | 10 min | user/IP |
| api | 4000 | 1 min | IP |
| documents | 120 | 1 min | user/IP |

WAF: **1000 req / IP / 5 min**. ALB 403 `/hangfire*`, `/swagger*`.

## IrMail limits (= mail-sender parity)

2000 recipients · 20 MiB PDF · TTL 1800s (clamp 60–7200) · delay 1s · token refresh 2700s · retries 1 · multipart ceiling 25 MiB · **no parse-excel on portal**

## Hangfire

| job | cron |
|-----|------|
| kyc-expiry-warning | Daily 08:00 UTC (60/30/7 days) |
| refresh-token-cleanup | Sun 02:00 UTC |
| investor-form-signing-recovery | every 10 min |

WorkerCount=2; queues default,kyc,notifications.

## AI routing

gpt-4o-mini for text/structured rename/verify/segment · gpt-4o for vision PDF + amounts · endpoint `api.openai.com/v1/chat/completions`

## Enums

**DocumentCategory:** Statements, FundDocuments, Policies, Letters, PortfolioCompanies, WiringInstructions, KycDocuments, TaxDocuments, ContractNotes  

**KycStatus:** NotStarted, Pending, Approved, Rejected, MoreInfoRequired  

**KycDocStatus:** Required, Uploaded, UnderReview, Approved, Rejected, Expired  

**UserRole:** Admin|Investor · **FundType:** Offshore|OffshoreMaster

## Strategy book

BookId `johns-portfolio` · share expiry default 30d clamp 1–90 · share token 16 bytes hex · upload 40 MiB · S3 presign 300s

## Impersonation rules

Admin only · not already impersonating · target Investor+active+linked · readonly · allowlisted writes: end, logout, limited document DELETE|PATCH

## Footgun flags (names)

`Email:LogOtpCodes` · `SuppressNonAuthInvestorEmails` · `IrMail:Enabled` / ROPC · `Aws:MalwareScanEnabled` · `AppStoreReview:Enabled`+FixedOtpCode · DocuSeal/DocuSign Enabled · LoginAlerts:EmailEnabled

## Other

LoginAlerts MaxEmailsPer24h=5 · secrets cache 5m · quote/news cache 5/30m · MobileApp LatestVersion config (e.g. 1.0.9) / MinimumVersion 1.0.0


## v4 gap files

`http-status.md`, `password-policy.md`, `naming.md`, `docuseal.md`, `cors.md`.


## Final-pass extras

See `tools.md`, `admin-factsheet.md`.
