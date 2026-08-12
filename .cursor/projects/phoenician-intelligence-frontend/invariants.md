# Invariants — PI FE

1. Embed frames stay mounted (`PersistentWorkspaceFrames`) — do not remount on workspace switch.
2. Linker/CapIQ paths that need cookies: **full navigation**, not client-only route.
3. Email allow-lists must match backend AuthorizationPolicies.
4. Prod Python via authenticated .NET proxy — not open ALB.
5. `ph_*` caches cleared on auth churn.
