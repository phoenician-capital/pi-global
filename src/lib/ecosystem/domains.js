/**
 * @type {Record<string, { id: string, name: string, shortLabel: string, blurb: string, color: string, accent: string }>}
 */
export const domains = {
  intelligence: {
    id: "intelligence",
    name: "Phoenician Intelligence",
    shortLabel: "Research hub",
    blurb: "Research shell — Diligence, Risks, Earnings Tracker embed, control tower, and PI website.",
    color: "#2a5570",
    accent: "#3d7a9a",
  },
  screener: {
    id: "screener",
    name: "CapIQ Screener",
    shortLabel: "Screener",
    blurb: "Core product — CapIQ universe triage (Pass/Watch), Dreams memory, Chrome ext + dashboard. Linker + Screener SQLite sit here.",
    color: "#1e5a5c",
    accent: "#2d8a88",
  },
  portfolio: {
    id: "portfolio",
    name: "Portfolio Manager",
    shortLabel: "Portfolio",
    blurb: "Core product — two investment books, research stages, live tips.",
    color: "#6a5430",
    accent: "#8a6a2f",
  },
  portal: {
    id: "portal",
    name: "Investor Portal",
    shortLabel: "Investors",
    blurb: "Investor & admin docs, KYC, e-sign, IR mail — separate login island.",
    color: "#356040",
    accent: "#4a7a55",
  },
  ops: {
    id: "ops",
    name: "Side tools",
    shortLabel: "Side tools",
    blurb: "Small supporting tools — Factsheet Automation and Mail Sender (not Screener, not Research hub).",
    color: "#6b3d4a",
    accent: "#8a5262",
  },
  vendor: {
    id: "vendor",
    name: "External vendors",
    shortLabel: "Outside tools",
    blurb: "CapIQ, AI providers, market data, Graph, DocuSeal, email…",
    color: "#5a4a3a",
    accent: "#7a6548",
  },
  infra: {
    id: "infra",
    name: "Infrastructure",
    shortLabel: "Storage",
    blurb: "Databases, files, caches, and cloud hosts that store the work.",
    color: "#3a4a5a",
    accent: "#4f6575",
  },
};

/**
 * Core nodes per business function (no one-hop flood).
 * `tier: "primary"` = big product; `tier: "side"` = supporting.
 * @type {{ id: string, name: string, blurb: string, tier: "primary"|"side", nodeIds: string[] }[]}
 */
export const businessFunctions = [
  {
    id: "diligence",
    name: "Diligence (DD)",
    blurb: "Deep company research reports — a core Phoenician Intelligence product.",
    tier: "primary",
    nodeIds: ["pi-fe", "pi-net", "pi-py", "efs-pi", "rds-pi", "capiq", "anthropic", "gemini", "deepseek"],
  },
  {
    id: "risks",
    name: "Risk report",
    blurb: "Risk audits across the diligence universe — core PI product (same shell as DD).",
    tier: "primary",
    nodeIds: ["pi-fe", "pi-net", "pi-py", "efs-pi", "rds-pi", "anthropic"],
  },
  {
    id: "screening",
    name: "Screener",
    blurb: "CapIQ universe triage (Pass/Watch) — core Phoenician Intelligence product.",
    tier: "primary",
    nodeIds: ["screen", "pi-fe", "pi-net", "linker", "capiq", "sqlite-screen", "anthropic", "deepseek"],
  },
  {
    id: "portfolio",
    name: "Portfolio",
    blurb: "Build and review the two strategy books. DD arrives from PI over HTTP.",
    tier: "primary",
    nodeIds: ["pm-fe", "pm-serve", "ep", "s3-strategy", "redis-pm", "anthropic", "deepseek", "pi-net"],
  },
  {
    id: "earnings",
    name: "Earnings calendar",
    blurb: "Research-hub embed — find and summarize earnings events (not the portfolio predictor).",
    tier: "side",
    nodeIds: ["earnings", "pi-fe", "pi-net", "deepseek", "serpapi"],
  },
  {
    id: "investor",
    name: "Investor servicing",
    blurb: "Side / sibling island — documents, KYC, mobile, e-sign.",
    tier: "side",
    nodeIds: ["portal-web", "portal-api", "portal-mobile", "s3-docs", "rds-portal", "docuseal", "resend"],
  },
  {
    id: "ir_comms",
    name: "IR communications",
    blurb: "Side project — IR email campaigns via Microsoft Graph.",
    tier: "side",
    nodeIds: ["portal-web", "portal-api", "mail-sender", "graph"],
  },
  {
    id: "marketing",
    name: "Fund marketing collateral",
    blurb: "Side project — factsheets and strategy top-5.",
    tier: "side",
    nodeIds: ["factsheet", "portal-web", "portal-api", "dynamo-book", "fmp", "s3-strategy"],
  },
];

/** The four core products newcomers should learn first. */
export const primaryBusinessIds = ["diligence", "risks", "screening", "portfolio"];
