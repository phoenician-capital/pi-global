# Fund copy & UI — Factsheet-Automation

Marketing collateral only — not portfolio engine / admin StrategyFactsheet (see portal `admin-factsheet.md`).

## Components (`src/components/`)

`BrandLogo`, `CalendarYearReturnsChart`, `CumulativePerformanceChart`, `EditableMonthCell`, `ExcelDownloadButton`, `ExposureBars`, `FactsheetPdfDocument`, `HoldingsBook`, `Page1`, `Page2`, `PdfDownloadButton`, `PortfolioProfile`

## `src/data/fund.ts` — `FUND` static keys

| Key | Value (as coded) |
|-----|------------------|
| name | `PHOENICIAN OFFSHORE FUND LTD` |
| firm | `PHOENICIAN CAPITAL` |
| Strategy | Long-only equities |
| Track record | Since 2009 |
| fee | 1.00% |
| incentive | 20% over 6% hurdle |
| Liquidity | Quarterly |
| Notice | 30 days |

### `OPERATING_INFORMATION`

| Key | Value |
|-----|-------|
| Investment manager | Phoenician Capital LLC |
| Fund domicile | Cayman Islands |
| Base currency | USD |
| Reporting frequency | Monthly |

## `src/data/performance.ts`

`HISTORICAL_PERFORMANCE: YearRow[]` — each year has 12 monthly % (`null` = editable) + ytd. Years **2009–2026** (18 years); 2026 partial through Jun in source snapshot.

Reweight formula `weight×(priceNow/anchor)` and fee math: `tiny-logic.md`. localStorage keys: `localStorage.md`.
