# Tiny logic — capiq-screen-agent

| Topic | Value |
|-------|-------|
| Claim TTL | `CLAIM_TTL_MS` = **5 min**; stale claims re-stolen |
| Claim batch | default **50** tickers |
| `SCREEN_CONCURRENCY` | default **5** (prod llama desk often `3`) |
| Screen mode | `per_company` \| `batched` |
| `SCREEN_BATCH_SIZE` | default **100** |
| Screen tokens | max 40000; per-name 8000; research 1500 |
| Web search uses | batch 60 / per-name 15; research 8 |
| `SCREEN_RESEARCH_TTL_DAYS` | default **30** |
| Screen temperature | default **0** |
| `SCREEN_MCAP_MAX_DIVERGENCE` | default **1.67** |
| Auditor cache TTL | 180d; identify OK 90d; miss 30d |
| Auditor batch | max 20 evals; concurrency 3; web uses 6; max tokens 4000 |
| Live prices interval | **15 min** (initial delay 5s) |
| Quote cache | 15m; FX 60m; ownership/sector 7d |
| CapIQ ADV cache | 24h |
| `CAPIQ_BREAKER_COOLDOWN_MS` | default **10 min** |
| `NE_MIN_PROMOTE_SCORE` | **61** → NE Watch else Pass |
| `NE_WATCH_CAP_PCT` | **0.02** |
| NE batch / limit / attempts | 12 / 40 / 5; retry sleep 1500ms |
| Screener verdicts | `Pass` \| `Watch` (chat can override; shadow never overwrites John) |
| Run status | `queued` \| `running` \| `completed` \| `failed` |
| Universe list cap | **50_000** rows |
| Dashboard payload cache | `DASHBOARD_PAYLOAD_CACHE_MS` default 120s |
| Managed stream timeout | 5 min; `runTurn` 120s |
| Dream wait | poll ~10–15s; timeout **90 min**; keep last 20 curatedPrev |
| Extension chat-turn | up to **300s**; keep-alive every **20s** |
| Watch webhook | 3 retries; backoff `RETRY_MS * attempt` |
| .NET ScreenAgentClient | timeout **2500ms**; 1 retry @100ms; empty cache 15s |
| Session cookie | `dash_sess` session-scoped (no Max-Age) |
| Auto Dream | off unless `AUTO_NIGHTLY_DREAM=true`; cron 20:30 UTC typical |
| Mind refresh cron | 20:00 UTC `/refresh-mind` |
| Screen auto-resume | on by default; delay `SCREEN_RESUME_DELAY_MS` 25s |
| NE startup rescore | after 45s unless `NE_DISABLE_STARTUP_RESCORE=1` |
| Default investor | `john_khabbaz` (MK desk → `mk`) |
| Unit-economics uplift | may uplift Watch←Pass when revenue/GP/margin rules fire |

See also `financials-fx` docs in tree; GBp/subunit mismatch tests under `backend/test/`.
