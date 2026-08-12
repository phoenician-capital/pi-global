/**
 * Confirmed scheduled jobs / workers from .cursor KB.
 * Not graph nodes (no invented topology) — searchable catalog linked to owners.
 */

/** @typedef {{ id: string, name: string, ownerNodeId: string, cadence: string, purpose: string, evidence: string }} Scheduler */

/** @type {Scheduler[]} */
export const schedulers = [
  {
    id: "job-earnings-weekly",
    name: "Earnings weekly scrape",
    ownerNodeId: "earnings",
    cadence: "EventBridge · Mon 08:00 UTC",
    purpose: "Scrape IR earnings calendar into Postgres.",
    evidence: "projects/Earnings_tracker/call-architecture.md",
  },
  {
    id: "job-earnings-hourly",
    name: "Earnings summary batches",
    ownerNodeId: "earnings",
    cadence: "EventBridge · hourly post-event windows",
    purpose: "Generate DeepSeek summaries 1h/2h/3h after events.",
    evidence: "projects/Earnings_tracker/call-architecture.md",
  },
  {
    id: "job-screen-prices",
    name: "Screen live-price refresh",
    ownerNodeId: "screen",
    cadence: "Every 15 minutes",
    purpose: "Refresh Yahoo quotes / FX for screening desk.",
    evidence: "projects/capiq-screen-agent/call-architecture.md",
  },
  {
    id: "job-screen-mind",
    name: "Screen mind refresh",
    ownerNodeId: "screen",
    cadence: "Daily 20:00 UTC",
    purpose: "Refresh living screener mind / memory narrative.",
    evidence: "projects/capiq-screen-agent/",
  },
  {
    id: "job-screen-dream",
    name: "Screen Dreams cron",
    ownerNodeId: "screen",
    cadence: "Nightly 20:30 UTC",
    purpose: "Anthropic Managed Memory Dreams pass.",
    evidence: "projects/capiq-screen-agent/",
  },
  {
    id: "job-screen-capiq-dl",
    name: "CapIQ Excel PM2 downloads",
    ownerNodeId: "screen",
    cadence: "PM2 sibling jobs on Screen EC2",
    purpose: "Dump CapIQ Excel → S3 phoenician-capital-capiq-data (outside Express).",
    evidence: "projects/capiq-screen-agent/deploy.md",
  },
  {
    id: "job-portal-kyc",
    name: "KYC expiry warnings",
    ownerNodeId: "portal-api",
    cadence: "Hangfire daily 08:00",
    purpose: "Email KYC expiry warnings via Resend.",
    evidence: "projects/investor-portal-backend/call-architecture.md",
  },
  {
    id: "job-portal-refresh",
    name: "Refresh-token cleanup",
    ownerNodeId: "portal-api",
    cadence: "Hangfire Sun 02:00",
    purpose: "Purge stale refresh tokens.",
    evidence: "projects/investor-portal-backend/call-architecture.md",
  },
  {
    id: "job-portal-signing",
    name: "Signing recovery",
    ownerNodeId: "portal-api",
    cadence: "Hangfire every 10 minutes",
    purpose: "Recover stuck DocuSeal signing flows.",
    evidence: "projects/investor-portal-backend/call-architecture.md",
  },
];

export const schedulerById = new Map(schedulers.map((s) => [s.id, s]));
