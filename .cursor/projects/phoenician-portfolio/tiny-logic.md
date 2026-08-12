# Tiny logic — Portfolio (v3)

## Constants

| symbol | value | meaning |
|--------|------:|---------|
| `NOTIONAL` / `BOOK_NOTIONAL` | 250_000_000 | locked inception |
| `MAX_NAME` | 0.35 | AI single-name |
| `MAX_CASH` | 0.20 | cash cap |
| `MIN_NAME` | 0.001 | AI floor (no exits) |
| `TRADE_EPS` | 5e-4 | weight HOLD band |
| `_STATUS_BAND` | 0.02 | relative **shares** status |
| `WEIGHT_ON_TARGET_PP` | 0.15 | FE On-target **pp** |
| `PORTFOLIO_TARGET_RETURN` | 0.30 | ~30% CAGR |
| `VALUATION_HORIZON_YEARS` | 5.0 | re-rate window |
| `W_LIQUIDITY` | 0.15 | score term |
| `DEFAULT_PARTICIPATION` | 0.20 | ADV/day |
| `DEFAULT_ADV_WINDOW_DAYS` | 63 | ADV window |
| `DEFAULT_ADV_MIN_OBS` | 30 | live min obs |
| `DEFAULT_ADV_METHOD` | median | |
| `RETIRED_WIRE_BOOK_IDS` | ai,default,main,production | →410 |
| exec CHECKPOINT | v9 + vwap_hlc | |
| perf CHECKPOINT | v16 cash_principal | |
| fill JOURNAL | v3 | |
| DV STORE | v2 | |
| MAX_INCREMENTAL_GAP_DAYS | 45 | ADV rebuild |
| SERVE_CACHE / fp | v2 / `cmp5:` | |
| FX poison | 20× | |
| mild FX | 1.15 ± 30% | |
| MATERIAL_DIVERGENCE_PP | 5.0 | lessons |
| lessons gates | 21d / 1d / 7d | |
| lifecycle validate | ≥2 ∧ conf≥55 ∧ out≥0 | |
| lifecycle retire | ≥3 ∧ out≤−35 | |
| locks | run 6h / lessons 7200s / research 3h / ledger 60s / cost 30s | |
| MANUAL_TRIGGER_COOLDOWN | 300s | 429 |
| STRIKE_ISO | 2026-01-05T12:00:00Z | YTD |
| LATE_STAMP | 2026-07-06T12:00:00Z | late joins |
| FE plan cache | v3 / 7d | |
| TIE_BAND_PP / USD | 0.01 / 0.5 | Graphs |
| _MAX_POINTS | 180 | NAV downsample |
| _MAX_BODY_BYTES | 262144 | 256 KiB |

**Three different “close enough” — never unify:** TRADE_EPS (weight) ≠ `_STATUS_BAND` (shares) ≠ FE 0.15pp.

## Score formula

```
score = 1.0*sharpe + 0.5*(effN/n) - 1.0*tanh(max(0,target-er)/0.10) - W_LIQ*liq_penalty
```

- Refine accept: `cand > best + 1e-6`
- `effN = 1/HHI` over risky weights
- ER = growth + P/V re-rate + yield (~5y) — **not** backtest/earnings/insiders
- Sharpe: `_VOL_FLOOR_PCT=1.0`; RF fallback 0.04; flat ρ last 0.35
- Day% = (tip/prev−1)×100; Day$ = shares×(tip−prev) — seal `dayprev4`
- YTD shares = weight × $250M / price_at_strike
- Liquidity: `(participation × adv_usd × max_build_days) / nav`

## Book wires

| Display | Wire | Storage |
|---------|------|---------|
| AI Portfolio | `universe` | `books/universe/**` |
| Phoenician | `john` (alias `phoenician`) | `custom/*` |
| retired | `ai` etc. | **410 never remap** |

## Pipeline

`0 → 1 → 2 → 3 → 4 → 5 → 6(soft) → validate`  
Phoenician research-only: **1+2+6** (never 3–5 re-size). Weekly auto-recompute **OFF**.

## State machines

Allocation FRESH↔STALE · Custom NO_BOOK→ANCHORED · Replay BUILDING→BUILT→HOLDING→UNWINDING · Run IDLE→RUNNING→FRESH|STALE · Lessons proposed→validated/retired · Replay sells-first

## Cache TTLs

| surface | TTL |
|---------|----:|
| Hot memos | 300s |
| Grade hot / S3 grade+serve | 180s / 36h |
| Keep-warm | 150s |
| Tip/trailing/intraday/OHLCV | 900s |
| Index/FX cooldowns | 3600s |
| FE status / book+compare / trailing | 5s / 30s / 15m |

## API status habits

410 retired · 409 lock/disabled · 429 cooldown 300s · 400 bad book · 404 research/bare debate · 202 accepted · 413 body · 200+stale fail-closed · 503 not ready

## Never (hard)

No backtest→ER · advisory never→ER/weights · no AI exits · no remap ai→universe · 410≠offline · no Phoenician into Stage-0 selection · no hollow CapIQ on scrape fail · mild FX≠ADV wipe · bare debate 404 · no unapproved billable POSTs · no sample Graphs race · Day never sealed 1d alone · no VWAP warm-hit trailing · Footer never “0 holdings”


## v4 gap files

`http-status.md`, `prompts-tiny.md`, `fx-currency.md`, `s3-keys.md`, `timers.md`, `test-goldens.md`.


## Final-pass subpackages

See `earnings-predictor.md`, `capiq-downloader.md`.
