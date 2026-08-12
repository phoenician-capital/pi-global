# Controllers & data — phoenician-intelligence-backend

## Controllers → route prefixes

| Controller | Prefix |
|------------|--------|
| `AuthController` | `api/Auth` |
| `BrainPlaybooksController` | `api/brain/playbooks` |
| `BrainSkillsController` | `api/brain/skills` |
| `ChatController` | `api/chat` |
| `CompaniesController` | `api/Companies` |
| `CompanyNotesController` | `api/company-notes` |
| `CostsController` | `api/costs` |
| `DeveloperController` | `api/Developer` |
| `DiagnosticsController` | `api/Diagnostics` |
| `JobsController` | `api/Jobs` |
| `MarketDataController` | `api/MarketData` |
| `PythonProxyController` | `api/python` |
| `ScreeningController` | `api/Screening` |
| `TextToSpeechController` | `api/tts` |
| `TickerRequestController` | `api/TickerRequest` |
| `UniverseSearchController` | `api/universe` |
| `UserActivityController` | `api/user-activity` |
| `UserController` | `api/User` |
| `ValidationController` | `api/Validation` |
| `VendorBillingController` | `api/vendor-billing` |
| `Internal/BrainPlaybooksInternalController` | `api/internal/brain/playbooks` |
| `Internal/CallbacksController` | `api/internal/callbacks` |
| `Internal/UniverseController` | `api/internal/universe` |

App PathBase: `/api` on EB → effective public URLs often look like `https://api…/api/Auth/...`.

## Hosted background services

| Class | Role |
|-------|------|
| `ReportCallbackFallbackService` | Poll/retry Python→.NET report callbacks |
| `ScreeningMetricsBackfillService` | Screening metrics backfill |
| `VendorBillingSyncService` | Singleton + hosted; per-adapter vendor billing sync |

Registered in `Program.cs` via `AddHostedService`.

## `ApplicationDbContext` DbSets

`Users`, `TickerRequests`, `EnvironmentConfigs`, `ChatSessions`, `ChatMessages`, `UniverseTickers`, `ExchangeMappings`, `ModelRates`, `ReportRunCosts`, `Playbooks`, `VendorBillingRecords`, `UserActivitySessions`, `CompanyNotebooks`, `CompanyNotePages`, `CompanyNoteComments`, `CompanyNoteRevisions`.

## Seed users (`Data/SeedData.cs`) — emails only, no passwords

| Email | Role | Notes |
|-------|------|-------|
| `rr@phoeniciancapital.com` | `DEVELOPER` | FirstName Developer; Company Phoenician Capital; EmailVerified; Credits=0 |
| `jk@phoeniciancapital.com` | `INVESTOR` | FirstName JK |
| `mk@phoeniciancapital.com` | `INVESTOR` | FirstName MK |

Skip if email exists; passwords bcrypt-hashed in seed (values never in KB).

## PI `UserRole` enum (backend entity)

`INVESTOR`, `CLIENT`, `DEVELOPER` — distinct from portal `Admin`/`Investor`.
