# Tiny logic — PI .NET (v3)

## Constants

| symbol | value | meaning |
|--------|------:|---------|
| Kestrel KeepAlive | 30 min | large uploads |
| RequestHeadersTimeout | 5 min | |
| HttpClients billing | 30s | anthropic/openai/cursor/deepseek |
| openai-tts | 120s | |
| PythonProxy | 300s | |
| screener hard / call | 10s / 2500ms | |
| report-generate rate | **10 / hour / user** | queue 0 |
| auth rate limit | **disabled** | GetNoLimiter |
| JWT ClockSkew | Zero | |
| Jwt ExpiryHours | 24 (default) | |
| OTP validity | 10 min | |
| OTP max attempts | 10 | |
| LlmCost / TickerResolver cache | 10 min | |
| S3 presign | 15 min | |
| Screen search cache | 60s (empty 15s) | |
| Callback poll | 30s | |
| Stale threshold | 4 h | orphan PROCESSING |
| Stale check | 5 min | |
| Marker give-up | 24 h | |
| Vendor sync ticks | 1h / 6h / 24h / loop 60s | by provider |

## Formulas / rules

- LLM cost: `(in*rateIn + out*rateOut + cacheRead*rateCR + cacheWrite*rateCW) / 1e6`
- UI map: PROCESSING→PROCESSING; IN_PROGRESS→on-watch; else in-coverage
- Force-reset PROCESSING: has ReportJson→COMPLETED else IN_PROGRESS
- Stale reset: age>4h AND not in Python active_reports; if Python down → **skip**
- HasAllowedEmail: DEVELOPER **or** list; ActivityMonitor = exact list **no** DEVELOPER bypass

## State machines

**RequestStatus:** IN_PROGRESS → PROCESSING → COMPLETED (cancel/fail with prior report restores COMPLETED)

**ScreeningReportStatus:** null → GENERATING → COMPLETED|FAILED

**OTP:** DEVELOPER+INVESTOR only; CLIENT password-only; 10m OTP ≤10 attempts

**Playbook Status:** generated|pending_review|approved|rejected|revoked (mine forces approved)

**Prefetch:** pending|running|ready|empty|failed

**Roles:** INVESTOR|CLIENT|DEVELOPER · Priority LOW|HIGH

## Allowlists (emails @phoeniciancapital.com names)

| policy | emails | DEV bypass |
|--------|--------|------------|
| BrainPlaybookViewer | mk,jk,aa,ea | yes |
| BrainPlaybookAdmin | rr,ea | yes |
| CostsViewer | jk,aa,mk | yes |
| ActivityMonitor | rr,jk | **no** |
| AuthRateLimitExemptions | rr | — |

## Fail-closed

- Never false-reset PROCESSING if Python unreachable
- Activity monitor exact emails only
- Auth rate limit currently disabled (OTP storms)

## Cache TTLs

rates 10m · universe 10m · screen 60s/15s · auth-exempt OTP+5m · S3 15m


## v4 gap files

`http-status.md`, `realtime.md`, `timers.md`, `edge-cases.md`.
