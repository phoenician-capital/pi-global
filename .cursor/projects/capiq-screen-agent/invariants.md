# Invariants — capiq-screen-agent

- Screener verdicts are **Pass | Watch** only (top-of-funnel). Chat can override with `verdict_source='chat'`; **shadow never overwrites John**.
- Screen temperature default **0** for stable verdicts.
- NE promote threshold **61** (`NE_MIN_PROMOTE_SCORE`); NE Watch cap **2%** of universe.
- Claim locks **5 min** TTL — stale claims re-stolen.
- PI .NET universe search is **read-only** `GET /screen/universe` with short timeout + Postgres fallback — do not assume Screen is always up.
- Dashboard password middleware only gates **HTML navigations**; API/extension fetches are not that gate (prod often `DASHBOARD_AUTH_DISABLED=1`).
- PI iframe trust: Origin/Referer ∈ `DASHBOARD_EMBED_ORIGINS` (default `https://pi.phoeniciancapital.com`).
- CapIQ multi-account: download jobs on host must not kick Screener / Linker sessions — rotate accounts.
- Do not conflate with Linker / PI Playwright / portfolio capiq-downloader.
