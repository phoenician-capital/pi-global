# Deploy — investor-portal-mobile

| Item | Value |
|------|-------|
| Runtime | Expo / EAS |
| `app.json` version | `1.2.0` (standalone) |
| EAS | `appVersionSource: "remote"`; production `autoIncrement: true` |
| iOS submit | `eas.json` → `ascAppId` `6770306049` |
| Nested fork | `investor-portal-backend/mobile-app` version `1.0.0` — not the same binary |

Push: Expo → APNs (physical device). See local README. Screens: [`screens-inventory.md`](./screens-inventory.md).
