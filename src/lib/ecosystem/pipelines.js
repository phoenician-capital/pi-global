/**
 * Product pipelines — the real functional workflow behind each product,
 * derived by reading the actual codebases (not the architecture docs, which
 * in several cases were found to be stale). Stages describe what actually
 * happens and what triggers it, not raw "endpoint X calls endpoint Y" wiring.
 *
 * `ai.provider` is one of: "claude" | "openai" | "gemini" | "deepseek" |
 * "perplexity" | "mixed" (more than one provider in this one stage) |
 * "none" (deterministic code, no AI call at all). Every stage below has a
 * confirmed attribution, cited to exact files/lines/env vars/config keys —
 * none are guessed.
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
      "Every AI attribution below is confirmed against the live code (file/line/env var), not assumed from docs — the architecture docs turned out to describe a 14-section report with the wrong production order; the real code has 12 sections in a dependency-driven order.",
    stages: [
      {
        name: "Request intake & freshness check",
        description:
          "A user submits a ticker via the frontend form; the .NET backend creates a TickerRequest row and POSTs to the Python service. Python checks whether raw data for that ticker already exists and is fresher than 90 days, and separately whether each individual source (AlphaSense, CapIQ Excel files, PDFs) is present — this decides whether to skip, selectively refresh, or fully re-collect data.",
        triggeredBy: "User submits the ticker request form",
        ai: { provider: "none", note: "Pure filesystem mtime/path freshness checks" },
      },
      {
        name: "Parallel data collection",
        description:
          "Up to four data sources run concurrently: AlphaSense analyst PDFs, CapIQ financials/multiples/board/compensation/competitor segments, an investor-relations/SEC/transcript PDF crawler, and company review scraping. Only sources actually missing or stale are run, followed by a fully deterministic Excel-cleaning pass (rule-based table-boundary detection, no AI).",
        triggeredBy: "Freshness check finds data missing, stale, or force-refreshed",
        ai: { provider: "none", note: "Scraping + Excel cleaning are both deterministic. (PDF categorization and review-sentiment tagging elsewhere in this phase do use Claude Haiku, but aren't part of this stage.)" },
      },
      {
        name: "Isolated workflow launch",
        description:
          "The report-writing workflow runs as its own separate process (own memory, own AI connections) so concurrent reports for different tickers can never contaminate each other.",
        triggeredBy: "Data collection completing (or being skipped because data was already fresh)",
        ai: { provider: "none", note: "OS-level subprocess launch only" },
      },
      {
        name: "Context assembly",
        description:
          "All the cleaned financial data, board/executive info, and ownership data gets loaded into memory; live price and 5-year price history are pulled; GPT-4o writes a short plain-English company description that gets reused across every later section.",
        triggeredBy: "Workflow starting",
        ai: { provider: "openai", model: "gpt-4o", note: "Hardcoded, not provider-switchable — the rest of context assembly (budgeting, stitching, trimming) is deterministic Python" },
      },
      {
        name: "Institutional memory lens",
        description:
          "Claude pulls prior institutional context/memory for the company or sector and turns it into guiding questions injected into every section's writing prompt. Fails silently if memory is thin — the rest of the run proceeds unaffected.",
        triggeredBy: "Context assembly finishing",
        ai: { provider: "claude", model: "claude-sonnet-4-6", note: "The raw-memory retrieval feeding it is a deterministic keyword lookup, no embedding call" },
      },
      {
        name: "Document search setup",
        description:
          "All scraped company documents are indexed for AI search via Gemini's File API, and the analyst research PDFs are indexed separately — so \"our own documents\" and \"external analyst research\" stay queryable as two independent evidence pools.",
        triggeredBy: "Memory lens step completing",
        ai: { provider: "gemini", model: "gemini-2.5-flash-lite", note: "File indexing/upload, not text generation" },
      },
      {
        name: "Research query generation",
        description:
          "For each section, Claude Sonnet generates targeted search queries, which are scored for quality and regenerated if they fall short. Research for several sections can be fetched ahead of time in parallel to save time.",
        triggeredBy: "Each section's turn to be written (or pre-fetched ahead of time)",
        ai: { provider: "claude", model: "claude-sonnet-4-6" },
      },
      {
        name: "Evidence retrieval",
        description:
          "Approved queries are run against the indexed documents via Gemini file search; the results are tagged with their source and page, deduplicated, and assembled into an evidence packet for that section.",
        triggeredBy: "Queries approved",
        ai: { provider: "gemini", model: "gemini-2.5-flash-lite", note: "Context building (dedup/budget trimming) around it is deterministic" },
      },
      {
        name: "Section-by-section writing",
        description:
          "Real production order: Company Overview → Team & Culture → Competitors → TAM → Market Positioning → Performance & Estimates → Valuation → Financial Health → Technical Indicators → Red Flags → Conclusion → Research Challenge. Each section is skipped if already cached; otherwise it's written by Claude from the company info, financials, evidence, and prior sections, and cached to disk.",
        triggeredBy: "Each section's prerequisites (the sections it depends on) being complete",
        ai: { provider: "claude", model: "claude-sonnet-4-6", note: "Cross-provider fallback to gemini-2.5-pro if Anthropic retries are exhausted" },
      },
      {
        name: "Red Flags analysis",
        description:
          "A dedicated adversarial pass runs 17 fixed risk questions, researching each in parallel across Perplexity, Gemini, and OpenAI before Claude synthesizes the final verdict. It has no dependencies, so it starts early and runs in the background while other sections are still being written.",
        triggeredBy: "The report run starting (runs independently, no waiting)",
        ai: {
          provider: "mixed",
          model: "Perplexity (sonar-pro / sonar-deep-research) + Gemini (gemini-2.5-pro) + OpenAI (gpt-4o) research in parallel, synthesized by Claude (claude-sonnet-4-6)",
          note: "A genuine 4-provider fan-out — the only stage in the whole system that does this",
        },
      },
      {
        name: "Valuation (embeds the DCF)",
        description:
          "Runs the full DCF Pipeline (see below) to build an Excel valuation model, then Claude writes the section's narrative using the DCF's exact numbers so the writing can't drift from the model, followed by a comparables-valuation pass against the competitor list.",
        triggeredBy: "The sections it depends on completing",
        ai: { provider: "mixed", note: "Embeds the entire DCF Pipeline (mostly GPT-5.5, see below); the narrative on top is claude-sonnet-4-6" },
      },
      {
        name: "Conclusion",
        description:
          "Claude synthesizes the whole report — pulling in the DCF valuation numbers and the Red Flags findings — into the final investment rating and confidence level. Written second-to-last on purpose, so it can react to everything that came before it, including Red Flags.",
        triggeredBy: "All prior sections completing",
        ai: { provider: "claude", model: "claude-sonnet-4-6" },
      },
      {
        name: "Research Challenge",
        description:
          "A dedicated contrarian pass maps the final rating to a bull/bear stance (deterministic), then Claude builds the counter-thesis and drafts management cross-examination questions. Genuinely written last.",
        triggeredBy: "The Conclusion's rating being available",
        ai: { provider: "claude", model: "claude-sonnet-4-6", note: "Stance mapping is deterministic code; the thesis and questions are generated" },
      },
      {
        name: "Assembly & completeness check",
        description:
          "All 12 sections are assembled in canonical order; a completeness check flags the report as partial if anything is missing; the rating, valuation ratio, and confidence are extracted and sent back to the main system.",
        triggeredBy: "All 12 sections present",
        ai: { provider: "none" },
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
          "Once the report is marked complete, the frontend renders it (a deterministic read, no generation). Opening the chat routes each message through a Claude intent classifier into general Q&A, Gemini-powered PDF search, Excel search, or a section-rewrite suggestion — which produces a diff the user has to explicitly accept, never an unreviewed auto-edit.",
        triggeredBy: "User opens the report / opens the chat panel",
        ai: {
          provider: "mixed",
          model: "Intent classifier: claude-opus-4-6 · Q&A + suggestions: claude-sonnet-4-6 (fallback gemini-2.5-pro) · PDF search: gemini-2.5-flash-lite",
          note: "Display itself is a deterministic read; every downstream chat action has its own model",
        },
      },
    ],
    enhancementIdeas: [
      "Wire Red Flags' 4-provider research (Perplexity + Gemini + OpenAI, synthesized by Claude) directly into the Portfolio Pipeline's Independent Risk Read — today Portfolio's red-team pass starts from scratch on its own Claude call instead of building on the DD engine's already-deeper adversarial research for the same company.",
      "Add a \"since last run\" delta view on re-generated reports: surface what changed in the rating, red flags, and DCF output versus the prior version, and why — so an analyst opening an updated report sees the story arc instead of re-reading a full report to spot the diff.",
      "Add partial \"Update Report\": today any refresh purges and fully regenerates every section from scratch. A change to just one upstream data source (e.g. new investor-relations filing) should only re-trigger the sections whose dependency graph actually touches that source.",
      "Surface when the Institutional Memory Lens actually influenced a run (e.g. a small badge: \"Used house view on [sector]\") instead of silently succeeding or silently skipping — turns a currently invisible signal into something an investor can trust or question.",
      "Feed Portfolio's Lessons (validated corrections on how the team actually judges companies) back into the DD Pipeline's section-writing prompts, so report tone/judgment improves from real portfolio-team feedback, not just DD's own internal chatbot edits.",
    ],
  },
  {
    id: "dcf",
    group: "Diligence",
    product: "DCF Pipeline",
    oneLiner:
      "Given a company's research and cleaned financials, autonomously writes, reviews, runs, and sanity-checks a from-scratch valuation model into a full Excel workbook, then narrates it into assumptions documentation.",
    sourceNotes:
      "Fully provider-switchable (OpenAI / Claude / Grok / DeepSeek via one config setting) — current default across every AI step is OpenAI's GPT-5.5. One step (the balance-sheet gate) is deliberately pinned to Claude Opus 4.8 specifically if the Claude provider is selected, since Anthropic's newer flagship model's always-on reasoning would burn its token budget before finishing a 130K+ character script echo.",
    stages: [
      {
        name: "Unit-economics discovery",
        description:
          "Figures out what actually drives the company's revenue — subscribers, units sold, same-store sales, etc. — and how detailed the model needs to be, based on the company description and research.",
        triggeredBy: "Valuation section starting, once research and financials are ready",
        ai: { provider: "openai", model: "gpt-5.5", note: "Provider-switchable; openai is the configured default" },
      },
      {
        name: "Assumption extraction",
        description:
          "Pulls valuation drivers straight from the company's filings and research, and separately from what the report's own earlier sections already implied about the business (skipped for a standalone DCF run with no prior sections).",
        triggeredBy: "Discovery step producing its spec",
        ai: { provider: "openai", model: "gpt-5.5" },
      },
      {
        name: "Constraints & guidance mapping",
        description:
          "Classifies each assumption as binding (must honor management's stated guidance), strong, or reference-only, so the model-building step knows which figures it's not allowed to override.",
        triggeredBy: "Both extraction passes completing",
        ai: { provider: "openai", model: "gpt-5.5" },
      },
      {
        name: "Model generation",
        description:
          "Writes a complete valuation model from scratch as real spreadsheet-building code — genuine generation of the model logic, not a template being filled in.",
        triggeredBy: "Constraints map being ready",
        ai: { provider: "openai", model: "gpt-5.5 (xhigh reasoning effort)" },
      },
      {
        name: "Financial sanity review",
        description:
          "Checks the financial logic of the generated model (not just whether it runs) before it's ever executed, with one corrective pass if problems are found.",
        triggeredBy: "Model code being generated, before execution",
        ai: { provider: "openai", model: "gpt-5.5" },
      },
      {
        name: "Code review & correction",
        description:
          "A structured review of the generated code, with a fix pass applied only if issues are found. A failure here sends the whole thing back to model generation for one retry.",
        triggeredBy: "Sanity review resolving",
        ai: { provider: "openai", model: "gpt-5.5" },
      },
      {
        name: "Balance-sheet balance check",
        description:
          "A dedicated, deliberately expensive check that re-reads the whole model purely to catch balance-sheet imbalance bugs before it's ever run.",
        triggeredBy: "Code review passing",
        ai: { provider: "openai", model: "gpt-5.5 (default) — pinned to claude-opus-4-8 specifically if the Claude provider is selected", note: "The Opus pin exists because Claude's newer flagship can't have its adaptive reasoning disabled" },
      },
      {
        name: "Compilation check",
        description:
          "A pure syntax check with no AI judgment involved — the docstring says so explicitly. If it fails, an automatic fix pass runs once; if it still fails, the whole thing goes back to model generation.",
        triggeredBy: "Balance check passing",
        ai: { provider: "none", note: "The fix pass on failure uses the same model as Code review & correction" },
      },
      {
        name: "Execution",
        description:
          "Runs the generated model as a sandboxed subprocess to actually produce the Excel file. On runtime failure, an automatic patch-and-retry pass runs, saving every failed attempt for debugging.",
        triggeredBy: "Successful compilation",
        ai: { provider: "none", note: "The runtime-fix pass on failure is an AI call (same CODE_FIX role as code review)" },
      },
      {
        name: "Post-processing & value caching",
        description:
          "Fixes column widths, then opens the workbook headlessly in LibreOffice to cache the computed formula results — this has to be the very last step before anything reads the numbers out.",
        triggeredBy: "Successful execution",
        ai: { provider: "none" },
      },
      {
        name: "Post-execution balance repair",
        description:
          "Re-checks the balance sheet now that real computed numbers exist (a separate, later check than the pre-execution one, reusing the same check), looping back through the gate-and-rerun cycle if it's still broken.",
        triggeredBy: "Cached values being available",
        ai: { provider: "openai", model: "gpt-5.5 (default) — pinned to claude-opus-4-8 if the Claude provider is selected", note: "Same pinned check as Balance-sheet balance check, re-run post-execution" },
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
        ai: { provider: "openai", model: "gpt-5.5" },
      },
      {
        name: "Documentation",
        description:
          "Writes up the valuation assumptions and final numbers into a readable narrative that the DD report's Valuation section quotes directly, so the written report can't state different figures than the model.",
        triggeredBy: "Plausibility gate resolving (or being skipped)",
        ai: { provider: "openai", model: "gpt-5.5" },
      },
    ],
    enhancementIdeas: [
      "Add a lighter-weight \"patch mode\" for re-runs: when only one input changes (e.g. a guidance update), regenerate just the affected tab instead of rebuilding the entire 7-tab model from scratch — every retry today, even after a trivial fix, rebuilds everything.",
      "Add a visible \"gate intervened\" badge on any DCF output the Plausibility Gate had to patch, versus one that passed through untouched — the number an analyst reads can currently be an artifact of a correction with no way to tell from the report alone.",
      "Build a per-step cost dashboard using the provider-switchable routing that already exists (OpenAI/Claude/Grok/DeepSeek) — since spend isn't uniform across steps or providers, this would let the team actually see where DCF cost concentrates and make an informed call on which steps are worth the pricier model.",
      "Wire the DCF's own extracted metrics (intrinsic value, P/V ratio) directly into the Portfolio Pipeline's per-company valuation stage as a starting anchor, instead of Portfolio's Claude valuation pass re-deriving intrinsic value independently from the same DCF model.",
    ],
  },
  {
    id: "screening",
    group: "Screening",
    product: "Screening Pipeline",
    oneLiner:
      "Every chat about a company gets mined into durable observations, which get consolidated nightly into per-company memos and archetype playbooks, which then calibrate the Agent Skills that actually vote Pass/Watch on the universe — so the screener keeps re-learning the PM's own judgment instead of running a fixed rulebook.",
    sourceNotes:
      "Every AI attribution below is confirmed against the live code and .env, including the effective model after environment-variable overrides (e.g. a legacy CLAUDE_MODEL override currently routes several calls to claude-opus-4-7 instead of their coded fallback default).",
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
        ai: { provider: "claude", model: "claude-opus-4-7 (effective, via env override)", note: "Coded fallback default is claude-sonnet-5 if the override is ever removed" },
      },
      {
        name: "Insight extraction into Observations",
        description:
          "A high-effort Claude call mines the chat transcript for durable signal — reasoning, hesitations, sentiment, exact phrasing — and merges it (never overwrites) into the PM's growing profile. If the chat's verdict differs from the screener's own prior call, the PM's call wins and is frozen against future re-screens.",
        triggeredBy: "PM finishes the chat",
        ai: { provider: "claude", model: "claude-opus-4-7 (effective, via env override)", note: "Coded fallback default is claude-sonnet-4-6" },
      },
      {
        name: "Nightly consolidation",
        description:
          "Each night, Anthropic's managed Dreams pipeline reads the day's chats plus the accumulated observation store and consolidates: per-company memos are tightened, stale stances retired, and cross-company patterns surfaced into candidate principles for the PM to accept or reject.",
        triggeredBy: "Nightly schedule (also runnable manually from the dashboard)",
        ai: { provider: "claude", model: "claude-sonnet-4-6", note: "This step reads its own dedicated env var, so it's unaffected by the chat/insight override above" },
      },
      {
        name: "Playbooks",
        description:
          "The archetypes the PM actually thinks in (e.g. \"Founder-Led Compounders\") are discovered by reading the full observation history — no hardcoded list — and one dense rulebook is built per archetype. Each company gets tagged with 1-3 archetypes (a cheaper classification call) and the matching playbook is injected at screening time.",
        triggeredBy: "Automatically chained right after nightly consolidation",
        ai: { provider: "claude", model: "claude-sonnet-4-6 (discovery & synthesis) · claude-haiku-4-5 (per-company classification)" },
      },
      {
        name: "Skills Update",
        description:
          "One combined Claude call diffs fresh playbooks and standing corrections against each Agent Skill's current calibration and writes short calibration notes, routing each note to its target skill in the same generative pass — there's no separate routing step.",
        triggeredBy: "Manual only — the dashboard's \"Run Full Refresh\" or \"Skills Update\" button, not on the nightly schedule",
        ai: { provider: "claude", model: "claude-opus-4-7 (effective, via env override)", note: "Coded fallback default is claude-sonnet-4-6" },
      },
      {
        name: "Agent Skills",
        description:
          "Six defined roles do the actual work on every call: a code-owned Gatekeeper (financial gates, never touched by the learning loop, no AI), a Research role (facts only), the Triage role (the actual Pass/Watch decision), a Critique role (blind second opinion), a Correction-Learner, and the chat persona itself.",
        triggeredBy: "Every screening batch and every chat turn",
        ai: {
          provider: "mixed",
          model: "Gatekeeper: code only · Triage/Critique/Research: claude-sonnet-5 · Correction-Learner/Sparring-Partner: claude-opus-4-7 (effective override)",
        },
      },
      {
        name: "Screening decision (Pass/Watch)",
        description:
          "For each queued company: pull live quote and ownership data → classify archetype (cheap Haiku call) → get a research brief → compute the deterministic financial gates → run Triage, which must output exactly Pass or Watch with reasoning and confidence → commit the verdict and log the history.",
        triggeredBy: "PM clicks \"Screen next N\" (auto-prioritized) or force-reprocesses a name",
        ai: { provider: "mixed", model: "Archetype classification: claude-haiku-4-5 · Financial gates: code only · Triage verdict: claude-sonnet-5" },
      },
      {
        name: "Shadow critique",
        description:
          "For companies the PM has personally decided in chat, a separate blind pass re-votes the same name using the same gates and playbooks — without seeing the PM's actual call — then reveals it and reconciles the two. A real disagreement becomes a correction that feeds back into Skills Update and Playbooks.",
        triggeredBy: "A separate \"shadow re-screen\" run over the PM's own decided names",
        ai: { provider: "claude", model: "claude-sonnet-5" },
      },
      {
        name: "Next Evolution",
        description:
          "A distinct forward-looking pass over already-Passed names — industry trajectory, reinvestment, optionality — anchored on the PM's own revealed taste rather than the stated framework.",
        triggeredBy: "Runs automatically for the backlog, or explicitly via \"Study selected\"",
        ai: { provider: "claude", model: "claude-sonnet-5" },
      },
    ],
    enhancementIdeas: [
      "Chain Skills Update onto the same nightly cron that already runs Dreams → Playbooks, instead of leaving it manual-only — this is the one link in the self-improving loop that doesn't run itself today, so the agent's actual behavior (not just its playbooks) can go stale between dashboard visits.",
      "Extend the existing proposed-principles review tray (already used for Dreams) to Skills Update's calibration notes too, so a human approves what actually reshapes agent behavior instead of it auto-appending — this reuses a pattern the product already ships, applied to the one place it's currently missing.",
      "Add a \"framework moved — worth a re-look\" nudge on frozen chat verdicts that predate a significant playbook change, since those names never get re-tested against the tightened framework unless the PM manually reopens a chat.",
      "Surface the Shadow Critique's agree/disagree rate as a visible trend on the dashboard — a running calibration score the PM can watch improve (or not) over time, instead of disagreements only living as one-off corrections.",
      "Wire Screening's confirmed Pass calls directly into the Portfolio Pipeline's Membership Screening stage as a pre-filtered candidate pool, so Portfolio's own include/exclude pass starts from names the PM has already vetted rather than re-evaluating the full research corpus independently.",
    ],
  },
  {
    id: "portfolio",
    group: "Portfolio",
    product: "Portfolio Pipeline",
    oneLiner:
      "Turns Phoenician Intelligence's live due-diligence, risk, and DCF research into two independently-tracked model portfolios — an AI-run book whose membership, valuations, risk read, sizing, and final sign-off are all done by a chain of Claude calls, and a human hand-set benchmark book that gets the same research context but is never algorithmically re-sized.",
    sourceNotes:
      "Every stage below runs on Claude, but not the same tier — the pipeline deliberately spends more on the calls that matter most (the sign-off review runs on Claude Fable 5 at maximum effort; most per-company work runs on Sonnet 5).",
    stages: [
      {
        name: "Research intake",
        description:
          "Fetches every covered company's due-diligence dossier, risk audit, and DCF model fresh from Phoenician Intelligence into a throwaway cache for this run only — nothing is kept long-term, so every run reads the current state of the research, never a stale copy.",
        triggeredBy: "A human clicks Run/Rerun AI (there's no automatic weekly schedule, even though the machinery for one exists)",
        ai: { provider: "none", note: "A plain HTTP fetch from Phoenician Intelligence" },
      },
      {
        name: "Membership screening",
        description:
          "A Claude pass reads each candidate's research in small batches and makes an include/exclude call with a thesis and a moat view. A second, higher-tier whole-book pass then consolidates the survivors into a final roster — there's no fixed name count. Applies only to the AI book; the human's book is picked by hand.",
        triggeredBy: "Research intake completing",
        ai: { provider: "claude", model: "claude-sonnet-5 (batch pass) · claude-opus-5 (whole-book consolidation)" },
      },
      {
        name: "Per-company valuation",
        description:
          "An independent Claude pass per company re-derives its own intrinsic value from the DCF and research (correcting assumptions it judges stale), producing a price-to-value read and an expected return. A pure value judgment — it never looks at risk or trading history.",
        triggeredBy: "Membership screening choosing the roster (or a save in the human's Weight Lab)",
        ai: { provider: "claude", model: "claude-sonnet-5" },
      },
      {
        name: "Independent risk read",
        description:
          "A separate, adversarial Claude pass attacks the valuation's assumptions using the risk audit and full price history, producing the strongest bear case and a volatility estimate. This is the only place past price behavior is allowed to matter — and only as a risk signal, never a return signal.",
        triggeredBy: "Each name's valuation completing",
        ai: { provider: "claude", model: "claude-sonnet-5" },
      },
      {
        name: "Weight construction",
        description:
          "The book is drafted several times in parallel by Claude, each draft sizing every name to maximize risk-adjusted return with a soft return target, tilting toward cheap durable names and staying diversified. The best draft is kept and refined further, only accepting a change if it genuinely scores better.",
        triggeredBy: "Every chosen name having both a valuation and a risk read",
        ai: { provider: "claude", model: "claude-opus-5" },
      },
      {
        name: "Sign-off review",
        description:
          "One final, maximum-effort Claude pass writes the case for the whole book — justifying every weight, explaining the ranking, and stating plainly there's no backtest behind the numbers. Required: if it fails, the entire run is discarded and the previous book keeps serving, flagged stale.",
        triggeredBy: "Weight construction settling",
        ai: { provider: "claude", model: "claude-fable-5 (max effort)", note: "The single most expensive call in the pipeline — runs once and carries the whole book's sign-off; falls back to claude-opus-5 on repeated failure" },
      },
      {
        name: "Forward risk-factor model",
        description:
          "A last pass decomposes each holding's forward risk into a few shared factors purely to power the frontend's what-if weight simulator. Never changes a weight — if it fails, the book still ships and the simulator is just marked unavailable.",
        triggeredBy: "Sign-off completing",
        ai: { provider: "claude", model: "claude-opus-5", note: "Not deterministic — a genuine LLM call whose failure is deliberately soft (non-critical)" },
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
        ai: { provider: "none", note: "The rebalance math itself is pure arithmetic; the separate Technical Trader tool that can override pacing does use Claude" },
      },
      {
        name: "Human hand-set book",
        description:
          "A fully independent second book: the human picks membership and weights by hand, gets the same Claude valuation/risk passes run over his own names for informational purposes only, and every save anchors and executes on its own. No AI review ever resizes his numbers.",
        triggeredBy: "The human edits and saves the Weight Lab",
        ai: { provider: "claude", model: "claude-sonnet-5 (valuation/risk) · claude-opus-5 (optional risk-factor pass)", note: "Same calls as the AI book, informational only — never resizes anything" },
      },
      {
        name: "Advisory overlays",
        description:
          "Insider filings (deterministic classification), a portfolio risk-chip re-scored on every Weight Lab save, a trade-pacing tool, and a Q&A debate surface all read the same research and publish to the Research tab — every one of them is hard-banned in code from ever writing into a book's weights.",
        triggeredBy: "Each runs on its own separate trigger",
        ai: { provider: "mixed", model: "Insiders: code only · Risk chip / Trade pacing / Ask-why debate: claude-sonnet-5" },
      },
      {
        name: "Lessons",
        description:
          "A separate set of Claude passes compares the AI book's past forecasts to what actually happened, drafting written lessons that graduate from proposed to validated (or get retired). Deliberately never injected back into the reasoning stages — grading the AI's judgment and improving it are kept as two separate, human-mediated steps.",
        triggeredBy: "A human viewing or refreshing the Lessons page — always after the fact",
        ai: { provider: "claude", model: "claude-sonnet-5", note: "5 chained calls per refresh: selection → valuation → construction → critique → consolidate" },
      },
    ],
    enhancementIdeas: [
      "Turn on the weekly auto-recompute scheduler that already exists in code but sits switched off — the AI book only reweighs today when someone manually clicks Run, so it can go stale indefinitely with no cadence guarantee even though the machinery to run one is already built.",
      "Turn validated Lessons into an actual proposed-change draft (a prompt tweak, a threshold adjustment) for a human to approve, instead of leaving it as a paragraph someone has to manually translate into a config edit — same accept/reject pattern already used elsewhere in this codebase, applied one step further.",
      "Add single-name retry: today one failed company valuation throws away the entire multi-name run and reverts the whole book to stale. A name-level retry would make transient failures cheap instead of forcing a full, costly re-run of everyone.",
      "Surface Insiders and Technical Trader pacing signals as inline badges directly on the Trades tab (e.g. \"Insider buying detected\" next to a BUY) instead of leaving them only on a separate Research tab a user has to remember to check.",
      "Unify the trade-pacing cap between the book's own execution engine (fixed 20% of ADV/day) and the standalone Technical Trader tool (15% default) into one shared setting, so the same kind of pacing decision doesn't quietly give two different answers depending on which surface a user is looking at.",
      "Wire the DD Pipeline's Red Flags synthesis (already a 4-provider adversarial pass) into the Independent Risk Read as a starting brief, so Portfolio's own red-team call builds on DD's deeper research instead of starting from zero on the same company.",
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
          "DeepSeek dates each company's next earnings event (crawling IR pages and search results), then 17 fully deterministic per-name \"nowcast\" playbooks compute factor signals, and everything gets assembled into a capped research dossier.",
        triggeredBy: "Spine ready",
        ai: { provider: "mixed", model: "Calendar dating: deepseek-chat · 17 nowcast playbooks: code only" },
      },
      {
        name: "Claude battery: insider read + judged forecast",
        description:
          "One Claude Opus pass chunks and classifies recent insider trading activity; a second Claude pass — deliberately forced to Sonnet, with Opus explicitly rejected for this role — reads the full research packet per name and publishes the probability of beating expectations, expected surprise size, and expected price move.",
        triggeredBy: "Research packets ready",
        ai: { provider: "claude", model: "claude-opus-5 (insider read) · claude-sonnet-5 (judged forecast)", note: "Named \"Claude battery\" in the codebase itself; the judge role explicitly rejects an Opus override to keep behavior consistent" },
      },
      {
        name: "Freeze / score / lessons",
        description:
          "A forecast is frozen just before its event so it can't be revised in hindsight, then scored once the event has passed. The resulting lesson text is deterministic bookkeeping that feeds into the next judged-forecast call as context — the loop itself makes no AI call.",
        triggeredBy: "Automatically, on a timer relative to each dated event",
        ai: { provider: "none", note: "Feeds forward into the next Claude judge call, but doesn't itself invoke a model" },
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
      "Extend EP's coverage to AI-book-only names — it's locked to the human's book today, so as the two books' memberships diverge, AI-book holdings can grow with zero earnings-preview coverage.",
      "Roll EP's per-name calibration lessons up into a sector-level signal (e.g. \"the judge tends to overestimate beat probability for SaaS names\") instead of keeping every lesson scoped to one ticker in isolation — the same kind of generalization Screening's Playbooks already do with observations.",
      "Replace the silent \"undated\" fallback (when calendar-dating keys are missing) with a visible alert on the Earnings pane, so a coverage gap doesn't read as \"nothing due soon\" when it's actually \"couldn't check.\"",
      "Wire EP's judged forecasts directly onto the standalone Earnings Tracker product's calendar entries for the same tickers, so a covered name shows both \"when it reports\" (Earnings Tracker) and \"what we expect\" (EP) in one place instead of two separate products.",
    ],
  },
  {
    id: "earnings",
    group: "Earnings",
    product: "Earnings Pipeline",
    oneLiner:
      "A scheduled scraper that discovers each portfolio company's own earnings dates, uses DeepSeek to turn messy pages into structured events and webcast links, finds and summarizes the actual results once released, and surfaces all of it on a live dashboard and via email.",
    sourceNotes: "Every AI step in this pipeline runs on DeepSeek via the OpenAI SDK pointed at DeepSeek's API — a stale code comment elsewhere in the file still claims Sonnet, but no Claude/Anthropic call exists anywhere in this codebase.",
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
          "For each company: reuse a fresh cached result if one exists; otherwise DeepSeek verifies the company's official investor-relations page and tries to read its calendar directly first, only falling back to a DeepSeek extraction pass over web-search snippets if that finds nothing. Every extracted date carries a calibrated confidence score.",
        triggeredBy: "Immediately after the lock is acquired, for every active company",
        ai: { provider: "deepseek", model: "deepseek-chat (IR-page verification) · deepseek-v4-pro (search-snippet extraction)" },
      },
      {
        name: "Persist & webcast enrichment",
        description:
          "New events are saved. Separately, any event happening soon gets a DeepSeek extraction pass to find and validate its webcast/livestream link.",
        triggeredBy: "Each company's discovery step returning",
        ai: { provider: "deepseek", model: "deepseek-v4-pro" },
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
        ai: { provider: "deepseek", model: "deepseek-chat" },
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
      "Build the actual month-grid calendar the product's own name and hero copy promise — today the \"Earnings Calendar\" page is a filterable table, with no calendar-grid component anywhere in the codebase.",
      "Surface the confidence score that's already computed per event (high for a confirmed IR-page date, low for a third-party estimate) directly in the dashboard — the data exists, it's just never rendered, so a viewer can't currently tell a solid date from a speculative one.",
      "Add an event-driven mid-week re-check (e.g. triggered by a filing/news webhook) instead of waiting for the next Monday scrape when a company announces a new date outside the weekly cycle.",
      "Push a completed summary directly onto the relevant company's Research tab inside the Portfolio Pipeline the moment it's generated, instead of leaving it to live only in this standalone product until someone thinks to check.",
    ],
  },
];

/** @param {string} id */
export function pipelineById(id) {
  return pipelines.find((p) => p.id === id) ?? null;
}
