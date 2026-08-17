/**
 * Product pipelines — the real functional workflow behind each product,
 * derived by reading the actual codebases (not the architecture docs, which
 * in several cases were found to be stale). Stages describe what actually
 * happens and what triggers it, not raw "endpoint X calls endpoint Y" wiring.
 *
 * `ai.provider` is one of: "claude" | "openai" | "gemini" | "deepseek" |
 * "perplexity" | "ai" (an AI call confirmed but the exact provider/model
 * wasn't pinned down with certainty) | "mixed" (more than one provider in
 * this one stage) | "none" (deterministic code, no AI call at all).
 *
 * @typedef {{ provider: string, model?: string, note?: string }} StageAi
 * @typedef {{ name: string, description: string, triggeredBy?: string, ai: StageAi }} PipelineStage
 * @typedef {{
 *   id: string,
 *   group: string,
 *   product: string,
 *   oneLiner: string,
 *   stages: PipelineStage[],
 *   enhancementIdeas: string[],
 *   sourceNotes?: string,
 * }} Pipeline
 */

/** @type {Pipeline[]} */
export const pipelines = [
  {
    id: "dd",
    group: "Diligence",
    product: "DD Pipeline",
    oneLiner:
      "Turns a requested ticker into a finished, cached 12-section institutional due-diligence report (with an embedded DCF model) and keeps it interrogable afterward through a report-aware chatbot.",
    sourceNotes:
      "Existing docs (ARCHITECTURE.md, FLOWCHART.md, AI_FLOW.md) were stale on two material points the code contradicts: they describe 14 sections with DCF as its own numbered section, when the real code has 12 sections with DCF nested inside Section 8; and they state the wrong production order.",
    stages: [
      {
        name: "Request intake & freshness check",
        description:
          "A user submits a ticker via the frontend form; the .NET backend creates a TickerRequest row and POSTs to the Python service. Python checks whether raw data for that ticker already exists and is fresher than 90 days, and separately whether each individual source (AlphaSense, CapIQ Excel files, PDFs) is present — this decides whether to skip, selectively refresh, or fully re-collect data.",
        triggeredBy: "User submits the ticker request form",
        ai: { provider: "none", note: "Pure freshness/date-diff logic against Postgres" },
      },
      {
        name: "Parallel data collection",
        description:
          "Up to four data sources run concurrently: AlphaSense analyst PDFs, CapIQ financials/multiples/board/compensation/competitor segments, an investor-relations/SEC/transcript PDF crawler, and company review scraping. Only sources actually missing or stale are run, followed by an Excel-cleaning pass that uses Claude to detect table boundaries and normalize raw spreadsheets.",
        triggeredBy: "Freshness check finds data missing, stale, or force-refreshed",
        ai: { provider: "claude", note: "Scraping itself has no AI; the Excel-cleaning sub-step is Claude" },
      },
      {
        name: "Isolated workflow launch",
        description:
          "The report-writing workflow runs as its own separate process (own memory, own AI connections) so concurrent reports for different tickers can never contaminate each other.",
        triggeredBy: "Data collection completing (or being skipped because data was already fresh)",
        ai: { provider: "none", note: "Process/infra orchestration only" },
      },
      {
        name: "Context assembly",
        description:
          "All the cleaned financial data, board/executive info, and ownership data gets loaded into memory; live price and 5-year price history are pulled; an AI writes a short plain-English company description that gets reused across every later section.",
        triggeredBy: "Workflow starting",
        ai: { provider: "ai", note: "Company-description writer — exact model not pinned down yet" },
      },
      {
        name: "Institutional memory lens",
        description:
          "Pulls prior institutional context/memory for the company or sector and turns it into guiding questions injected into every section's writing prompt. Fails silently if memory is thin — the rest of the run proceeds unaffected.",
        triggeredBy: "Context assembly finishing",
        ai: { provider: "ai", note: "Advisory-question generation — exact model not pinned down yet" },
      },
      {
        name: "Document search setup",
        description:
          "All scraped company documents are indexed for AI search, and the analyst research PDFs are indexed separately — so \"our own documents\" and \"external analyst research\" stay queryable as two independent evidence pools.",
        triggeredBy: "Memory lens step completing",
        ai: { provider: "gemini", model: "Gemini File API", note: "File indexing/upload, not generation" },
      },
      {
        name: "Research query generation",
        description:
          "For each section, Claude Sonnet generates targeted search queries, which are scored for quality and regenerated if they fall short. Research for several sections can be fetched ahead of time in parallel to save time.",
        triggeredBy: "Each section's turn to be written (or pre-fetched ahead of time)",
        ai: { provider: "claude", model: "Claude Sonnet" },
      },
      {
        name: "Evidence retrieval",
        description:
          "Approved queries are run against the indexed documents via Gemini file search; the results are tagged with their source and page, deduplicated, and assembled into an evidence packet for that section.",
        triggeredBy: "Queries approved",
        ai: { provider: "gemini", model: "Gemini File Search" },
      },
      {
        name: "Section-by-section writing",
        description:
          "Real production order: Company Overview → Team & Culture → Competitors → TAM → Market Positioning → Performance & Estimates → Valuation → Financial Health → Technical Indicators → Red Flags → Conclusion → Research Challenge. Each section is skipped if already cached; otherwise it's written by Claude from the company info, financials, evidence, and prior sections, and cached to disk.",
        triggeredBy: "Each section's prerequisites (the sections it depends on) being complete",
        ai: { provider: "claude", note: "The main report-writing model for every section" },
      },
      {
        name: "Red Flags analysis",
        description:
          "A dedicated adversarial pass runs 17 fixed risk questions against the evidence and the open web, then writes up the findings. It has no dependencies, so it starts early and runs in the background while other sections are still being written.",
        triggeredBy: "The report run starting (runs independently, no waiting)",
        ai: { provider: "ai", note: "Same report-writing model family as other sections, unconfirmed which exact call" },
      },
      {
        name: "Valuation (embeds the DCF)",
        description:
          "Runs the full DCF Pipeline (see below) to build an Excel valuation model, then writes the section's narrative using the DCF's exact numbers so the writing can't drift from the model, followed by a comparables-valuation pass against the competitor list.",
        triggeredBy: "The sections it depends on completing",
        ai: { provider: "mixed", note: "Embeds the entire DCF Pipeline (see below) plus its own narrative-writing call" },
      },
      {
        name: "Conclusion",
        description:
          "Synthesizes the whole report — pulling in the DCF valuation numbers and the Red Flags findings — into the final investment rating and confidence level. Written second-to-last on purpose, so it can react to everything that came before it, including Red Flags.",
        triggeredBy: "All prior sections completing",
        ai: { provider: "ai", note: "Report-writing model family, unconfirmed which exact call" },
      },
      {
        name: "Research Challenge",
        description:
          "A dedicated contrarian pass that takes the final rating and builds the bull/bear case against it, generates a weighted counter-thesis, and drafts management cross-examination questions. Genuinely written last.",
        triggeredBy: "The Conclusion's rating being available",
        ai: { provider: "mixed", note: "Bull/bear stance mapping is deterministic code; thesis and questions are AI-generated" },
      },
      {
        name: "Assembly & completeness check",
        description:
          "All 12 sections are assembled in canonical order; a completeness check flags the report as partial if anything is missing; the rating, valuation ratio, and confidence are extracted and sent back to the main system.",
        triggeredBy: "All 12 sections present",
        ai: { provider: "none", note: "Assembly, counting, and an HMAC-signed callback — no AI" },
      },
      {
        name: "Persistence & notification",
        description:
          "The .NET backend verifies the signed callback, saves the full report to the database, marks the request complete, and emails the requester.",
        triggeredBy: "Signed completion callback arriving",
        ai: { provider: "none" },
      },
      {
        name: "Report display & chat/QA",
        description:
          "Once the report is marked complete, the frontend renders it. Opening the chat routes each message through an intent classifier into general Q&A, Gemini-powered PDF search, Excel search, or a section-rewrite suggestion — which produces a diff the user has to explicitly accept, never an unreviewed auto-edit.",
        triggeredBy: "User opens the report / opens the chat panel",
        ai: { provider: "mixed", note: "Intent classifier + Q&A + suggestion-writer are AI; PDF search is Gemini; Excel search is a plain webhook" },
      },
    ],
    enhancementIdeas: [
      "The architecture docs describe a 14-section report; the real code has 12, with DCF nested inside Section 8. Any diagram/visualization should follow the code's model, not the docs.",
      "Docs say the report finishes [...,10,1,11,12]; the real order is [...,10,12,1,11] — Red Flags is deliberately finished before the Conclusion so its findings can inform the rating, and Research Challenge is genuinely last.",
      "\"Update Report\" always reruns a section fully from scratch — there's no partial/diff-based regeneration at that layer. The only diff-based edit path is the chatbot's suggest-and-accept flow, a completely separate mechanism worth distinguishing in any visualization.",
      "\"Update Report\" also purges five whole cache directories even when only some upstream data actually changed — there's no middle ground between \"regenerate everything\" and \"regenerate nothing.\"",
      "A partially-built \"skills\" layer already injects guidance into every section and the DCF, but the governance layer around it (a locked skill-binding map, a verification log proving each skill fires only where intended) is still open per the DD Brain integration notes.",
      "The institutional memory lens fails silently on any error, with no signal in the final report about whether it actually influenced a given run — there's currently no way to tell from the output whether \"house view\" context was used.",
    ],
  },
  {
    id: "dcf",
    group: "Diligence",
    product: "DCF Pipeline",
    oneLiner:
      "Given a company's research and cleaned financials, autonomously writes, reviews, runs, and sanity-checks a from-scratch valuation model into a full Excel workbook, then narrates it into assumptions documentation.",
    sourceNotes:
      "Nested inside the DD Pipeline's Valuation section — it isn't its own top-level report section, and had no dedicated docs of its own, so this was read almost entirely from the pipeline's own code.",
    stages: [
      {
        name: "Unit-economics discovery",
        description:
          "Figures out what actually drives the company's revenue — subscribers, units sold, same-store sales, etc. — and how detailed the model needs to be, based on the company description and research.",
        triggeredBy: "Valuation section starting, once research and financials are ready",
        ai: { provider: "ai" },
      },
      {
        name: "Assumption extraction",
        description:
          "Pulls valuation drivers straight from the company's filings and research, and separately from what the report's own earlier sections already implied about the business (skipped for a standalone DCF run with no prior sections).",
        triggeredBy: "Discovery step producing its spec",
        ai: { provider: "ai" },
      },
      {
        name: "Constraints & guidance mapping",
        description:
          "Classifies each assumption as binding (must honor management's stated guidance), strong, or reference-only, so the model-building step knows which figures it's not allowed to override.",
        triggeredBy: "Both extraction passes completing",
        ai: { provider: "ai" },
      },
      {
        name: "Model generation",
        description:
          "Writes a complete valuation model from scratch as real spreadsheet-building code — genuine generation of the model logic, not a template being filled in. Default model is provider-switchable.",
        triggeredBy: "Constraints map being ready",
        ai: { provider: "openai", model: "GPT-5.5 (high reasoning effort)", note: "Provider-switchable; this is the configured default" },
      },
      {
        name: "Financial sanity review",
        description:
          "Checks the financial logic of the generated model (not just whether it runs) before it's ever executed, with one corrective pass if problems are found.",
        triggeredBy: "Model code being generated, before execution",
        ai: { provider: "ai" },
      },
      {
        name: "Code review & correction",
        description:
          "A structured review of the generated code, with a fix pass applied only if issues are found. A failure here sends the whole thing back to model generation for one retry.",
        triggeredBy: "Sanity review resolving",
        ai: { provider: "ai" },
      },
      {
        name: "Balance-sheet balance check",
        description:
          "A dedicated, deliberately expensive check that re-reads the whole model purely to catch balance-sheet imbalance bugs before it's ever run — pinned to a specific model regardless of the provider setting used elsewhere in this pipeline.",
        triggeredBy: "Code review passing",
        ai: { provider: "claude", model: "Claude Opus 4.8 (pinned — the code explicitly forbids substituting a cheaper model here)" },
      },
      {
        name: "Compilation check",
        description:
          "A pure syntax check with no AI judgment involved. If it fails, an automatic fix pass runs once; if it still fails, the whole thing goes back to model generation.",
        triggeredBy: "Balance check passing",
        ai: { provider: "none", note: "Syntax check itself is deterministic; the fix pass on failure is AI" },
      },
      {
        name: "Execution",
        description:
          "Runs the generated model to actually produce the Excel file. On failure, an automatic patch-and-retry pass runs, saving every failed attempt for debugging.",
        triggeredBy: "Successful compilation",
        ai: { provider: "none", note: "Execution itself is deterministic; the runtime-fix pass on failure is AI" },
      },
      {
        name: "Post-processing & value caching",
        description:
          "Fixes column widths, then opens the workbook headlessly to cache the computed formula results — this has to be the very last step before anything reads the numbers out.",
        triggeredBy: "Successful execution",
        ai: { provider: "none" },
      },
      {
        name: "Post-execution balance repair",
        description:
          "Re-checks the balance sheet now that real computed numbers exist (a separate, later check than the pre-execution one), looping back through the gate-and-rerun cycle if it's still broken.",
        triggeredBy: "Cached values being available",
        ai: { provider: "ai" },
      },
      {
        name: "Metrics extraction",
        description:
          "Pulls the intrinsic value, price-to-value ratio, and related numbers out of the finished workbook.",
        triggeredBy: "A balanced workbook",
        ai: { provider: "none" },
      },
      {
        name: "Plausibility gate",
        description:
          "If the valuation ratio comes out implausible (too far above or below the current market price), an AI directly patches specific assumption cells — with a locked list of inputs it's explicitly forbidden from touching — to pull the valuation back toward a coherent range. Skipped for user-uploaded models.",
        triggeredBy: "Extracted valuation ratio falling outside a sane range",
        ai: { provider: "ai" },
      },
      {
        name: "Documentation",
        description:
          "Writes up the valuation assumptions and final numbers into a readable narrative that the DD report's Valuation section quotes directly, so the written report can't state different figures than the model.",
        triggeredBy: "Plausibility gate resolving (or being skipped)",
        ai: { provider: "ai" },
      },
    ],
    enhancementIdeas: [
      "The engine's own documentation lists a final \"executive summary\" step as part of the DCF pipeline, but it's not actually implemented here — the calling DD Pipeline does that work itself. It's really the handoff between the two pipelines, not an internal DCF step.",
      "At least three different failure points all reset all the way back to full model regeneration — there's no cheaper \"patch just the broken part\" retry; every retry rebuilds the entire model from scratch.",
      "The plausibility gate directly edits the model's own assumptions to force the valuation into a market-relative range — meaning the number an analyst ultimately reads can be an artifact of a gate correction rather than a pure first-pass output. Worth distinguishing \"gate intervened\" runs from \"passed through untouched\" runs.",
      "Balance-sheet integrity is checked twice by two different mechanisms, and the second one can loop back through a full regenerate-compile-execute cycle — in the worst case a single valuation can trigger several complete rebuilds just to fix balance-sheet issues.",
      "Multi-provider routing plus at least one step pinned to Opus 4.8 regardless of the provider setting means cost and latency aren't uniform across steps — a real cost-tracking view would need per-step granularity, not one flat \"DCF cost\" figure.",
    ],
  },
  {
    id: "screening",
    group: "Screening",
    product: "Screening Pipeline",
    oneLiner:
      "Every chat about a company gets mined into durable observations, which get consolidated nightly into per-company memos and archetype playbooks, which then calibrate the Agent Skills that actually vote Pass/Watch on the universe — so the screener keeps re-learning the PM's own judgment instead of running a fixed rulebook.",
    sourceNotes:
      "The existing docs describe an older version of the system (chat → observations → nightly consolidation → mind narrative) and don't mention playbooks, the Agent Skills roster, the \"Model vs [PM]\" shadow critique, or the Next Evolution pass at all — all of it had to be traced from the actual code.",
    stages: [
      {
        name: "Universe seeding",
        description:
          "Roughly 16-17k CapIQ companies are bulk-loaded into the screening pool with no verdict yet. A one-time/periodic manual import, not a live per-click add.",
        triggeredBy: "A manager exports the CapIQ universe and runs the importer",
        ai: { provider: "none" },
      },
      {
        name: "Chat / triage conversation",
        description:
          "While looking at a company in CapIQ, the PM chats with an AI \"sparring partner\" persona that debates their Pass/Watch lean using the live verdict, financial gates, ownership data, and the PM's own prior words on this and similar names.",
        triggeredBy: "PM opens a company page and starts chatting",
        ai: { provider: "ai", note: "The pc-sparring-partner skill's underlying model" },
      },
      {
        name: "Insight extraction into Observations",
        description:
          "A high-effort Claude call mines the chat transcript for durable signal — reasoning, hesitations, sentiment, exact phrasing — and merges it (never overwrites) into the PM's growing profile. If the chat's verdict differs from the screener's own prior call, the PM's call wins and is frozen against future re-screens.",
        triggeredBy: "PM finishes the chat",
        ai: { provider: "claude", note: "extractInsights — explicitly a high-effort Claude call" },
      },
      {
        name: "Nightly consolidation",
        description:
          "Each night, Anthropic's Dreams pipeline reads the day's chats plus the accumulated observation store and consolidates: per-company memos are tightened, stale stances retired, and cross-company patterns surfaced into candidate principles for the PM to accept or reject.",
        triggeredBy: "Nightly schedule (also runnable manually from the dashboard)",
        ai: { provider: "claude", note: "\"Anthropic's Dreams pipeline\" per the codebase's own naming" },
      },
      {
        name: "Playbooks",
        description:
          "The archetypes the PM actually thinks in (e.g. \"Founder-Led Compounders\") are discovered by reading the full observation history with an AI — no hardcoded list — and one dense rulebook is built per archetype. Each company gets tagged with 1-3 archetypes and the matching playbook is injected at screening time.",
        triggeredBy: "Automatically chained right after nightly consolidation",
        ai: { provider: "ai", note: "Archetype discovery and per-archetype synthesis are separate AI calls" },
      },
      {
        name: "Skills Update",
        description:
          "Fresh playbooks and standing corrections (cases where the screener's verdict differed from the PM's own chat verdict) are diffed against each Agent Skill's current calibration, and gaps become short calibration notes appended to that skill.",
        triggeredBy: "Manual only — the dashboard's \"Run Full Refresh\" or \"Skills Update\" button, not on the nightly schedule",
        ai: { provider: "ai", note: "Gap-diffing and note-routing are both AI calls" },
      },
      {
        name: "Agent Skills",
        description:
          "Six defined roles do the actual work on every call: a code-owned Gatekeeper (financial gates, never touched by the learning loop), a Research role (facts only, no verdict), the Triage role (the actual Pass/Watch decision), a Critique role (blind second opinion), a Correction-Learner, and the chat persona itself. Each call sees the full roster plus its accumulated calibration notes.",
        triggeredBy: "Every screening batch and every chat turn",
        ai: { provider: "mixed", note: "The Gatekeeper role itself is deterministic code; the other five are AI roles" },
      },
      {
        name: "Screening decision (Pass/Watch)",
        description:
          "For each queued company: pull live quote and ownership data → classify archetype and fetch the matching playbook → get a research brief → compute the deterministic financial gates → run Triage, which must output exactly Pass or Watch (no vague middle ground) with reasoning and confidence → commit the verdict and log the history.",
        triggeredBy: "PM clicks \"Screen next N\" (auto-prioritized) or force-reprocesses a name",
        ai: { provider: "mixed", note: "Financial gates are deterministic math; archetype classification and the Triage verdict are AI" },
      },
      {
        name: "Shadow critique",
        description:
          "For companies the PM has personally decided in chat, a separate blind pass re-votes the same name using the same gates and playbooks — without seeing the PM's actual call — then reveals it and reconciles the two. A real disagreement becomes a correction that feeds back into Skills Update and Playbooks.",
        triggeredBy: "A separate \"shadow re-screen\" run over the PM's own decided names",
        ai: { provider: "ai", note: "The pc-screen-critique skill's underlying model" },
      },
      {
        name: "Next Evolution",
        description:
          "A distinct forward-looking pass over already-Passed names — industry trajectory, reinvestment, optionality — anchored on the PM's own revealed taste rather than the stated framework.",
        triggeredBy: "Runs automatically for the backlog, or explicitly via \"Study selected\"",
        ai: { provider: "ai" },
      },
    ],
    enhancementIdeas: [
      "The three main docs and the README describe chat → observations → nightly consolidation → mind narrative, and never mention playbooks, the Agent Skills roster, the shadow critique/corrections loop, or Next Evolution — all large, already-shipped systems. Anyone onboarding from docs alone would miss roughly half of what actually decides a Pass/Watch verdict today.",
      "The learning loop isn't fully automatic: nightly consolidation and Playbooks refresh on their own every night, but Skills Update (the step that actually recalibrates the Triage/Critique/chat skills) and Next Evolution only run when someone manually clicks a button. If nobody opens the dashboard, playbooks keep refreshing but the skills' calibration goes stale — the last, most agent-shaping link in the chain is manual-only.",
      "The admin and screening endpoints reportedly have no authentication on a public IP, and several of them (Refresh All, Skills Update, running Dream) can mutate the calibrated framework and spend real API budget — worth prioritizing over new features.",
      "A company the PM decided on months ago under an older, looser framework is permanently frozen against re-screening unless the PM manually reopens a chat — there's no automated \"framework moved meaningfully since this verdict was set\" flag.",
      "Skills Update routes every calibration note into one of five fixed skill buckets via a single automated classification with no human review step — unlike the proposed-principles flow used elsewhere, which does have a human accept/reject step. Extending that same review pattern to Skills Update notes would match the rest of the product's own stated philosophy of keeping the investor in control of the framework.",
    ],
  },
  {
    id: "portfolio",
    group: "Portfolio",
    product: "Portfolio Pipeline",
    oneLiner:
      "Turns Phoenician Intelligence's live due-diligence, risk, and DCF research into two independently-tracked model portfolios — an AI-run book whose membership, valuations, risk read, sizing, and final sign-off are all done by a chain of Claude calls, and a human hand-set benchmark book that gets the same research context but is never algorithmically re-sized.",
    sourceNotes:
      "A separate post-hoc \"Lessons\" memory grades the AI's own past calls and is explicitly, permanently walled off from ever feeding back into a future weight — a deliberate guardrail confirmed directly in the codebase's own hard-ban rules.",
    stages: [
      {
        name: "Research intake",
        description:
          "Fetches every covered company's due-diligence dossier, risk audit, and DCF model fresh from Phoenician Intelligence into a throwaway cache for this run only — nothing is kept long-term, so every run reads the current state of the research, never a stale copy.",
        triggeredBy: "A human clicks Run/Rerun AI (there's no automatic weekly schedule, even though the machinery for one exists)",
        ai: { provider: "none", note: "A plain API fetch from Phoenician Intelligence" },
      },
      {
        name: "Membership screening",
        description:
          "A Claude pass reads each candidate's research in small batches and makes an include/exclude call with a thesis and a moat view, favoring genuinely new ideas over ones already included. A second whole-book Claude pass consolidates the survivors into a final roster — there's no fixed name count. Applies only to the AI book; the human's book is picked by hand.",
        triggeredBy: "Research intake completing",
        ai: { provider: "claude" },
      },
      {
        name: "Per-company valuation",
        description:
          "An independent Claude pass per company re-derives its own intrinsic value from the DCF and research (correcting assumptions it judges stale), producing a price-to-value read and an expected return. A pure value judgment — it never looks at risk or trading history.",
        triggeredBy: "Membership screening choosing the roster (or a save in the human's Weight Lab)",
        ai: { provider: "claude" },
      },
      {
        name: "Independent risk read",
        description:
          "A separate, adversarial Claude pass attacks the valuation's assumptions using the risk audit and full price history, producing the strongest bear case and a volatility estimate. This is the only place past price behavior is allowed to matter — and only as a risk signal, never a return signal.",
        triggeredBy: "Each name's valuation completing",
        ai: { provider: "claude" },
      },
      {
        name: "Weight construction",
        description:
          "The book is drafted several times in parallel by Claude, each draft sizing every name to maximize risk-adjusted return with a soft return target, tilting toward cheap durable names and staying diversified. The best draft is kept and refined further, only accepting a change if it genuinely scores better.",
        triggeredBy: "Every chosen name having both a valuation and a risk read",
        ai: { provider: "claude" },
      },
      {
        name: "Sign-off review",
        description:
          "One final, maximum-effort Claude pass writes the case for the whole book — justifying every weight, explaining the ranking, and stating plainly there's no backtest behind the numbers. Required: if it fails, the entire run is discarded and the previous book keeps serving, flagged stale.",
        triggeredBy: "Weight construction settling",
        ai: { provider: "claude", note: "Described in source as the pipeline's \"maximum-effort\" pass" },
      },
      {
        name: "Forward risk-factor model",
        description:
          "A last, non-critical pass decomposes each holding's forward risk into a few shared factors purely to power the frontend's what-if weight simulator. Never changes a weight — if it fails, the book still ships and the simulator is just marked unavailable.",
        triggeredBy: "Sign-off completing",
        ai: { provider: "ai", note: "Non-critical; exact provider not confirmed" },
      },
      {
        name: "Validate & publish",
        description:
          "Deterministic code (not AI) normalizes weights to 100%, caps any single name and cash, and requires every holding to carry a reason before the book is written and served. Any upstream failure keeps the last good book live rather than publishing something half-built.",
        triggeredBy: "Every stage above completing",
        ai: { provider: "none" },
      },
      {
        name: "Live tracking & execution",
        description:
          "Prices refresh continuously, updating live values without touching the target weights. The gap between current and target weight is labeled Buy/Sell/Hold and gradually filled in a liquidity-aware simulation — this is the live Trades view.",
        triggeredBy: "Continuous background refresh, independent of when a new book was built",
        ai: { provider: "none" },
      },
      {
        name: "Human hand-set book",
        description:
          "A fully independent second book: the human picks membership and weights by hand, gets the same Claude valuation/risk passes run over his own names for informational purposes only, and every save anchors and executes on its own. No AI review ever resizes his numbers.",
        triggeredBy: "The human edits and saves the Weight Lab",
        ai: { provider: "claude", note: "Same valuation/risk-read calls as the AI book, informational only" },
      },
      {
        name: "Advisory overlays",
        description:
          "Insider filings, earnings previews, a trade-pacing tool, and a Q&A surface all read the same research and publish to the Research tab — every one of them is hard-banned in code from ever writing into a book's weights. They inform a human; they never move a number.",
        triggeredBy: "Each runs on its own separate trigger",
        ai: { provider: "mixed", note: "Each overlay has its own AI call; see EP (Earnings Preview) for one of them" },
      },
      {
        name: "Lessons",
        description:
          "A separate set of Claude passes compares the AI book's past forecasts to what actually happened, drafting written lessons that graduate from proposed to validated (or get retired). Deliberately never injected back into the reasoning stages — grading the AI's judgment and improving it are kept as two separate, human-mediated steps.",
        triggeredBy: "A human viewing or refreshing the Lessons page — always after the fact",
        ai: { provider: "claude" },
      },
    ],
    enhancementIdeas: [
      "The weekly auto-recompute scheduler exists in code but is switched off — today the AI book only reweights when a human manually triggers a run, so it can sit stale indefinitely despite the machinery to run on a cadence already being built.",
      "Lessons are explicitly advisory and never automatically injected back into any stage — a real, deliberate guardrail, but it also means the feedback loop doesn't close on its own: a human has to read a lesson and manually act on it for it to ever affect a future book.",
      "A single failed stage anywhere in a run throws away the entire run and reverts to the previous book — there's no partial-recompute or single-name-retry path, so one transient failure forces a full, costly re-run of every name.",
      "The human book's own risk coverage is documented as genuinely incomplete for names outside the AI book's overlap — his displayed portfolio risk can understate his real exposure for names lacking full research coverage.",
      "Two different tools in this same product use two different, uncoordinated caps for how fast to execute a trade — a user comparing them for the same name could reasonably expect one consistent number.",
    ],
  },
  {
    id: "ep",
    group: "Portfolio",
    product: "EP (Earnings Preview)",
    oneLiner:
      "A standalone, CapIQ-grounded earnings-surprise preview locked to the human's book — a separate research pipeline that previews next-print beat probability, surprise size, and expected price move, and is hard-banned from ever touching the Portfolio Pipeline's weights.",
    sourceNotes:
      "Confirmed distinct from the standalone Earnings Tracker product — this lives inside phoenician-portfolio and bridges into the Portfolio Pipeline's Research tab only as a read-only diagnostic.",
    stages: [
      {
        name: "Data refresh",
        description:
          "A normal run reuses already-staged CapIQ data; a hard refresh re-scrapes CapIQ live first, so a scrape failure never wipes out the warm, already-good data.",
        triggeredBy: "\"Predict\" or \"Hard refresh + Predict\" on the Research → Earnings pane",
        ai: { provider: "none" },
      },
      {
        name: "Spine build & priced-in check",
        description:
          "Deterministic code builds a price history baseline per company and estimates how much of a likely move the market has already priced in — bookkeeping, not judgment.",
        triggeredBy: "Data refresh completing",
        ai: { provider: "none" },
      },
      {
        name: "Forecast stack",
        description:
          "Dates each company's next earnings event, runs a set of per-name forward-looking checks, and assembles a capped research packet — estimates, filings, insider activity, macro context, prior guidance.",
        triggeredBy: "Spine ready",
        ai: { provider: "ai", note: "Calendar dating and the per-name nowcast checks" },
      },
      {
        name: "Claude battery: insider read + judged forecast",
        description:
          "One Claude pass chunks and classifies recent insider trading activity; a second Claude pass reads the full research packet per name and publishes the probability of beating expectations, expected surprise size, and expected price move — entirely AI-owned judgment, with every deterministic statistic kept as a diagnostic only.",
        triggeredBy: "Research packets ready",
        ai: { provider: "claude", note: "Named \"Claude battery\" in the codebase itself — two distinct Claude passes" },
      },
      {
        name: "Freeze / score / lessons",
        description:
          "A forecast is frozen just before its event so it can't be revised in hindsight, scored once the event has passed, and the result folds into the same tool's next forecast — a real, working calibration loop, but one that stays entirely inside this pipeline.",
        triggeredBy: "Automatically, on a timer relative to each dated event",
        ai: { provider: "ai", note: "Scoring/lesson-drafting call" },
      },
      {
        name: "Publish",
        description:
          "Results appear on the Research → Earnings pane, locked to the human's book — names only in the AI book show up here as an unlocked diagnostic, never as something the AI book's own weight construction can see.",
        triggeredBy: "Successful run completion",
        ai: { provider: "none" },
      },
    ],
    enhancementIdeas: [
      "This pipeline's own freeze/score/lessons loop DOES feed back into its next forecast — a deliberate, working exception to the \"lessons never feed back\" rule that applies to the main Portfolio Pipeline.",
      "As the two books diverge further, AI-only names get earnings coverage only as an unlocked diagnostic — an AI-book holding could grow in size while carrying thin or no earnings-preview coverage.",
      "Calendar dating depends on external search keys; without them, names silently fall back to an undated state rather than surfacing a visible error — an easy-to-miss soft degrade.",
    ],
  },
  {
    id: "earnings",
    group: "Earnings",
    product: "Earnings Pipeline",
    oneLiner:
      "A scheduled scraper that discovers each portfolio company's own earnings dates, uses DeepSeek to turn messy pages into structured events and webcast links, finds and summarizes the actual results once released, and surfaces all of it on a live dashboard and via email.",
    sourceNotes: "No pre-existing architecture doc — the README's own diagram matched what the code actually does.",
    stages: [
      {
        name: "Weekly scrape kickoff",
        description:
          "A scheduled job takes a lock so two runs can never overlap, then loads the active company roster.",
        triggeredBy: "Every Monday morning on a schedule, or an on-demand \"Refresh events\" / \"Research <ticker>\" button",
        ai: { provider: "none" },
      },
      {
        name: "Per-company earnings-date discovery",
        description:
          "For each company: reuse a fresh cached result if one exists; otherwise verify the company's official investor-relations page (DeepSeek confirms the page really belongs to the ticker) and try to read its calendar directly first, only falling back to a DeepSeek extraction pass over web-search snippets if that finds nothing. Every extracted date carries a calibrated confidence score.",
        triggeredBy: "Immediately after the lock is acquired, for every active company",
        ai: { provider: "deepseek", note: "Runs on the OpenAI SDK pointed at DeepSeek's API — a stale code comment mentions Claude/Sonnet, but the real runtime client is DeepSeek" },
      },
      {
        name: "Persist & webcast enrichment",
        description:
          "New events are saved. Separately, any event happening soon gets a DeepSeek extraction pass to find and validate its webcast/livestream link.",
        triggeredBy: "Each company's discovery step returning",
        ai: { provider: "deepseek" },
      },
      {
        name: "Notification",
        description:
          "Genuinely new events trigger a summary email with calendar invites to the investment team, and are marked sent so they're never re-emailed.",
        triggeredBy: "End of the weekly run, once every company has been scraped",
        ai: { provider: "none" },
      },
      {
        name: "Post-earnings summary generation",
        description:
          "For events with no summary yet, finds the actual published results (IR page, filings, PDFs) and runs a DeepSeek extraction pass that produces a narrative summary plus structured metrics and sentiment.",
        triggeredBy: "A separate hourly schedule, checked at set intervals after each event",
        ai: { provider: "deepseek" },
      },
      {
        name: "Dashboard surfacing",
        description:
          "The events list (filterable by ticker/date/search) and the summaries pages render on page load, with an on-demand webcast-refresh action and in-page \"Generate\" polling for summaries still being written.",
        triggeredBy: "Any page load or filter change",
        ai: { provider: "none" },
      },
    ],
    enhancementIdeas: [
      "The \"Earnings Calendar\" page is actually a filterable table, not a calendar grid — there's no month-view component anywhere despite the product name and hero copy.",
      "Every event carries a calibrated confidence score (high for an official IR-page date, low for a third-party estimate) but the dashboard never renders it — a viewer can't tell a confirmed date from a speculative one at a glance, even though the data is already there.",
      "Discovery only runs weekly by default — a company that announces a new date mid-week has no automatic re-check until the following week unless someone manually refreshes.",
      "Test coverage is thin on the highest-risk logic — the AI response parsing, the discovery fallback logic, and the webcast validation heuristics have no automated tests.",
      "Stale code comments/docstrings still describe the extraction model as \"Sonnet\" even though the runtime client has been DeepSeek for a while — confusing for anyone reading the code as documentation.",
    ],
  },
];

/** @param {string} id */
export function pipelineById(id) {
  return pipelines.find((p) => p.id === id) ?? null;
}
