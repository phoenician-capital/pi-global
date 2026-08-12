# Module map — Earnings_tracker

## `tracker/*.py` top-level

`calendar_sender`, `db_models`, `ics_builder`, `lambda_function`, `migrate_locks`, `migrate_summaries`, `migrate_to_db`, `scraper`, `smart_cache`, `smart_finder`, `summary_eligibility`, `summary_finder`, `summary_generator`, `summary_scheduler`, `timeutils`, `tracker`, `webcast_finder`

(+ `summary/` package, `earnings/` extract helpers — see `ai-prompting.md`).

## API routes (`api/routes/`)

`actions`, `calendar`, `companies`, `events`, `scrape_runs`, `summaries`

## Web UI

### Pages (`web/src/pages/`)

`CompaniesPage`, `Summaries`, `Summary`

### Components (`web/src/components/`)

`AddCompanyModal`, `AppShell`, `CalendarHero`, `CalendarInviteButton`, `CompanySelect`, `DeleteCompanyDialog`, `ErrorToast`, `EventsTable`, `FiltersBar`, `IndicatorComponents`, `LoadingSpinner`, `MarkdownLite`, `PageHeader`, `ResearchPageLayout`, `RunHistory`, `ScreenHero`, `ScreenStats`, `SourceSection`, `StatCard`, `StatSparkline`, `StatStrip`, `SummaryCard`, `SummaryHelpers`, `TableSkeleton`, `TableSortLabel`

SPA route map: `web-routes.md`.

## DB highlights (`tracker/db_models.py`)

### `companies`

`id` PK, `ticker` UNIQUE, `name`, `ir_url`, `events_url`, `events_url_verified`, `ir_verified_at`, `language`, `is_active`, `created_at`, `updated_at`, `last_scraped_at`

### `earnings_events`

`id` PK, `company_id` FK, `event_date`, `event_title`, `quarter`, `event_type` (default earnings), `event_time` / `timezone` / `time_local` / `time_et`, `webcast_url`, `webcast_searched_at`, `source_url`, `confidence`, `fetched_at`, `is_future`; unique `(company_id, event_date, event_type)`

Locks / EventBridge: `tiny-logic.md` (600/180/300/400s; `cron(0 8 ? * MON *)` + hourly).
