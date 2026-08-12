# Architecture — Mobile standalone

```
screens → services → api.ts → portal API
SecureStore JWTs · AuthContext · QuickUnlock/biometrics/passcode
Admin → AdminCustomerPicker → impersonation start (in-memory token) → readonly
```

**Has:** impersonation, Accounts/Home/KycOnboarding, image-picker, Firebase plist/json tracked.  
**Lacks vs nested:** TotpManager screen, VideoGallery/Player, PrivacyScreen (nested AGENTS stronger on FCM/store).
