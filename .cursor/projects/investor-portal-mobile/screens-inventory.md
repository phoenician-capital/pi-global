# Screens & services — investor-portal-mobile

Two trees (not in sync): standalone `investor-portal-mobile/` vs nested `investor-portal-backend/mobile-app/`.

## Standalone (`investor-portal-mobile`) — app version `1.2.0`

EAS: `appVersionSource: "remote"`; production `autoIncrement: true`. No `buildNumber` / `runtimeVersion` in `app.json`.

### Screens

| Area | Files |
|------|-------|
| Root | `AccountDetailScreen`, `AccountsScreen`, `DashboardScreen`, `HomeScreen`, `KycOnboardingScreen` |
| admin/ | `AdminCustomerPickerScreen` |
| auth/ | `ForgotPassword`, `Login`, `QuickUnlock`, `ResetPassword`, `SelectAccount`, `SetPasscode` |
| documents/ | `DocumentList`, `InvestorFormDetail`, `PdfViewer` |
| profile/ | `ChangePassword`, `Profile` |

### Services

`api`, `appVersionService`, `authService`, `documentService`, `impersonationService`, `investorFormsService`, `investorService`, `kycAccessService`, `kycService`, `notificationBadgeService`, `notificationDeepLinkService`, `notificationOpenService`, `notificationService`, `passcodeService`, `pushService`, `statementsAccessService`, `videoService`

## Nested (`investor-portal-backend/mobile-app`) — app version `1.0.0`

### Screens

| Area | Files |
|------|-------|
| Root | `DashboardScreen` |
| auth/ | same set as standalone auth |
| documents/ | `DocumentList`, `InvestorFormDetail`, `PdfViewer`, **`VideoGallery`**, **`VideoPlayer`** |
| kyc/ | `KycScreen` (vs standalone `KycOnboardingScreen`) |
| profile/ | `ChangePassword`, `Profile`, **`TotpManager`** |
| components/ | **`PrivacyScreen`** |

Missing vs standalone: Accounts/Home/AdminCustomerPicker/KycOnboarding.

### Services

`accessOtpService`, `api`, `authService`, `documentService`, `investorFormsService`, `kycService`, `notificationService`, `passcodeService`, `pushService`, `secureStore`, `videoService`

No impersonation / statementsAccess / appVersion / deep-link badge suite of the standalone fork.

PIN wipe rules: see `tiny-logic.md` / `edge-cases.md` (nested wipe@5+hash vs standalone plaintext nuances).
