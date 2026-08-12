/**
 * Newcomer-friendly labels layered on top of accurate dossiers.
 * Does not invent edges — only explains existing facts in plain English.
 */

/** @typedef {{ label: string, plain: string, color: string }} KindPlain */

/** @type {Record<string, KindPlain>} */
export const kindPlain = {
  reasoning_llm: {
    label: "Asks AI to write or judge",
    plain: "Sends a request to an AI model to draft text, score something, or make a judgment.",
    color: "#d4b87e",
  },
  embedding_rag: {
    label: "Finds relevant documents",
    plain: "Searches an indexed document library for passages that match the question (retrieve, not invent).",
    color: "#b8a0d4",
  },
  data_fetch_market: {
    label: "Gets market / financial data",
    plain: "Pulls prices, filings, or company financials from market vendors (CapIQ, Yahoo, FMP…).",
    color: "#7eb8d4",
  },
  data_fetch_web: {
    label: "Searches the open web",
    plain: "Looks things up on the public internet (search engines, company IR sites, SEC…).",
    color: "#6ec4c4",
  },
  data_fetch_internal: {
    label: "Reads our own systems",
    plain: "Reads data we already store (databases, files, our own APIs).",
    color: "#8fc496",
  },
  data_write_internal: {
    label: "Saves into our systems",
    plain: "Writes or updates records in our databases or file storage.",
    color: "#6ecf9a",
  },
  auth_identity: {
    label: "Login & identity checks",
    plain: "Verifies who someone is — passwords, one-time codes, tokens, or vendor logins.",
    color: "#8fc4a0",
  },
  realtime_push: {
    label: "Live updates",
    plain: "Pushes instant updates to a screen or phone (live status, tips, notifications).",
    color: "#e0a060",
  },
  proxy_forward: {
    label: "Passes a request along",
    plain: "Acts as a middleman — forwards a request to another internal service.",
    color: "#90b0c8",
  },
  job_orchestrate: {
    label: "Starts / tracks a job",
    plain: "Kicks off longer work (generate a report, schedule a scrape) and tracks progress.",
    color: "#a0c4e0",
  },
  binary_media: {
    label: "Handles files & media",
    plain: "Creates or serves files — PDFs, Excel, audio, downloads, uploads.",
    color: "#c4a88a",
  },
  billing_vendor: {
    label: "Tracks vendor spend",
    plain: "Pulls usage/cost data from AI or cloud vendors for budgets and alerts.",
    color: "#d48fa3",
  },
  health_ops: {
    label: "Health & ops checks",
    plain: "Simple “are we up?” checks, versions, or diagnostics for operators.",
    color: "#888899",
  },
  other: {
    label: "Other integration",
    plain: "A specialized connection (email, e-sign, embed, mail campaigns…).",
    color: "#9988aa",
  },
};

/**
 * @param {string} kind
 * @returns {KindPlain}
 */
export function plainForKind(kind) {
  const base = kind.split(":")[0];
  return (
    kindPlain[base] ?? {
      label: kind,
      plain: "Specialized connection — see purpose column.",
      color: "#9988aa",
    }
  );
}

/**
 * @typedef {Object} PlainGuide
 * @property {string} title - Friendly product name
 * @property {string} oneLiner - What it is in one breath
 * @property {string} doesThis - What a newcomer should remember
 * @property {string} [doesNot] - Common confusion to avoid
 * @property {string} whoFor - Who uses it day to day
 * @property {string} aiStory - How AI shows up (or why it doesn't)
 * @property {string[]} readOrder - How to read the dossier
 */

