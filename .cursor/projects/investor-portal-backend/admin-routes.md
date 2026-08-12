# Admin-portal React routes

Source: `admin-portal/src/App.tsx` + `investor/InvestorPortal.tsx`.

## Staff (ProtectedRoute + employee session)

| Path | Page |
|------|------|
| `/login` | Login (redirects to dashboard if already employee) |
| `/` | → `/dashboard` |
| `/dashboard` | Dashboard |
| `/clients` | Clients |
| `/clients/:id` | ClientDetail |
| `/statements` | Statements |
| `/transactions` | Transactions |
| `/shared-documents` | SharedDocuments |
| `/kyc-forms` | KycForms |
| `/investor-forms` | InvestorForms |
| `/notifications` | Notifications |
| `/ir-mail` | IrMail |
| `/settings` | Settings |
| `/portfolio-summary` | PortfolioSummary |
| `/strategy-factsheet` | StrategyFactsheet |
| `*` (staff catch-all) | → `/dashboard` |

## Investor shell `/portal/*`

| Path | Notes |
|------|-------|
| `login` | → `/login` |
| `set-password` | InvestorSetPassword |
| `kyc` | KycRoute → InvestorKycOnboarding |
| `select-account` | ProtectedRoute `requiresAccount={false}` |
| `director-picker` | DirectorFundPicker |
| `impersonation/launch` | Outside ProtectedRoute on purpose |
| `` (index) | InvestorIndex |
| `documents` | InvestorDocuments |
| `documents/:category` | InvestorDocumentList |
| `forms/:templateId` | InvestorFormDetail |
| `profile` | InvestorProfile |
| `accounts` | InvestorAccounts |
| `accounts/:accountId` | InvestorAccountDetail |
| `*` | → `/portal/` |

## Public

| Path | Page |
|------|------|
| `/share/strategy/:token` | ShareStrategyFile |
| `/legal/terms` | TermsOfUse |
| `/legal/cookies` | CookiesPolicy |
| `/legal/support` | Support |

Page file inventory: `features-inventory.md`. Factsheet delta vs Factsheet-Automation: `admin-factsheet.md`.
