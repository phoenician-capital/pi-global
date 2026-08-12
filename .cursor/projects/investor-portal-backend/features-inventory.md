# Features & services — investor-portal-backend

## Application feature folders

`PhoenicianCapital.Application/Features/`:

`Accounts`, `AuditLogs`, `Auth`, `ClientRequests`, `DocumentFolders`, `Documents`, `Funds`, `InvestorForms`, `KYC`, `Monitoring`, `Notifications`, `Portfolio`, `PortfolioCompanies`, `Trades`, `Transactions`, `Users`

## Hangfire jobs

| Job | Schedule | Behavior |
|-----|----------|----------|
| `KycExpiryWarningJob.RunAsync` | daily 08:00 UTC (`kyc-expiry-warning`) | Email + push via `SendKycExpiryWarningEmailAsync`; subject `KYC Document Expiring in {N} Days` for N∈{60,30,7} |
| `RefreshTokenCleanupJob.RunAsync` | weekly Sun 02:00 UTC | Hard-delete revoked/expired refresh tokens older than 90d; **no email** |
| `InvestorFormSigningRecoveryJob.RunAsync` | every 10 min | `TryAttachSignedDocumentAsync`; **no email** |

## Infrastructure service classes

`AppStoreReviewService`, `CompositePushNotificationService`, `DeviceFingerprintService`, `DocumentVersionQueryService`, `DocuSealService`, `DocuSignService`, `EmailService`, `ExpoPushNotificationService`, `FcmPushNotificationService`, `IrMailService`, `ITextPdfSplitter`, `ITextPdfTextExtractor` (file `PdfTextExtractor.cs`), `JwtService`, `LoginAlertService`, `MarketDataService`, `MemoryChallengeReplayGuard`, `OpenAiAnnualReportYearExtractor`, `OpenAiContractNoteExtractor`, `OpenAiContractNoteTypeVerifier`, `OpenAiNameExtractor`, `OpenAiStatementSegmenter`, `OpenAiSubscriptionDateExtractor`, `PasswordService`, `PortfolioCompanyCatalog` (+ `PortfolioCompanyMeta`), `S3StorageService`, `SecretsManagerService`, `StrategyBookStore`, `StrategyTop5Service`, `TotpEncryptionService`

## Admin portal pages (`admin-portal/src/pages/`)

`AccountAccessTree`, `ClientDetail`, `Clients`, `Dashboard`, `InvestorForms`, `IrMail`, `KycForms`, `Login`, `Notifications`, `PortfolioSummary`, `Settings`, `SharedDocuments`, `ShareStrategyFile`, `Statements`, `StrategyFactsheet`, `Transactions` (+ `legal/`)

See also `admin-routes.md`, `tools.md`, `admin-factsheet.md`, `ai-prompting.md`.