/** @type {Record<string, PlainGuide>} */
export const plainGuides = {
  "pi-py": {
    title: "DD engine",
    oneLiner: "Builds deep company research reports — gathers data, writes sections with AI, runs valuation math.",
    doesThis: "This is where the long diligence write-ups are actually generated. Finished reports land on the shared PI disk (EFS).",
    doesNot: "It is not the login screen and not the investor portal. PI control starts the job; the DD engine does the heavy writing.",
    whoFor: "Investment team using Phoenician Intelligence for due diligence.",
    aiStory: "Uses many AI providers (Claude, OpenAI, Gemini, DeepSeek, and others) plus document search. Writing rules live as prompt templates.",
    readOrder: [
      "Start with “What this does”",
      "Scan the activity mix chips (what kinds of work dominate)",
      "Skim the conversation table — each row is “this part talks to that system”",
      "Open AI instructions for models and writing rules",
    ],
  },
  "pi-net": {
    title: "PI control",
    oneLiner: "The front desk for Phoenician Intelligence — login, start/cancel jobs, live status, notes, billing.",
    doesThis:
      "Coordinates people and jobs. It asks the DD engine to write reports; reads the shared PI disk (EFS); and can send DD / risk / DCF data to Portfolio over a secure API.",
    doesNot:
      "Does not write the report sections itself. Portfolio does not share this login and does not mount EFS — it only calls this API.",
    whoFor: "Same research users (via the website) plus ops watching costs and status.",
    aiStory: "Almost no research AI here. OpenAI is used for text-to-speech. Claude is used only for developer log analysis.",
    readOrder: [
      "Read “What this does” — especially what it does not do",
      "Look for job / status / login / Portfolio API rows in the table",
      "Confirm AI story: orchestration, not report writing",
    ],
  },
  "efs-pi": {
    title: "PI EFS",
    oneLiner: "The shared file drive where DD reports and CapIQ dumps live for Phoenician Intelligence.",
    doesThis: "Stores company folders, progress markers, and raw downloads so PI control and the DD engine see the same files.",
    doesNot:
      "Not a database. Not mounted by Portfolio — Portfolio receives DD data through the PI control API instead.",
    whoFor: "PI backends only (PI control + DD engine).",
    aiStory: "No AI on the disk itself — it stores the outputs of the DD engine.",
    readOrder: ["What this does → who mounts it → how Portfolio still gets DD (via PI API)."],
  },
  "pi-fe": {
    title: "PI website",
    oneLiner: "The screens analysts click — Diligence, Risks, Screener, Portfolio embeds, notes.",
    doesThis: "Presents the product. It asks PI control for data and job actions.",
    doesNot: "It does not call CapIQ or write diligence sections in the browser.",
    whoFor: "Analysts and PMs in the browser.",
    aiStory: "No local AI writing. Displays AI-generated reports; can request read-aloud through the backend.",
    readOrder: ["One-liner → activity mix → table of who it talks to → AI story (usually “none locally”)."],
  },
  "pm-serve": {
    title: "Portfolio API",
    oneLiner: "Builds and maintains investment “books” — research stages, scores, live tips.",
    doesThis:
      "Runs the Portfolio strategy pipeline and serves results to the PM website. Pulls DD / risk / DCF from PI control over a secure API.",
    doesNot:
      "Does not mount PI’s shared EFS disk. Not Earnings Tracker (calendar scrape). Not the marketing factsheet site.",
    whoFor: "Portfolio management team.",
    aiStory:
      "Claude models by stage. Optional DeepSeek for universe-run. Strict rule: some research (earnings, debate, lessons…) must not change portfolio weights.",
    readOrder: ["What this does → link to PI (HTTP, not EFS) → AI instructions (especially NEVER→weights)."],
  },
  "pm-fe": {
    title: "PM website",
    oneLiner: "Website for viewing books, trades, lessons, and live tips.",
    doesThis: "Shows strategy results from the Portfolio API.",
    doesNot: "Does not run the AI stages in the browser. Does not talk to PI directly.",
    whoFor: "Portfolio team in the browser.",
    aiStory: "No browser AI — all stage prompts (Claude + optional DeepSeek) run on the Portfolio API server.",
    readOrder: ["One-liner → who it talks to → open Portfolio API for AI depth."],
  },
  ep: {
    title: "EP (portfolio)",
    oneLiner: "Advisory research on upcoming earnings prints — never feeds the weight engine.",
    doesThis: "Runs a staged CapIQ → forecast pipeline inside the portfolio repo.",
    doesNot: "Not Earnings Tracker (that other product scrapes IR calendars with DeepSeek).",
    whoFor: "Portfolio research — advisory only.",
    aiStory:
      "Claude for judging and insider pass; DeepSeek for calendar date extract. Results stay advisory.",
    readOrder: ["Read “does not” carefully → stages list → models."],
  },
  "portal-api": {
    title: "Portal API",
    oneLiner: "Secure home for investors & admins: login, documents, KYC, e-sign, IR mail, market quotes.",
    doesThis: "Stores investor data and runs admin tools. Emails via Resend; live e-sign via DocuSeal.",
    doesNot: "Not Phoenician Intelligence login (different JWT). DocuSign code exists but is not wired live.",
    whoFor: "Investors (app/web) and internal admins.",
    aiStory: "AI is admin-only: OpenAI helps rename/split/extract fields from uploaded PDFs — not for portfolio investment decisions.",
    readOrder: ["What this does → AI story → email/e-sign rows → conversation table."],
  },
  "portal-web": {
    title: "Portal Web",
    oneLiner: "Admin and investor screens for docs, KYC, forms, IR mail, and factsheet tools.",
    doesThis: "The clickable portal UI talking to Portal API.",
    doesNot: "Does not host the AI extractors itself — those run on the API.",
    whoFor: "Admins and investors in the browser.",
    aiStory: "UI can trigger admin AI tools; models live on Portal API.",
    readOrder: ["One-liner → who it talks to → open Portal API for AI detail."],
  },
  "portal-mobile": {
    title: "Mobile",
    oneLiner: "Phone app for investors — login, documents, KYC, push alerts, e-sign.",
    doesThis: "Talks to Portal API. Can also poll Yahoo directly for prices.",
    doesNot: "No AI on the phone. Not connected to Phoenician Intelligence.",
    whoFor: "Investors on iOS/Android.",
    aiStory: "None on-device. Any document AI is an admin/backend feature.",
    readOrder: ["What this does → login & push rows → confirm no AI."],
  },
  screen: {
    title: "Screener",
    oneLiner: "Core product — CapIQ universe triage with the PM’s living framework (Pass/Watch).",
    doesThis: "Chat and triage while working in CapIQ; remembers principles over time. Own map box (peer to Research hub / Portfolio / Investors); also embeds inside the PI shell.",
    doesNot: "Not Linker (hyperlinks) and not PI’s CapIQ Excel download bots — separate CapIQ consumers.",
    whoFor: "PM / screening workflow (browser extension + embedded dashboard in PI).",
    aiStory: "Heavy AI: chat, screen triage, auditor, memory. Partner vs Screener personas.",
    readOrder: ["What this does → activity mix → AI personas → conversation table."],
  },
  linker: {
    title: "Linker",
    oneLiner: "Two tools: a web uploader that injects CapIQ hyperlinks into Excel, and a CLI that scores capital allocation.",
    doesThis: "Web path patches workbooks. CLI path can ask Claude for a qualitative score. Lives in the Screener map cluster.",
    doesNot: "The website linker has no AI. Not the Screener agent itself.",
    whoFor: "Analysts needing CapIQ-linked sheets; CLI for ranking runs.",
    aiStory: "AI only in the CLI qualitative step (Claude). The web uploader has no AI.",
    readOrder: ["Read “does not” → separate CLI vs web rows → AI tab."],
  },
  earnings: {
    title: "Earnings Tracker",
    oneLiner: "Finds earnings events on the web, summarizes them, shows a calendar dashboard.",
    doesThis: "Scheduled scrapes + DeepSeek summaries + calendar invites.",
    doesNot: "Not EP (portfolio) — that other tool forecasts next prints for books.",
    whoFor: "Anyone tracking IR calendars / event summaries.",
    aiStory: "DeepSeek only (finder vs summary models).",
    readOrder: ["What this does → schedules → AI models → table."],
  },
  factsheet: {
    title: "Factsheet",
    oneLiner: "Marketing page that exports a PDF/Excel for the offshore fund.",
    doesThis: "Pretty factsheet from bundled data (+ optional live top-5 in dev).",
    doesNot: "No AI. Not the live Portfolio API. Admin twin lives on the portal.",
    whoFor: "Marketing / IR producing a static factsheet.",
    aiStory: "None — fee and performance math are deterministic.",
    readOrder: ["One-liner → confirm no AI → export/file rows."],
  },
  "mail-sender": {
    title: "Mail Sender",
    oneLiner: "Sends investor-relations email campaigns through Microsoft Graph from Excel lists.",
    doesThis: "Parse a list → send via Graph.",
    doesNot: "No AI. Portal has a related IR mail UI with its own limits.",
    whoFor: "IR / ops sending campaigns.",
    aiStory: "None.",
    readOrder: ["One-liner → Graph mail row."],
  },
  "pi-global": {
    title: "PI Global",
    oneLiner: "The interactive picture of Phoenician’s products you’re using right now.",
    doesThis: "Explains how systems connect using the knowledge base — no live trading or investor data.",
    doesNot: "Does not call CapIQ or AI vendors at runtime.",
    whoFor: "Anyone learning the estate — technical or not.",
    aiStory: "None at runtime. Guides are written from documentation.",
    readOrder: ["You’re here — pick another product on the left."],
  },
};

export function guideFor(nodeId) {
  return plainGuides[nodeId] ?? null;
}

/** Short badge for list rails */
export function aiBadge(hasLlm) {
  return hasLlm ? { label: "Uses AI", tone: "llm" } : { label: "No AI", tone: "none" };
}
