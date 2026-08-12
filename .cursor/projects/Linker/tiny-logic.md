# Tiny logic — Linker (v3)

## Composite score /100

`W_QUAL=40` + A–E each `/12` (subs D/E `/4`). Rescale `score × W/RAW`.

**Buckets:** Strong ≥70 · Mixed ≥40 · Poor <40 · FCF≤0 Capital Destroyer · years <3 Insufficient History

## FCF

- Non-financial: `ΣCFO + Σ(CapEx + SalePPE)` (CapEx negative)
- Bank/Insurance proxy: `ΣCFO + ΣΔNOA + Σnet_capex`

## Pillars (raw before rescale) — summary

- **A cash gen (raw/40):** FCF>0 +15; pos-years frac tiers; FCF/CFO tiers; CoV tiers
- **B allocation (raw/35):** alloc ratio, buybacks, acq, div bands
- **C shareholder (raw/25):** net buybacks, shares Δ, div
- **D growth (raw/10):** EPS/Rev/FCF/sh CAGR tiers; turnaround +5; filters CAGR/yield >10%
- **E valuation (raw/10):** yield + ratios E2/E3

## Job state machine

```
QUEUED → PARSING → RESOLVING → WRITING → DONE
              └→ ON_HOLD (90 min × ≤3) → retry
              └→ FAILED | CANCELLED
```

One `_ACTIVE_JOB_LOCK`. Restart cancels NON_TERMINAL; ON_HOLD survives.

## Timing

| item | value |
|------|------:|
| ON_HOLD retry | 90 min × 3 |
| Per-ticker pause | 0.8s |
| Worker stagger | 1.0s |
| Session-lost threshold | 3 consecutive fails |
| Reaper | 24h retention / 1h interval |
| Scheduler | 15 min |
| Max upload | 50 MB |
| Gunicorn | 1 worker / 8 threads / 1800s |
| Log retention | 500 lines |

## BIFF rules

- `.xls`: surgical BIFF8 (FONT/XF/HLINK/LABELSST/BOUNDSHEET) — **never** xlrd→xlwt
- `.xlsx`: openpyxl hyperlinks
- Magic OLE `D0 CF…` vs ZIP `PK`
- Screening header row **8**, data from 9; col A name / B ticker
- Target: CapIQ company overview with `companyId`

## AI

CLI qualitative only: `claude-sonnet-4-6` → /40. Web linker: **no LLM**.


## v4 gap files

`excel-layout.md`, `capiq-urls.md`, `edge-cases.md`.


## Final-pass extras

See `qualitative-cache.md`.
