/** @type {Record<string, { id: string, name: string, blurb: string, color: string, accent: string }>} */
export const domains = {
  intelligence: {
    id: "intelligence",
    name: "Phoenician Intelligence",
    blurb: "Diligence shell → .NET BFF → Python DD factory. Hub of research UX.",
    color: "#3d6b8a",
    accent: "#7eb8d4",
  },
  portfolio: {
    id: "portfolio",
    name: "Portfolio Manager",
    blurb: "Two books (Phoenician vs AI universe). Amplify SPA ↔ pm-serve ECS.",
    color: "#6b5a3d",
    accent: "#d4b87e",
  },
  portal: {
    id: "portal",
    name: "Investor Portal",
    blurb: "Investor + admin docs, KYC, IrMail, strategy factsheet. Separate auth island.",
    color: "#4a6b4d",
    accent: "#8fc496",
  },
  ops: {
    id: "ops",
    name: "Ops satellites",
    blurb: "Earnings calendar, CapIQ Screen, Linker, Factsheet, mail-sender.",
    color: "#6b3d4a",
    accent: "#d48fa3",
  },
  platform: {
    id: "platform",
    name: "Platform",
    blurb: "This map (pi-global) and shared AWS account context.",
    color: "#4a4a6b",
    accent: "#a8a8d4",
  },
  vendor: {
    id: "vendor",
    name: "External vendors",
    blurb: "CapIQ, LLMs, market data, Graph, DocuSeal — shared across products.",
    color: "#5a4a3a",
    accent: "#c4a882",
  },
  infra: {
    id: "infra",
    name: "Infrastructure",
    blurb: "RDS, EFS, S3, Redis, Dynamo, Amplify, EB, ECS, EC2, Lightsail.",
    color: "#3a4a5a",
    accent: "#8aabb8",
  },
};

export const businessFunctions = [
  { id: "diligence", name: "Equity diligence / DD", nodeIds: ["pi-fe", "pi-net", "pi-py", "efs-pi", "rds-pi"] },
  { id: "screening", name: "Universe screening", nodeIds: ["screen", "pi-fe", "pi-net", "linker", "capiq"] },
  { id: "portfolio", name: "Portfolio construction", nodeIds: ["pm-fe", "pm-serve", "s3-strategy", "redis-pm", "pi-net"] },
  { id: "investor", name: "Investor servicing", nodeIds: ["portal-web", "portal-api", "portal-mobile", "s3-docs", "rds-portal"] },
  { id: "earnings", name: "Earnings calendar", nodeIds: ["earnings", "pi-fe"] },
  { id: "ir_comms", name: "IR communications", nodeIds: ["portal-api", "mail-sender", "graph"] },
  { id: "marketing", name: "Fund marketing collateral", nodeIds: ["factsheet", "portal-api"] },
];
