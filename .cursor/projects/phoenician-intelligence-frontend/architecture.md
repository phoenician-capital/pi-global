# Architecture — PI FE (v2)

```
AuthContext + TickerContext + React Query
AppShell + PersistentWorkspaceFrames (warm iframes)
  Diligence | Screen | Risks | Portfolio | Earnings | Costs
Routes gated by role + email allow-lists (productAccess / capiqEmbed)
API: VITE_API_URL → .NET; Python via prod helper → …/api/python
Storage keys: authToken, authUser, rememberEmail; session caches ph_*
```

**Embed defaults**
- CapIQ: `https://13-62-39-214.sslip.io/dashboard/`
- Portfolio: `https://main.d13pt3zp42x49n.amplifyapp.com/`
- Earnings: `https://d2iniwuj4wwgj0.cloudfront.net/`
