/**
 * Extreme-depth call architecture + prompt engineering dossiers.
 * Sourced from `.cursor/projects/<name>/call-architecture.md` + `ai-prompting.md`
 * (+ systems/call-taxonomy.md, ai-prompting-map.md). Never invent edges.
 */

/** @typedef {{ kind: string, count?: number|string, role: string }} KindSkew */
/** @typedef {{ caller: string, callee: string, kind: string, purpose: string, sync?: string, auth?: string }} CallEdge */
/** @typedef {{ role: string, model: string, env?: string }} ModelRole */
/** @typedef {{ location: string, instruction: string }} PromptFragment */
/**
 * @typedef {Object} Dossier
 * @property {string} nodeId
 * @property {string} project
 * @property {string} kbPath
 * @property {string} summary
 * @property {KindSkew[]} kindSkew
 * @property {CallEdge[]} calls
 * @property {string[]} [notes]
 * @property {string[]} [nonEdges]
 * @property {{ hasLlm: boolean, summary: string, models?: ModelRole[], corpus?: string, pipeline?: string[], fragments?: PromptFragment[], services?: { name: string, job: string }[], langfuse?: string }} prompting
 */

/** Shared taxonomy labels — systems/call-taxonomy.md */
export const callTaxonomy = [
  { kind: "reasoning_llm", meaning: "Model generation (chat/completions, judge, qualitative)" },
  { kind: "embedding_rag", meaning: "Embeddings / vector / file-search retrieve (≠ free-form write)" },
  { kind: "data_fetch_market", meaning: "Market / vendor financial data (CapIQ, Yahoo, FMP…)" },
  { kind: "data_fetch_web", meaning: "Open web search/scrape (SerpAPI, SEC, IR…)" },
  { kind: "data_fetch_internal", meaning: "Read own platform stores (RDS, Dynamo, EFS, BFF)" },
  { kind: "data_write_internal", meaning: "Persist to own stores" },
  { kind: "auth_identity", meaning: "Login, tokens, OTP, vendor login bots" },
  { kind: "realtime_push", meaning: "Live channels (SignalR, SSE, Expo/FCM)" },
  { kind: "proxy_forward", meaning: "HTTP hop that mostly relays" },
  { kind: "job_orchestrate", meaning: "Submit / cancel / poll / schedule work" },
  { kind: "binary_media", meaning: "Files as product (PDF/xlsx/TTS/presign)" },
  { kind: "billing_vendor", meaning: "Vendor spend/usage sync" },
  { kind: "health_ops", meaning: "Health, diagnostics, version gates" },
  { kind: "other", meaning: "Needs subtype (email, esign, embed, graph…)" },
];

/** @type {Dossier[]} */
export const dossiers = [
  {
    nodeId: "pi-py",
    project: "phoenician-intelligence",
    kbPath: "projects/phoenician-intelligence/",
    summary:
      "Only tree with classic embedding_rag (Vertex / Gemini FS / AlphaSense). Dense multi-provider DD engine; .NET does not generate sections.",
    kindSkew: [
      { kind: "reasoning_llm", count: 9, role: "DD sections, H2H, RA, chatbot, cheap DeepSeek, Gemini/Grok/Pplx" },
      { kind: "data_fetch_web", count: 8, role: "SerpAPI, ScraperAPI, AlphaSense Playwright, CSE" },
      { kind: "data_fetch_internal", count: 6, role: "EFS, S3, memory SSH, .NET internal" },
      { kind: "data_fetch_market", count: 5, role: "CapIQ Playwright, yfinance, FMP" },
      { kind: "data_write_internal", count: 5, role: "EFS progress/reports, S3/GCS/Gemini upload" },
      { kind: "embedding_rag", count: 4, role: "Vertex, Gemini FS, AlphaSense RAG, prefetch" },
      { kind: "auth_identity", count: 3, role: "JWT middleware, CapIQ/AS login" },
      { kind: "job_orchestrate", count: 3, role: "callbacks, brain upsert, ECS task protection" },
      { kind: "binary_media", count: 3, role: "PDF/xlsx, LibreOffice, DCF IO" },
      { kind: "health_ops", count: 2, role: "/health, status" },
      { kind: "other", count: 3, role: "neo4j optional, n8n pairing, universe status sync" },
    ],
    calls: [
      { caller: "llm_clients/call_claude.py", callee: "Anthropic Messages", kind: "reasoning_llm", purpose: "DD / H2H / RA / write", sync: "sync+stream+batch", auth: "Anthropic key" },
      { caller: "api/_async_claude.py", callee: "AsyncAnthropic", kind: "reasoning_llm", purpose: "chatbot stream", sync: "async", auth: "Anthropic key" },
      { caller: "_async_batch.py", callee: "Anthropic Batches", kind: "reasoning_llm", purpose: "prefetch query gen", sync: "async poll", auth: "Anthropic key" },
      { caller: "call_openai.py", callee: "api.openai.com", kind: "reasoning_llm", purpose: "O-series, deep research, DCF", sync: "sync/stream", auth: "OPENAI_API_KEY" },
      { caller: "call_deepseek.py", callee: "api.deepseek.com", kind: "reasoning_llm", purpose: "cheap DD + web_search", sync: "sync", auth: "DEEPSEEK_*" },
      { caller: "call_gemini.py", callee: "google.genai", kind: "reasoning_llm", purpose: "Gemini write/JSON (+GoogleSearch)", sync: "sync", auth: "GEMINI_API_KEY" },
      { caller: "call_grok.py", callee: "xai_sdk", kind: "reasoning_llm", purpose: "Grok + x_search", sync: "sync", auth: "GROK/XAI key" },
      { caller: "call_perplexity.py", callee: "api.perplexity.ai", kind: "reasoning_llm", purpose: "sonar research", sync: "sync", auth: "PERPLEXITY_API_KEY" },
      { caller: "llm_client_manager.py", callee: "Claude→Gemini failover", kind: "reasoning_llm", purpose: "provider fallback", sync: "sync", auth: "multi-key" },
      { caller: "vertex_ai_search_retrieval.py", callee: "Discovery Engine + GCS", kind: "embedding_rag", purpose: "section RAG", sync: "sync", auth: "GCP WIF" },
      { caller: "gemini_file_retrieval.py", callee: "Gemini File Search", kind: "embedding_rag", purpose: "PDF corpus", sync: "sync", auth: "Gemini key" },
      { caller: "alphasense_file_retrieval.py", callee: "Gemini FS over AS PDFs", kind: "embedding_rag", purpose: "AS RAG s5/s11", sync: "sync", auth: "Gemini key" },
      { caller: "rag_prefetch.py", callee: "Vertex/Gemini/AS", kind: "embedding_rag", purpose: "phase prefetch", sync: "parallel", auth: "same" },
      { caller: "yfinance_client.py", callee: "Yahoo/yfinance", kind: "data_fetch_market", purpose: "price/FX/hist DCF", sync: "sync", auth: "none" },
      { caller: "fmp_client.py", callee: "financialmodelingprep.com", kind: "data_fetch_market", purpose: "quotes/profile", sync: "sync", auth: "FMP_KEY" },
      { caller: "capiq-excel-downloads + filings", callee: "Playwright capitaliq.com", kind: "data_fetch_market", purpose: "Excel/PDF → EFS", sync: "sync browser", auth: "CapIQ pool" },
      { caller: "web_search.py", callee: "LLM web tools", kind: "data_fetch_web", purpose: "section web context", sync: "sync", auth: "provider" },
      { caller: "rfw_serp.py / ir_email / Company_Review", callee: "serpapi.com", kind: "data_fetch_web", purpose: "SERP / IR / reviews", sync: "sync", auth: "SERPAPI_KEY" },
      { caller: "trustpilot scraper", callee: "api.scraperapi.com", kind: "data_fetch_web", purpose: "review scrape", sync: "sync", auth: "SCRAPERAPI_KEY" },
      { caller: "prefetch CSE", callee: "googleapis customsearch", kind: "data_fetch_web", purpose: "website discovery", sync: "sync", auth: "CSE key" },
      { caller: "AlphaSense Playwright", callee: "research.alpha-sense.com", kind: "data_fetch_web", purpose: "AS report download", sync: "sync browser", auth: "AS creds" },
      { caller: "loaders / admin EFS", callee: "EFS /app/*", kind: "data_fetch_internal", purpose: "filings/reports", sync: "sync FS", auth: "mount" },
      { caller: "s3_manager.py", callee: "S3", kind: "data_fetch_internal", purpose: "optional raw storage", sync: "sync", auth: "IAM" },
      { caller: "memory_db_client.py", callee: "EC2 SSH + SQLite", kind: "data_fetch_internal", purpose: "CIO memory", sync: "sync", auth: "SSM+SSH" },
      { caller: "brain/client.py fetch", callee: ".NET BACKEND_API_BASE", kind: "data_fetch_internal", purpose: "playbook index", sync: "sync", auth: "callback secret" },
      { caller: "workflow / progress", callee: "EFS write", kind: "data_write_internal", purpose: "reports/markers", sync: "sync FS", auth: "mount" },
      { caller: "Vertex/Gemini upload", callee: "GCS / Files API", kind: "data_write_internal", purpose: "index for RAG", sync: "sync", auth: "WIF/key" },
      { caller: "security_auth.py", callee: "JWT / X-Callback / X-Internal", kind: "auth_identity", purpose: "route protect", sync: "middleware", auth: "shared w/ .NET" },
      { caller: "CapIQ/AS bots", callee: "vendor login", kind: "auth_identity", purpose: "session cookies", sync: "browser", auth: "user/pass" },
      { caller: "send_callback_with_retry", callee: ".NET /internal/callbacks/report-completed", kind: "job_orchestrate", purpose: "job done webhook", sync: "async httpx", auth: "callback secret" },
      { caller: "brain/client upsert", callee: ".NET /internal/brain/playbooks", kind: "job_orchestrate", purpose: "mine→upsert", sync: "sync", auth: "callback secret" },
      { caller: "ecs_task_protection.py", callee: "ECS UpdateTaskProtection", kind: "job_orchestrate", purpose: "anti scale-in", sync: "sync", auth: "task IAM" },
      { caller: "LibreOffice / DCF routes", callee: "soffice / EFS xlsx", kind: "binary_media", purpose: "convert + DCF IO", sync: "sync/async", auth: "JWT" },
      { caller: "GET /health", callee: "self", kind: "health_ops", purpose: "Docker HEALTHCHECK", sync: "sync", auth: "public" },
      { caller: "neo4j_config (optional)", callee: "Neo4j", kind: "other:graph", purpose: "experimental", sync: "sync", auth: "neo4j auth" },
      { caller: "prefetch → .NET universe", callee: ".NET universe PATCH", kind: "other:status_sync", purpose: "prefetch status", sync: "sync", auth: "internal" },
    ],
    nonEdges: [
      "CapIQ REST sample (capIQapi.py) is not the production path — Playwright is",
      "Neo4j is optional / not on DD hot path",
      "Chatbot n8n webhook is owned by FE; Python hosts /chatbot/* actions",
    ],
    prompting: {
      hasLlm: true,
      summary: "~142 .jinja under templates/{sections,research,retrieval,…}; multi-provider cascade. Only classic embedding_rag tree.",
      models: [
        { role: "Claude DD / H2H / RA", model: "claude-sonnet-4-6, claude-opus-4-6/4-7/4-8, claude-fable-5, claude-mythos-5" },
        { role: "Gemini search default", model: "gemini-2.5-flash-lite", env: "GEMINI_*" },
        { role: "Gemini write", model: "gemini-2.5-pro/flash, gemini-3.1-*" },
        { role: "DeepSeek cheap", model: "deepseek-v4-flash only" },
        { role: "OpenAI cascade", model: "gpt-5.5→gpt-5.4→gpt-4.1→gpt-4o…" },
        { role: "Grok", model: "grok-4.20-*, grok-4, grok-3" },
        { role: "Perplexity", model: "sonar-deep-research, sonar-reasoning-pro, sonar-pro, sonar" },
        { role: "Query gen", model: "claude-sonnet-4-6", env: "AGENTIC_QUERY_MODEL" },
        { role: "§8 DCF writing", model: "claude | openai | grok (switch)", env: "DCF_LLM_PROVIDER" },
      ],
      corpus: "templates/{sections,research,retrieval,query_generation,evaluation,valuation,dcf,utils_prompts,base}, src/brain/prompts, engine prompts/, src/n8n_helpers/prompts, Company_Review",
      pipeline: [
        "Data collection (SKIP_* flags)",
        "Prefetch/RAG (USE_VERTEX_AI_SEARCH primary; fallback flag default false)",
        "Web research",
        "Sections [2,3,4,5,6,7,8,9,10,12,1,11]",
        "UE-DCF 8-step + P/V gate (0.3–3.0 unless skipped)",
        "Callback .NET",
        "Optional H2H / risk / brain",
      ],
      services: [
        { name: "agentic_query", job: "n8n helper" },
        { name: "apply_modification", job: "n8n helper" },
        { name: "load_report / modify_section / query_report", job: "n8n helpers" },
        { name: "notes_ai_query / search_excels / search_pdfs / suggest_modification", job: "n8n helpers" },
      ],
      fragments: [
        { location: "call_claude._SONNET_QUERY_SYSTEM", instruction: "precise company-specific retrieval queries" },
        { location: "call_deepseek writing/web/query", instruction: "senior equity research analyst / expert web / precise queries" },
        { location: "dcf_llm.DCF_WRITING_SYSTEM", instruction: "senior equity research analyst — no preamble; respect word counts; inline links only" },
        { location: "templates/sections/section_1.jinja", instruction: "GLOBAL WRITING RULE — first section IC reads; never heard of company" },
        { location: "section_8.jinja", instruction: "all financials MUST use {{ currency }}; DO NOT convert to USD" },
        { location: "unit_economics.jinja", instruction: "expert business analyst — unit economics" },
        { location: "generate_dcf_model_prompt.jinja", instruction: "top-bucket IB associate — openpyxl 3-statement DCF" },
        { location: "query_generation/base_query_prompt.jinja", instruction: "RAG query specialist — semantic search queries" },
        { location: "h2h/h2h_0_landscape.jinja", instruction: "STAGE 0 landscape+triage BEFORE per-competitor work" },
        { location: "DCF Rf rule", instruction: "always US 10Y; never country Rf; FX via WACC dep row" },
        { location: "src/brain/prompts/* + engine packs", instruction: "~142 .jinja total — sections, research, retrieval, RA/H2H/CJA/TIW/ACS/RFW, n8n helpers (see prompts-tiny.md / section-map.md)" },
      ],
      langfuse: "LANGFUSE_{PUBLIC_KEY,SECRET_KEY,HOST} — @observe(name=\"REPORT_GENERATION\")",
    },
  },

  {
    nodeId: "pi-net",
    project: "phoenician-intelligence-backend",
    kbPath: "projects/phoenician-intelligence-backend/",
    summary: "BFF PathBase /api. Does not run DD reasoning — only devops Anthropic log triage. Orchestrates Python jobs + billing adapters.",
    kindSkew: [
      { kind: "billing_vendor", count: 7, role: "Anthropic/OpenAI/DeepSeek/Cursor/GCP/AWS CE + Slack" },
      { kind: "job_orchestrate", count: 5, role: "Python report/jobs/brain + inbound callbacks" },
      { kind: "data_fetch_internal", count: 5, role: "RDS, EFS, S3, Python status, fallback poll" },
      { kind: "data_write_internal", count: 4, role: "EF SaveChanges, S3, EFS markers" },
      { kind: "auth_identity", count: 3, role: "JWT/OTP, SMTP, Secrets Manager callback" },
      { kind: "proxy_forward", count: 2, role: "/api/python/*, DCF multipart" },
      { kind: "realtime_push", count: 2, role: "SignalR notes + SSE ticker status" },
      { kind: "data_fetch_market", count: 2, role: "Yahoo chart, Screen agent universe" },
      { kind: "binary_media", count: 2, role: "OpenAI TTS, DCF files" },
      { kind: "health_ops", count: 2, role: "Diagnostics, active-reports" },
      { kind: "reasoning_llm", count: 1, role: "Anthropic log triage only (DeveloperController)" },
      { kind: "other", count: 1, role: "ChatService persistence (no LLM)" },
    ],
    calls: [
      { caller: "DeveloperController.AnalyzeError*", callee: "api.anthropic.com/v1/messages", kind: "reasoning_llm", purpose: "log triage", auth: "ANTHROPIC_API_KEY" },
      { caller: "MarketDataController", callee: "query1.finance.yahoo.com", kind: "data_fetch_market", purpose: "quotes/hist", auth: "none" },
      { caller: "ScreenAgentClient", callee: "Screen GET /screen/universe", kind: "data_fetch_internal", purpose: "company search", auth: "none; 2500ms; Postgres fallback" },
      { caller: "EF / controllers", callee: "RDS investor_platform_db", kind: "data_fetch_internal", purpose: "entities", auth: "conn string" },
      { caller: "EfsService", callee: "EFS /app/companies", kind: "data_fetch_internal", purpose: "reports/markers", auth: "mount" },
      { caller: "S3Service", callee: "S3 uploads", kind: "data_fetch_internal", purpose: "presign/get/put", auth: "IAM" },
      { caller: "PythonReportService.Get*", callee: "Python reports/status/efs/IR", kind: "data_fetch_internal", purpose: "status/H2H/RA", auth: "callback secret" },
      { caller: "ReportCallbackFallbackService", callee: "EFS + Python active_reports", kind: "data_fetch_internal", purpose: "orphan poll", auth: "hosted" },
      { caller: "AuthService + AuthController", callee: "JWT + OTP", kind: "auth_identity", purpose: "login/invite/reset", auth: "bcrypt+JWT" },
      { caller: "EmailService", callee: "SMTP / MailKit", kind: "auth_identity", purpose: "OTP + transactional", auth: "SMTP" },
      { caller: "Internal controllers", callee: "Secrets Manager phoenician/callback-secret", kind: "auth_identity", purpose: "shared secret", auth: "IAM" },
      { caller: "CompanyNotesHub", callee: "SignalR clients", kind: "realtime_push", purpose: "Yjs CRDT", auth: "JWT" },
      { caller: "TickerRequestController.StatusStream", callee: "SSE", kind: "realtime_push", purpose: "report status", auth: "JWT query token" },
      { caller: "PythonProxyController", callee: "PythonApi BaseUrl", kind: "proxy_forward", purpose: "FE→Python stream", auth: "FE JWT" },
      { caller: "Companies DCF upload", callee: "Python dcf-upload*", kind: "proxy_forward", purpose: "multipart", auth: "JWT" },
      { caller: "PythonReportService generate/cancel/H2H/RA", callee: "Python /api/reports/*", kind: "job_orchestrate", purpose: "DD jobs", auth: "callback secret" },
      { caller: "JobsController", callee: "Python /jobs/*", kind: "job_orchestrate", purpose: "notes AI jobs", auth: "JWT" },
      { caller: "Brain playbooks/skills", callee: "Python /api/brain/*", kind: "job_orchestrate", purpose: "mine/compile", auth: "callback secret" },
      { caller: "CallbacksController.ReportCompleted", callee: "inbound Python", kind: "job_orchestrate", purpose: "completion → SSE", auth: "callback secret" },
      { caller: "TextToSpeechController", callee: "OpenAI /v1/audio/speech", kind: "binary_media", purpose: "TTS", auth: "Open_AI_tts" },
      { caller: "VendorBilling adapters", callee: "Anthropic/OpenAI/DeepSeek/Cursor/BQ/AWS CE", kind: "billing_vendor", purpose: "spend sync", auth: "vendor keys" },
      { caller: "SlackAlertService", callee: "Slack webhook", kind: "billing_vendor", purpose: "budget alert", auth: "webhook" },
    ],
    notes: [".NET does not generate DD sections — Python owns reasoning_llm for reports."],
    prompting: {
      hasLlm: true,
      summary:
        "Anthropic only for developer ops (not DD writing). Haiku triages errors; Sonnet analyzes runs / log chat. TTS is OpenAI speech (binary_media). Full detail: projects/phoenician-intelligence-backend/ai-prompting.md",
      models: [
        { role: "Error / log triage", model: "claude-haiku-4-5-20251001", env: "Anthropic:ApiKey / ANTHROPIC_API_KEY" },
        { role: "Run analysis + log chat", model: "claude-sonnet-4-6", env: "Anthropic:ApiKey / ANTHROPIC_API_KEY" },
        { role: "Text-to-speech (not LLM write)", model: "OpenAI /v1/audio/speech", env: "Open_AI_tts" },
      ],
      services: [
        { name: "DeveloperController.AnalyzeError*", job: "DevOps log triage (Haiku) — not IC research" },
        { name: "DeveloperController analyze-run / log-chat", job: "Run/log analyst (Sonnet) — markdown Result summary" },
        { name: "TextToSpeechController", job: "OpenAI speech synthesis for FE read-aloud" },
      ],
      fragments: [
        {
          location: "DeveloperController.cs · Haiku system",
          instruction:
            "Expert DevOps/backend engineer for PI — knows ECS secrets, CapIQ/AlphaSense blocks, Claude 529, OOM, health-check failures",
        },
        {
          location: "DeveloperController.cs · Sonnet system",
          instruction:
            "Expert analyst for PI report runs — data_collection → main_workflow → DCF; returns markdown Result / Data Collection",
        },
      ],
    },
  },

  {
    nodeId: "pi-fe",
    project: "phoenician-intelligence-frontend",
    kbPath: "projects/phoenician-intelligence-frontend/",
    summary: "SPA triggers jobs via .NET→Python; hosts Screen iframe + Linker navigate; no local DD model calls.",
    kindSkew: [
      { kind: "data_fetch_internal", role: "BFF APIs, report status, notes" },
      { kind: "realtime_push", role: "SignalR notes, SSE status, Screen postMessage" },
      { kind: "proxy_forward", role: "Python stream via .NET proxy" },
      { kind: "other:embed", role: "Screen dashboard iframe" },
      { kind: "auth_identity", role: "pi_auth cookie / JWT" },
      { kind: "binary_media", role: "PDF exports, TTS fetch" },
    ],
    calls: [
      { caller: "FE services", callee: ".NET /api/*", kind: "data_fetch_internal", purpose: "auth, companies, reports, brain", auth: "JWT cookie" },
      { caller: "PythonProxy / stream UI", callee: ".NET → Python", kind: "proxy_forward", purpose: "chatbot / stream", auth: "FE JWT" },
      { caller: "Company notes editor", callee: "SignalR /hubs/company-notes", kind: "realtime_push", purpose: "Yjs CRDT", auth: "JWT" },
      { caller: "Status UI", callee: "SSE ticker status", kind: "realtime_push", purpose: "report progress", auth: "JWT query" },
      { caller: "Screen iframe", callee: "sslip /dashboard/", kind: "other:embed", purpose: "CapIQ Screen UI", auth: "PI login + embed origins" },
      { caller: "PI ↔ iframe", callee: "postMessage", kind: "realtime_push", purpose: "PI_REQUEST_TICKER", auth: "origin-checked" },
      { caller: "Linker nav", callee: "CloudFront /linker", kind: "auth_identity", purpose: "pi_auth gate", auth: "shared JWT secret" },
      { caller: "src/tts/openAiSpeech.ts", callee: ".NET TTS → OpenAI speech", kind: "binary_media", purpose: "read-aloud", auth: "via BFF" },
      { caller: "PDF export helpers", callee: "client render", kind: "binary_media", purpose: "H2H/risk PDF", auth: "none" },
    ],
    prompting: {
      hasLlm: false,
      summary: "No local DD model calls. Prompt lab / brain UIs hit backend APIs. TTS voice key pi.tts.openAiVoice.",
      corpus: "Displays reports; prompt editing surfaces call .NET/Python brain & n8n helpers — see PI Python ai-prompting + brain-skills.md",
    },
  },

  {
    nodeId: "pm-serve",
    project: "phoenician-portfolio (pm-serve)",
    kbPath: "projects/phoenician-portfolio/",
    summary: "Strategy book FastAPI + Redis tip bus. Shares portfolio prompting dossier with pm-fe / earnings_predictor.",
    kindSkew: [
      { kind: "reasoning_llm", role: "Stages 0–6 Claude (+ optional DeepSeek universe)" },
      { kind: "data_fetch_market", role: "Yahoo, CapIQ downloader, FMP-ish feeds" },
      { kind: "data_fetch_internal", role: "Aurora / S3 strategy / Redis" },
      { kind: "realtime_push", role: "Redis tip bus → FE" },
      { kind: "job_orchestrate", role: "strategy runs, earnings_predictor stages" },
      { kind: "binary_media", role: "CapIQ Excel dumps, dossiers" },
    ],
    calls: [
      { caller: "strategy stages 0–6", callee: "Anthropic Claude", kind: "reasoning_llm", purpose: "book construction + debate/lessons", auth: "ANTHROPIC / CLAUDE_MODEL" },
      { caller: "optional universe-run", callee: "DeepSeek deepseek-v4-flash", kind: "reasoning_llm", purpose: "universe pass", auth: "DEEPSEEK_*" },
      { caller: "pi_client.PIClient", callee: "PI .NET /api/internal/universe*", kind: "data_fetch_internal", purpose: "DD/risk/DCF bytes (EFS behind PI, not mounted here)", auth: "X-Callback-Secret" },
      { caller: "pi_client.ensure_risk", callee: "PI ensure-risk + poll", kind: "job_orchestrate", purpose: "kick incomplete risk", auth: "callback secret" },
      { caller: "earnings_bridge", callee: "ep-predict subprocess", kind: "job_orchestrate", purpose: "advisory earnings (never → ER/weights)", auth: "task env" },
      { caller: "capiq-downloader", callee: "CapIQ web Excel", kind: "data_fetch_market", purpose: "financial dumps", auth: "CapIQ accounts" },
      { caller: "market feeds", callee: "Yahoo / FMP", kind: "data_fetch_market", purpose: "prices/FX/rates", auth: "varies" },
      { caller: "pm-serve", callee: "Aurora Postgres", kind: "data_fetch_internal", purpose: "optional book-state mirror", auth: "conn" },
      { caller: "strategy artifacts", callee: "S3 strategy bucket", kind: "data_write_internal", purpose: "JSON book mirror", auth: "IAM" },
      { caller: "tip publisher", callee: "Redis", kind: "realtime_push", purpose: "live tips to FE", auth: "Redis auth" },
      { caller: "FE / clients", callee: "pm-serve HTTP", kind: "data_fetch_internal", purpose: "API surface", auth: "app auth" },
    ],
    notes: [
      "Portfolio ↔ Phoenician DD link is HTTP to PI .NET (universe + DD/risk/DCF). PI EFS is shared only by PI .NET ↔ PI Python — Portfolio does not mount it.",
      "DeepSeek is a confirmed optional universe-run path (strategy/deepseek), not Claude-only.",
      "Earnings_tracker ≠ portfolio earnings_predictor",
      "Factsheet-Automation ≠ live pm-serve",
      "CapIQ downloader ≠ Screen Express ≠ Linker ≠ PI Playwright",
    ],
    prompting: {
      hasLlm: true,
      summary: "Stage-gated Claude models; dossiers = reference data never instructions. Hard NEVER→ER/weights list.",
      models: [
        { role: "0/1/2, debate, lessons", model: "claude-sonnet-5", env: "CLAUDE_MODEL" },
        { role: "3/4/6", model: "claude-opus-5" },
        { role: "5 review", model: "claude-fable-5" },
        { role: "Optional universe-run", model: "deepseek-v4-flash" },
        { role: "TT pace (advisory)", model: "claude-sonnet-5", env: "DEFAULT_PACE_MODEL" },
        { role: "Earnings judge (via EP)", model: "claude-sonnet-5" },
        { role: "Earnings insiders (via EP)", model: "claude-opus-5" },
      ],
      corpus:
        "strategy/prompts/{stage0,company,book,risk,objective,helpers}.py; strategy/reflect/*; debate/catalog.py; technical_trader/{narrative,pace}.py",
      pipeline: [
        "Score: 1.0*sharpe + 0.5*(effN/n) - tanh(target gap) - W_LIQ*liq_penalty",
        "Dossiers = reference data, never instructions",
        "NEVER → ER/weights: earnings, insiders, TT, debate, lessons (injected=false), P/V overlay, Graphs, CapIQ surprises, backtests",
        "Earnings STAGES: capiq_download→ingest→tidy→market_spine→p0_spine→priced_in→forecast→snapshot",
      ],
      fragments: [
        { location: "strategy/prompts/stage0.py", instruction: "STAGE 0 universe membership / consolidation — not position sizing" },
        { location: "strategy/prompts/objective.py", instruction: "Long-only investment-reasoning engine for Phoenician Capital" },
        { location: "strategy/prompts/company.py", instruction: "Independent red-team on ONE shortlist name" },
        { location: "strategy/prompts/risk.py", instruction: "Book is final — risk modeler / portfolio risk officer only" },
        { location: "strategy/prompts/book.py", instruction: "FINAL client-readable review (portfolio strategist voice)" },
        { location: "strategy/reflect/*", instruction: "Post-hoc multi-pass learning review — not weight drivers when injected=false" },
        { location: "debate/catalog.py", instruction: "READ-ONLY explainability desk — retrieval planner + advisory answers" },
        {
          location: "technical_trader/pace.py",
          instruction:
            "Execution-timing specialist — pick participation_pct 0–20 of ADV; never invent ADV; never change weights (advisory)",
        },
        {
          location: "technical_trader/narrative.py",
          instruction: "Trading desk assistant for Phoenician Capital — advisory narrative only",
        },
      ],
    },
  },

  {
    nodeId: "pm-fe",
    project: "phoenician-portfolio (frontend)",
    kbPath: "projects/phoenician-portfolio/",
    summary: "Portfolio manager UI over pm-serve + Redis tips. Prompting lives in Python strategy package.",
    kindSkew: [
      { kind: "data_fetch_internal", role: "pm-serve APIs" },
      { kind: "realtime_push", role: "Redis tip subscription" },
      { kind: "binary_media", role: "exports / charts" },
    ],
    calls: [
      { caller: "PM SPA", callee: "pm-serve", kind: "data_fetch_internal", purpose: "book UI + runs", auth: "app" },
      { caller: "tip client", callee: "Redis tip bus", kind: "realtime_push", purpose: "live tips", auth: "Redis" },
    ],
    prompting: {
      hasLlm: false,
      summary: "No browser LLM. All stage prompts execute in pm-serve / portfolio_manager Python — see pm-serve dossier.",
    },
  },

  {
    nodeId: "ep",
    project: "phoenician-portfolio (earnings_predictor)",
    kbPath: "projects/phoenician-portfolio/",
    summary: "Subpackage of portfolio — not Earnings_tracker. CapIQ download → forecast stages with Claude judges.",
    kindSkew: [
      { kind: "reasoning_llm", role: "judge + insiders" },
      { kind: "data_fetch_market", role: "CapIQ download + market spine" },
      { kind: "job_orchestrate", role: "STAGES pipeline" },
      { kind: "data_write_internal", role: "snapshots / artifacts" },
    ],
    calls: [
      { caller: "capiq_download stage", callee: "CapIQ Excel", kind: "data_fetch_market", purpose: "earnings inputs", auth: "CapIQ" },
      { caller: "forecast / judge", callee: "claude-sonnet-5", kind: "reasoning_llm", purpose: "priced_in → forecast", auth: "Anthropic" },
      { caller: "insiders pass", callee: "claude-opus-5", kind: "reasoning_llm", purpose: "insider analysis", auth: "Anthropic" },
      { caller: "calendar/smart_finder", callee: "DeepSeek chat", kind: "reasoning_llm", purpose: "IR date extract", auth: "DEEPSEEK_*" },
      { caller: "pipeline", callee: "local/S3 artifacts", kind: "data_write_internal", purpose: "snapshot", auth: "FS/IAM" },
    ],
    nonEdges: ["≠ Earnings_tracker (calendar scrape + DeepSeek summaries on its own RDS)"],
    prompting: {
      hasLlm: true,
      summary: "Shares portfolio model table; STAGES fixed order. NEVER inject into ER/weights when flagged.",
      models: [
        { role: "Earnings judge", model: "claude-sonnet-5" },
        { role: "Earnings insiders", model: "claude-opus-5" },
        { role: "Calendar date extract", model: "deepseek-chat", env: "DEEPSEEK_MODEL" },
      ],
      corpus: "earnings_predictor/src/.../llm_battery/judge.py; signals/insider_llm.py; calendar/smart_finder.py",
      pipeline: [
        "capiq_download → ingest → tidy → market_spine → p0_spine → priced_in → forecast → snapshot",
      ],
      fragments: [
        {
          location: "llm_battery/judge.py SYSTEM_PROMPT",
          instruction:
            "Earnings-preview PRECISION JUDGE — owns P(beat)/surprise/|move|; CapIQ + Opus insider are evidence only; must address ticker feedback lessons",
        },
      ],
    },
  },

  {
    nodeId: "portal-api",
    project: "investor-portal-backend",
    kbPath: "projects/investor-portal-backend/",
    summary: "Transactional email = Resend (not SES). Live e-sign = DocuSeal (DocuSign unwired). Admin OpenAI extractors only. No embedding_rag.",
    kindSkew: [
      { kind: "other", count: 10, role: "Resend, Graph IrMail, DocuSeal(+webhook), DocuSign dead, Secrets, tools" },
      { kind: "auth_identity", count: "5+", role: "JWT, OTP, TOTP, HIBP, App Store bypass" },
      { kind: "data_fetch_internal", count: 8, role: "RDS, Dynamo, S3, admin API" },
      { kind: "data_write_internal", count: 6, role: "RDS, S3 put, Dynamo lambda, uploads" },
      { kind: "reasoning_llm", count: 6, role: "OpenAI extractors (admin docs AI only)" },
      { kind: "data_fetch_market", count: "3–8", role: "Yahoo, AlphaVantage, FMP top5" },
      { kind: "binary_media", count: 5, role: "S3 presign, videos, share upload, PDF" },
      { kind: "job_orchestrate", count: 4, role: "Hangfire + 3 jobs" },
      { kind: "realtime_push", count: 2, role: "Expo + FCM send" },
      { kind: "health_ops", count: "2–3", role: "/health, CSP, app version" },
      { kind: "proxy_forward", count: 1, role: "/api/documents/proxy → S3" },
      { kind: "embedding_rag", count: 0, role: "none" },
    ],
    calls: [
      { caller: "OpenAiNameExtractor", callee: "OpenAI chat/completions", kind: "reasoning_llm", purpose: "AI rename", auth: "Bearer; gpt-4o-mini" },
      { caller: "OpenAiStatementSegmenter", callee: "OpenAI", kind: "reasoning_llm", purpose: "split multi-statement PDFs", auth: "gpt-4o-mini" },
      { caller: "OpenAiAnnualReportYearExtractor", callee: "OpenAI", kind: "reasoning_llm", purpose: "report year", auth: "gpt-4o-mini" },
      { caller: "OpenAiSubscriptionDateExtractor", callee: "OpenAI", kind: "reasoning_llm", purpose: "sub date text→vision", auth: "gpt-4o-mini / vision" },
      { caller: "OpenAiContractNoteExtractor", callee: "OpenAI", kind: "reasoning_llm", purpose: "amounts / routing", auth: "mini + gpt-4o vision" },
      { caller: "OpenAiContractNoteTypeVerifier", callee: "OpenAI", kind: "reasoning_llm", purpose: "note type verify", auth: "gpt-4o-mini" },
      { caller: "MarketDataService", callee: "Yahoo query2 chart", kind: "data_fetch_market", purpose: "portfolio quotes", auth: "none (UA); 5m cache" },
      { caller: "MarketDataService", callee: "Alpha Vantage NEWS_SENTIMENT", kind: "data_fetch_market", purpose: "company news", auth: "apikey; 30m cache" },
      { caller: "StrategyTop5Service", callee: "FMP profile + EOD", kind: "data_fetch_market", purpose: "live top5 re-rank", auth: "FMP from Secrets" },
      { caller: "StrategyBookStore", callee: "Dynamo phoenician-capital-strategy-book", kind: "data_fetch_internal", purpose: "weights/anchor", auth: "IAM" },
      { caller: "S3StorageService", callee: "clean + quarantine S3", kind: "binary_media", purpose: "docs/KYC/videos + presign ~300s", auth: "IAM" },
      { caller: "EF AppDbContext", callee: "RDS Postgres", kind: "data_fetch_internal", purpose: "domain + Hangfire", auth: "conn" },
      { caller: "Hangfire jobs", callee: "Resend/push/DocuSeal/RDS", kind: "job_orchestrate", purpose: "KYC expiry; refresh cleanup; signing recovery", auth: "DI" },
      { caller: "EmailService", callee: "Resend POST /emails", kind: "other:transactional_email", purpose: "OTP, reset, KYC warn, invites", auth: "Resend key" },
      { caller: "IrMailService", callee: "AAD + Graph sendMail", kind: "other:graph_mail", purpose: "IR campaigns + SSE", auth: "client creds/refresh" },
      { caller: "DocuSealService", callee: "api.docuseal.com", kind: "other:esign_vendor", purpose: "templates/submissions/signed PDF", auth: "X-Auth-Token" },
      { caller: "DocuSeal webhooks", callee: "InvestorFormsController", kind: "other:esign_webhook", purpose: "signing complete", auth: "signature/token" },
      { caller: "DocuSignService", callee: "DocuSign REST", kind: "other:esign_vendor", purpose: "NOT DI-registered", auth: "JWT" },
      { caller: "ExpoPushNotificationService", callee: "exp.host push/send", kind: "realtime_push", purpose: "iOS Expo", auth: "none on HTTP" },
      { caller: "FcmPushNotificationService", callee: "Firebase FCM", kind: "realtime_push", purpose: "Android", auth: "service account" },
      { caller: "PasswordService", callee: "api.pwnedpasswords.com/range", kind: "auth_identity", purpose: "HIBP k-anon", auth: "fail-open" },
      { caller: "JwtService / TOTP / AppStoreReview", callee: "local + config", kind: "auth_identity", purpose: "tokens / reviewer OTP", auth: "Secrets + AES" },
      { caller: "AppVersionController", callee: "iTunes Lookup", kind: "data_fetch_web", purpose: "live iOS version", auth: "none; 1h cache" },
      { caller: "Documents proxy", callee: "S3", kind: "proxy_forward", purpose: "/api/documents/proxy", auth: "JWT" },
    ],
    nonEdges: ["DocuSign class present but not DI-wired", "Portal JWT ≠ PI JWT", "No embedding_rag"],
    notes: ["Client friction password before destructive AI is UX only, not a security boundary."],
    prompting: {
      hasLlm: true,
      summary: "Admin-only OpenAI chat/completions. Not used on investor-facing portfolio decision paths.",
      models: [
        { role: "Text extractors / rename / segment / year / type", model: "gpt-4o-mini" },
        { role: "Vision amounts / contract notes", model: "gpt-4o" },
      ],
      corpus: "Infrastructure/Services/OpenAi*.cs — inline SystemPrompt constants",
      services: [
        { name: "OpenAiNameExtractor", job: "AI rename for statements / annual reports / subscriptions" },
        { name: "OpenAiStatementSegmenter", job: "Split multi-statement PDFs" },
        { name: "OpenAiAnnualReportYearExtractor", job: "Year from annual report" },
        { name: "OpenAiSubscriptionDateExtractor", job: "Sub date; text-first then PDF vision; JSON response_format" },
        { name: "OpenAiContractNoteExtractor", job: "Route/extract contract note amounts" },
        { name: "OpenAiContractNoteTypeVerifier", job: "Verify note type; text then vision" },
      ],
      fragments: [
        {
          location: "OpenAiNameExtractor.SystemPrompt",
          instruction: "Extract investor/account holder name from one statement page — layout A JPM / B CIBC / C other",
        },
        {
          location: "OpenAiNameExtractor.MetadataSystemPrompt",
          instruction: "Extract statement metadata fields from known administrator layouts",
        },
        {
          location: "OpenAiNameExtractor.BalanceSystemPrompt",
          instruction: "Extract balance figures from a single statement page",
        },
      ],
    },
  },

  {
    nodeId: "portal-web",
    project: "investor-portal-backend (admin/investor React)",
    kbPath: "projects/investor-portal-backend/",
    summary: "Admin + investor SPAs on portal API. Orphan sp500 FE route falls back to static. DocuSeal CDN for builder/signing.",
    kindSkew: [
      { kind: "data_fetch_internal", role: "portal API" },
      { kind: "auth_identity", role: "JWT + HttpOnly refresh" },
      { kind: "other:esign_vendor", role: "DocuSeal CDN" },
      { kind: "other:graph_mail", role: "IR mail UI" },
      { kind: "data_fetch_market", role: "orphan /api/sp500/monthly → static" },
      { kind: "binary_media", role: "PDF + IR stream" },
    ],
    calls: [
      { caller: "admin/investor api clients", callee: "Portal API", kind: "data_fetch_internal", purpose: "domain I/O", auth: "Bearer + HttpOnly refresh" },
      { caller: "authedRawFetch", callee: "API binaries / SSE", kind: "binary_media", purpose: "PDF + IR stream", auth: "Bearer" },
      { caller: "irMailService", callee: "/api/ir-mail/*", kind: "other:graph_mail", purpose: "campaign UI", auth: "Admin JWT" },
      { caller: "holdings.ts", callee: "/api/strategy-book/top5", kind: "data_fetch_internal", purpose: "Dynamo+FMP server", auth: "Admin JWT" },
      { caller: "sp500.ts", callee: "/api/sp500/monthly", kind: "data_fetch_market", purpose: "orphan — no backend route → static fallback", auth: "—" },
      { caller: "DocusealBuilder/Form", callee: "DocuSeal CDN", kind: "other:esign_vendor", purpose: "builder + signing", auth: "builder JWT" },
      { caller: "logo CDNs", callee: "FMP/TV/CompaniesLogo", kind: "data_fetch_web", purpose: "logos", auth: "none" },
    ],
    prompting: {
      hasLlm: false,
      summary: "UI triggers admin OpenAI extractors via API — prompts/models live on portal-api dossier.",
    },
  },

  {
    nodeId: "portal-mobile",
    project: "investor-portal-mobile",
    kbPath: "projects/investor-portal-mobile/",
    summary: "Expo apps hit portal API (not PI). Direct Yahoo poll exists. No on-device LLM.",
    kindSkew: [
      { kind: "auth_identity", count: "3+", role: "login/OTP/TOTP, PIN/biometrics, impersonation (standalone)" },
      { kind: "data_fetch_market", count: 2, role: "backend quotes/news + direct Yahoo useStockPrices" },
      { kind: "realtime_push", count: 2, role: "register Expo/FCM; OS delivery" },
      { kind: "data_fetch_internal", count: "2+", role: "apiRequest → portal API" },
      { kind: "binary_media", count: 1, role: "videos + presigned streams" },
      { kind: "data_fetch_web", count: 1, role: "logo CDNs" },
      { kind: "health_ops", count: 1, role: "app version gate (standalone)" },
      { kind: "other:esign_vendor", count: 1, role: "DocuSeal WebView" },
      { kind: "reasoning_llm", count: 0, role: "AI stays on admin backend" },
    ],
    calls: [
      { caller: "api.ts apiRequest", callee: "portal-api.phoeniciancapital.com", kind: "data_fetch_internal", purpose: "core I/O", auth: "Bearer SecureStore; refresh body" },
      { caller: "authService", callee: "/api/auth/*", kind: "auth_identity", purpose: "login/OTP/TOTP/refresh", auth: "challenge JWT" },
      { caller: "KYC/statements OTP", callee: "step-up unlock APIs", kind: "auth_identity", purpose: "timed unlock", auth: "JWT + email OTP" },
      { caller: "SecureStore / passcode / biometrics", callee: "local", kind: "auth_identity", purpose: "QuickUnlock", auth: "device keychain" },
      { caller: "impersonationService (standalone)", callee: "/api/admin/impersonation/*", kind: "auth_identity", purpose: "admin readonly", auth: "Admin → short token" },
      { caller: "pushService", callee: "Expo → /api/auth/fcm-token", kind: "realtime_push", purpose: "register token", auth: "JWT" },
      { caller: "OS push", callee: "Expo/APNs/FCM → device", kind: "realtime_push", purpose: "receive", auth: "platform" },
      { caller: "useStockPrices", callee: "Yahoo chart direct", kind: "data_fetch_market", purpose: "poll ~30s", auth: "none — bypasses API" },
      { caller: "useStockPricesFromBackend", callee: "/api/.../quote", kind: "data_fetch_market", purpose: "quotes via Yahoo BFF", auth: "JWT" },
      { caller: "documentService news", callee: "/api/.../news", kind: "data_fetch_market", purpose: "AlphaVantage via API", auth: "JWT" },
      { caller: "videoService", callee: "videos + url/thumb", kind: "binary_media", purpose: "list + stream", auth: "JWT" },
      { caller: "investorFormsService + WebView", callee: "API → DocuSeal URL", kind: "other:esign_vendor", purpose: "e-sign", auth: "JWT → DocuSeal" },
      { caller: "logo helpers", callee: "FMP/TV/CompaniesLogo", kind: "data_fetch_web", purpose: "logos", auth: "none" },
      { caller: "appVersionService (standalone)", callee: "/api/app/version", kind: "health_ops", purpose: "force-update", auth: "none" },
    ],
    notes: [
      "Standalone has impersonation + version gate; nested mobile-app does not",
      "Portal AI extractors never called from mobile",
    ],
    prompting: {
      hasLlm: false,
      summary: "None on-device. All AI is admin/backend OpenAI — see portal-api dossier.",
    },
  },

  {
    nodeId: "screen",
    project: "capiq-screen-agent",
    kbPath: "projects/capiq-screen-agent/",
    summary: "Express :3001 + Chrome extension + dashboard. CapIQ via Snowflake/feeds (≠ Linker/PI Playwright). Managed Memory / Dreams — not Vertex RAG.",
    kindSkew: [
      { kind: "reasoning_llm", role: "Chat, screen, auditor, NE, Dreams, suggest, compare" },
      { kind: "data_fetch_market", role: "CapIQ Snowflake, Yahoo, ADV/ownership/price feeds" },
      { kind: "data_fetch_web", role: "Anthropic web_search tool" },
      { kind: "data_fetch_internal", role: "Extension/dashboard→Express; .NET→/screen/universe; SQLite" },
      { kind: "data_write_internal", role: "SQLite; Managed Memory mirror; Watch webhook→PI" },
      { kind: "auth_identity", role: "dash_sess; PI embed trust; CapIQ page session" },
      { kind: "realtime_push", role: "/screen/stream SSE; postMessage; SW keep-alive" },
      { kind: "proxy_forward", role: "nginx sslip; cloudflared→:3001" },
      { kind: "job_orchestrate", role: "Screen runs, live-price 15m, Dream cron, CapIQ PM2" },
      { kind: "binary_media", role: "Attachments, export.docx/json, S3 DB backups" },
      { kind: "embedding_rag", role: "Managed Memory stores (Anthropic memory, not Vertex)" },
      { kind: "other:embed", role: "PI FE iframe to sslip dashboard" },
    ],
    calls: [
      { caller: "Chrome extension SW", callee: "Express :3001", kind: "data_fetch_internal", purpose: "chat/suggest/transcripts", auth: "API open; long timeouts" },
      { caller: "Dashboard SPA", callee: "Express", kind: "data_fetch_internal", purpose: "universe/memory/brain + SSE", auth: "dash_sess / embed trust" },
      { caller: "PI FE iframe", callee: "sslip /dashboard/", kind: "other:embed", purpose: "Screen UI in PI", auth: "PI login + embed origins" },
      { caller: "PI FE ↔ iframe", callee: "postMessage", kind: "realtime_push", purpose: "PI_REQUEST_TICKER", auth: "origin-checked" },
      { caller: ".NET ScreenAgentClient", callee: "GET /screen/universe", kind: "data_fetch_internal", purpose: "company search", auth: "none; 2500ms; Postgres fallback" },
      { caller: "webhooks.js", callee: "PHOENICIAN_WEBHOOK_URL", kind: "data_write_internal", purpose: "Watch verdict notify", auth: "X-Webhook-Key" },
      { caller: "question-engine / llm.js", callee: "Anthropic / GLM / DeepSeek / OR", kind: "reasoning_llm", purpose: "chat + tools", auth: "API keys" },
      { caller: "screening-worker", callee: "Anthropic / GLM / DeepSeek / OR", kind: "reasoning_llm", purpose: "Pass/Watch triage", auth: "API keys" },
      { caller: "Auditor domain", callee: "Anthropic + web_search", kind: "reasoning_llm", purpose: "identify/gate", auth: "API key" },
      { caller: "Auditor / scripts", callee: "CapIQ Snowflake", kind: "data_fetch_market", purpose: "financials/IDs/mcap", auth: "Snowflake reader" },
      { caller: "quote-feed / live-price", callee: "Yahoo Finance", kind: "data_fetch_market", purpose: "quotes/FX", auth: "public" },
      { caller: "capiq-*-feed / ADV", callee: "Snowflake / CapIQ", kind: "data_fetch_market", purpose: "prices/ownership/ADV", auth: "breaker cooldown" },
      { caller: "managed-agents.js", callee: "Anthropic Managed Agents / Dreams", kind: "reasoning_llm", purpose: "suggest + Dreams", auth: "agent IDs" },
      { caller: "raw-store-mirror", callee: "Anthropic memory store", kind: "data_write_internal", purpose: "mirror sessions", auth: "API key" },
      { caller: "Compare judges", callee: "OpenAI / Claude", kind: "reasoning_llm", purpose: "blind A/B", auth: "keys" },
      { caller: "nginx / cloudflared", callee: "local Express", kind: "proxy_forward", purpose: "HTTPS routing", auth: "TLS / tunnel" },
      { caller: "PM2 *-download.config.js", callee: "phoenician-capiq download", kind: "job_orchestrate", purpose: "CapIQ Excel dumps", auth: "CapIQ accounts" },
      { caller: "backup-to-s3.sh", callee: "S3 backup bucket", kind: "binary_media", purpose: "nightly DB backup", auth: "IAM" },
      { caller: "snowflake-mcp (Cursor)", callee: "Snowflake", kind: "data_fetch_market", purpose: "ad-hoc SELECT", auth: "reader; not public API" },
    ],
    nonEdges: ["No Linker edge from this tree", "Playwright CapIQ scrape is sibling download tooling, not Express"],
    prompting: {
      hasLlm: true,
      summary: "Role-split providers + backend/prompts/*.j2. Partner vs Screener vs Auditor personas. Managed Memory betas.",
      models: [
        { role: "Chat / synthesis", model: "Anthropic Opus-class (overridable)", env: "CLAUDE_MODEL_CHAT, CHAT_MODEL, SYNTHESIS_MODEL" },
        { role: "Screen + Dream", model: "Sonnet-class", env: "SCREEN_MODEL, DREAM_MODEL" },
        { role: "Staging desk", model: "Z.AI GLM glm-5.2", env: "SCREEN_LLM_PROVIDER / ZAI_* · :3002" },
        { role: "Llama desk", model: "DeepSeek deepseek-v4-flash", env: "DEEPSEEK_* / OpenRouter · :3004" },
        { role: "Suggest", model: "Managed Agents stream", env: "MANAGED_SUGGESTER_AGENT_ID, SUGGEST_MODEL" },
        { role: "Compare judges", model: "OpenAI + Claude", env: "COMPARE_*_JUDGE_*" },
        { role: "Auditor", model: "Anthropic + web_search", env: "AUDITOR_GATE_MODEL" },
      ],
      corpus:
        "backend/prompts/*.j2 — chat-opener/reply, generate-question, persona(+partner), framework-evolution, suggest-reply; extract-insights/chat-verdict, mind-narrative, company-mind, correction-summary, screener-agreement-summary, investor-summary; screen.system/user/gates/merit/research/critique/portfolio/gate-walkthrough; extract-events, future-study, research-company; auditor-identify/gate.system",
      fragments: [
        { location: "persona-partner.j2", instruction: "John’s thinking partner; 16 Points + FAQ; second person “you”" },
        { location: "chat-opener.system.j2", instruction: "Opening brief when chat opens on a CapIQ company — exactly three sentences, under ~90 words, to “you”" },
        { location: "screen.*.j2", instruction: "Top-of-funnel triage; living mind + playbooks + skills; Pass/Watch" },
        { location: "future-study.system.j2", instruction: "Next Evolution / buying-the-future discovery — not the screener itself" },
        { location: "mind-narrative.system.j2", instruction: "Investor Mind synthesis from the investor’s own voice / principles" },
        { location: "auditor-gate.system.j2", instruction: "Tier 1/2 network resolution with web evidence; JSON verdict" },
        { location: "Dreams DO/DON’T", instruction: "don’t invent stances; may propose /principles/proposed/<slug>.md" },
        { location: "backend/prompts/*.j2 (42 files)", instruction: "Full corpus: chat-*, screen.*, extract-*, company-mind, framework-evolution, suggest-reply, research-company, auditor-*" },
      ],
      pipeline: [
        "Provider switches: SCREEN_LLM_PROVIDER, CHAT_LLM_PROVIDER, LLM_PROVIDER, NE_LLM_PROVIDER",
        "Skills injection via SKILLS_INJECT / skills-updater.js",
        "Managed Memory betas: managed-agents-*, dreaming-*",
      ],
    },
  },

  {
    nodeId: "linker",
    project: "Linker",
    kbPath: "projects/Linker/",
    summary: "CLI CapIQ+Claude qualitative /40; Flask capiq_linker hyperlink patch has NO LLM. ≠ Screen agent.",
    kindSkew: [
      { kind: "data_fetch_market", count: 3, role: "CapIQ Playwright download / resolve / companyId cache" },
      { kind: "binary_media", count: 3, role: "Ranking xlsx, BIFF patch, user download" },
      { kind: "reasoning_llm", count: 1, role: "Claude qualitative /40 — CLI only" },
      { kind: "auth_identity", count: 1, role: "PI JWT pi_auth cookie" },
      { kind: "proxy_forward", count: 1, role: "CF/nginx → Lightsail + Origin-Auth" },
      { kind: "data_write_internal", count: 1, role: "local job store" },
      { kind: "health_ops", count: 1, role: "/healthz" },
    ],
    calls: [
      { caller: "capiq/runner Playwright", callee: "CapIQ Key Stats Excel", kind: "data_fetch_market", purpose: "download financials", auth: "CapIQ accounts" },
      { caller: "capiq/analysis/qualitative", callee: "Anthropic claude-sonnet-4-6", kind: "reasoning_llm", purpose: "qualitative /40", auth: "ANTHROPIC_API_KEY" },
      { caller: "analyze_capital_allocation", callee: "parsers + openpyxl", kind: "binary_media", purpose: "Q40+F60→/100 workbook", auth: "none" },
      { caller: "build_companyid_cache", callee: "CapIQ Playwright", kind: "data_fetch_market", purpose: "ticker→companyId CSV", auth: "CapIQ" },
      { caller: "Flask resolver", callee: "CapIQ Playwright pool", kind: "data_fetch_market", purpose: "resolve IDs for upload", auth: "CapIQ; job mutex" },
      { caller: "excel_linker / biff_patcher", callee: "local BIFF/xlsx", kind: "binary_media", purpose: "inject CapIQ hyperlinks", auth: "none" },
      { caller: "auth.require_pi_auth", callee: "PI JWT HS256", kind: "auth_identity", purpose: "gate routes except healthz", auth: "PI_JWT_SECRET = .NET Jwt" },
      { caller: "CF / nginx", callee: "Lightsail :5050", kind: "proxy_forward", purpose: "/linker*", auth: "X-Origin-Auth + cookie" },
      { caller: "Flask job store", callee: "jobs_data FS", kind: "data_write_internal", purpose: "job TTL 24h; ON_HOLD 90×3", auth: "FS" },
      { caller: "/healthz", callee: "ops", kind: "health_ops", purpose: "public", auth: "none" },
      { caller: "download route", callee: "patched workbook", kind: "binary_media", purpose: "user download", auth: "pi_auth" },
    ],
    nonEdges: ["≠ CapIQ Screen agent (13.62.39.214) — separate CapIQ consumer"],
    prompting: {
      hasLlm: true,
      summary: "CLI only: claude-sonnet-4-6 qualitative 0–40. Web linker: no LLM.",
      models: [{ role: "Qualitative /40", model: "claude-sonnet-4-6", env: "CAPIQ_QUALITATIVE_MODEL" }],
      corpus: "capiq/analysis/qualitative.py · _SYSTEM_PROMPT",
      pipeline: [
        "Composite /100 = Q/40 + pillars A–E /12 each",
        "Buckets Strong≥70, Mixed≥40, Poor; Capital Destroyer; Insufficient History",
      ],
      fragments: [
        {
          location: "qualitative.py _SYSTEM_PROMPT",
          instruction:
            "Institutional equity analyst — qualitative business quality 0–40 as strict JSON {score, rationale}; unique model + difficulty to replicate; no generic “strong brand” points without evidence",
        },
      ],
    },
  },

  {
    nodeId: "earnings",
    project: "Earnings_tracker",
    kbPath: "projects/Earnings_tracker/",
    summary: "Calendar scrape + DeepSeek summaries. Not portfolio earnings_predictor.",
    kindSkew: [
      { kind: "data_fetch_web", count: 5, role: "SerpAPI, httpx IR, curl_cffi, Playwright, SEC" },
      { kind: "job_orchestrate", count: 4, role: "EventBridge weekly/hourly, locks, summary batches" },
      { kind: "data_fetch_internal", count: 2, role: "Postgres reads, SPA→API" },
      { kind: "data_write_internal", count: 2, role: "Postgres upserts" },
      { kind: "reasoning_llm", count: 1, role: "DeepSeek extract/rank/summary" },
      { kind: "proxy_forward", count: 1, role: "Lambda → ECS summary API" },
      { kind: "binary_media", count: 1, role: "CF→S3 SPA assets" },
      { kind: "health_ops", count: 1, role: "/api/health" },
      { kind: "other:smtp_email", count: 1, role: ".ics invites" },
    ],
    calls: [
      { caller: "EventBridge weekly", callee: "Lambda earnings-tracker", kind: "job_orchestrate", purpose: "Mon 08:00 UTC scrape", auth: "events→lambda" },
      { caller: "EventBridge hourly", callee: "Lambda generate_summaries", kind: "job_orchestrate", purpose: "1h/2h/3h post-event", auth: "events→lambda" },
      { caller: "Lambda / FastAPI", callee: "Postgres RDS", kind: "data_fetch_internal", purpose: "companies/events/summaries", auth: "DATABASE_URL" },
      { caller: "Lambda", callee: "SUMMARY_API_URL ECS FastAPI", kind: "proxy_forward", purpose: "Playwright tier outsource", auth: "X-API-Key" },
      { caller: "smart_finder / webcast / summary_finder", callee: "SerpAPI", kind: "data_fetch_web", purpose: "search", auth: "SERPAPI_KEY" },
      { caller: "extract/ranker/finders", callee: "DeepSeek api.deepseek.com", kind: "reasoning_llm", purpose: "extract/rank/verify", auth: "OPENAI_API_KEY→DeepSeek" },
      { caller: "summary/fetch", callee: "IR/PDF hosts httpx", kind: "data_fetch_web", purpose: "document fetch", auth: "none" },
      { caller: "summary/fetch curl_cffi", callee: "sites w/ TLS blocks", kind: "data_fetch_web", purpose: "JA3 impersonation", auth: "none" },
      { caller: "ir_navigation + Playwright", callee: "JS IR pages", kind: "data_fetch_web", purpose: "browse", auth: "none (ECS image)" },
      { caller: "summary/sec_handler", callee: "SEC URLs", kind: "data_fetch_web", purpose: "filings", auth: "UA" },
      { caller: "calendar_sender", callee: "SMTP O365/Gmail", kind: "other:smtp_email", purpose: ".ics invites", auth: "SMTP creds" },
      { caller: "React web CF", callee: "/api/* → ALB", kind: "data_fetch_internal", purpose: "dashboard", auth: "reads open; writes key" },
      { caller: "CF origin", callee: "S3 web bucket", kind: "binary_media", purpose: "SPA assets", auth: "OAC" },
      { caller: "FastAPI /api/health", callee: "ops", kind: "health_ops", purpose: "health", auth: "none" },
      { caller: "distributed_locks", callee: "Postgres", kind: "job_orchestrate", purpose: "600/180/300/400s locks", auth: "DB" },
    ],
    prompting: {
      hasLlm: true,
      summary: "DeepSeek via OpenAI-compatible SDK https://api.deepseek.com. Env often named OPENAI_API_KEY but value is DeepSeek.",
      models: [
        { role: "finder / webcast / extract", model: "deepseek-v4-pro" },
        { role: "summaries / ranker / sec_handler / summary_finder / generator", model: "deepseek-chat", env: "DEEPSEEK_MODEL" },
      ],
      corpus: "tracker/summary/{extract,ranker}.py + smart_finder / webcast_finder string systems",
      fragments: [
        {
          location: "summary/extract.py",
          instruction: "Senior equity research analyst at a long-only partnership — extract event facts for the IC reader",
        },
        {
          location: "summary/ranker.py",
          instruction: "Pick BEST document / IR link / official site / transcript URL — multiple specialized navigator prompts",
        },
      ],
    },
  },

  {
    nodeId: "factsheet",
    project: "Factsheet-Automation",
    kbPath: "projects/Factsheet-Automation/",
    summary: "Client-only marketing factsheet. No reasoning_llm. Admin twin is portal /strategy-factsheet.",
    kindSkew: [
      { kind: "data_fetch_market", count: 2, role: "Dev Vite plugins → FMP + Yahoo" },
      { kind: "binary_media", count: 2, role: "Client PDF + Excel export" },
      { kind: "data_fetch_internal", count: 2, role: "Bundled src/data/* + optional holdings URL" },
      { kind: "proxy_forward", count: 1, role: "Dev /api/portfolio/top5 Vite plugin" },
      { kind: "other:browser_storage", count: 1, role: "localStorage overrides" },
    ],
    calls: [
      { caller: "vite.portfolioApi (dev)", callee: "FMP profile + EOD", kind: "data_fetch_market", purpose: "re-rank top5 by price", auth: "FMP_KEY" },
      { caller: "vite.sp500Api (dev)", callee: "Yahoo chart", kind: "data_fetch_market", purpose: "^SP500TR monthly", auth: "none" },
      { caller: "api/holdings.ts", callee: "optional VITE_HOLDINGS_API_URL", kind: "data_fetch_internal", purpose: "external holdings book", auth: "optional key" },
      { caller: "SPA", callee: "Vite /api/portfolio/top5", kind: "proxy_forward", purpose: "dev re-rank", auth: "local" },
      { caller: "exportFactsheetPdf", callee: "html2canvas + jsPDF", kind: "binary_media", purpose: "PDF", auth: "none" },
      { caller: "exportPerformanceExcel", callee: "ExcelForge", kind: "binary_media", purpose: "xlsx", auth: "none" },
      { caller: "App / top5 cache", callee: "localStorage", kind: "other:browser_storage", purpose: "month overrides", auth: "none" },
      { caller: "static src/data/*", callee: "bundled TS", kind: "data_fetch_internal", purpose: "fund/performance/S&P stub", auth: "none" },
    ],
    prompting: {
      hasLlm: false,
      summary: "None. Pure client-side React; fee/performance math deterministic — see tiny-logic.md / fund-copy.md.",
    },
  },

  {
    nodeId: "mail-sender",
    project: "phoenician-mail-sender",
    kbPath: "projects/phoenician-mail-sender/",
    summary: "Graph sendMail + Excel parse. Twin IR UX on portal IrMailService.",
    kindSkew: [
      { kind: "other:graph_mail", role: "Microsoft Graph sendMail" },
      { kind: "binary_media", role: "Excel parse / attachments" },
      { kind: "auth_identity", role: "AAD app credentials" },
    ],
    calls: [
      { caller: "mail sender service", callee: "Microsoft Graph sendMail", kind: "other:graph_mail", purpose: "IR / bulk mail", auth: "AAD client creds" },
      { caller: "Excel parse", callee: "local workbook", kind: "binary_media", purpose: "recipient/list IO", auth: "none" },
    ],
    prompting: {
      hasLlm: false,
      summary: "None. Graph sendMail + Excel only. Portal IrMail has its own rate/limits in portal tiny-logic.",
    },
  },

  {
    nodeId: "pi-global",
    project: "pi-global-app",
    kbPath: "projects/pi-global-app/",
    summary: "This map site. Static Amplify; no runtime vendor LLM calls.",
    kindSkew: [
      { kind: "binary_media", role: "static build assets" },
      { kind: "health_ops", role: "Amplify hosting" },
    ],
    calls: [
      { caller: "GHA deploy", callee: "Amplify StartDeployment", kind: "job_orchestrate", purpose: "zip → hosting", auth: "IAM github-actions-pi-global" },
      { caller: "Browser", callee: "static _app chunks", kind: "binary_media", purpose: "ecosystem UI", auth: "public" },
    ],
    prompting: {
      hasLlm: false,
      summary: "None at runtime. Intelligence dossiers are authored from .cursor KB into src/lib/ecosystem/intelligence.js.",
    },
  },
];

/** @type {Map<string, Dossier>} */
export const dossierByNodeId = new Map(dossiers.map((d) => [d.nodeId, d]));

export function dossierFor(nodeId) {
  return dossierByNodeId.get(nodeId) ?? null;
}

/** Projects that have deep call + prompt coverage */
const CORE_GUIDE_ORDER = ["pi-fe", "pi-net", "pi-py", "screen", "pm-serve", "pm-fe", "ep", "portal-api", "portal-web"];

export function intelligenceProjects() {
  const list = dossiers.map((d) => ({
    nodeId: d.nodeId,
    project: d.project,
    callCount: d.calls.length,
    hasLlm: d.prompting.hasLlm,
    modelCount: d.prompting.models?.length ?? 0,
    fragmentCount: d.prompting.fragments?.length ?? 0,
    kbPath: d.kbPath,
    summary: d.summary,
  }));
  return list.sort((a, b) => {
    const ai = CORE_GUIDE_ORDER.indexOf(a.nodeId);
    const bi = CORE_GUIDE_ORDER.indexOf(b.nodeId);
    const ar = ai === -1 ? 999 : ai;
    const br = bi === -1 ? 999 : bi;
    return ar - br || a.project.localeCompare(b.project);
  });
}

/**
 * Search calls + prompts across dossiers
 * @param {string} query
 */
export function searchIntelligence(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  /** @type {{ kind: string, id: string, title: string, subtitle: string, score: number, nodeId: string }[]} */
  const hits = [];

  for (const d of dossiers) {
    if (`${d.project} ${d.summary}`.toLowerCase().includes(q)) {
      hits.push({
        kind: "dossier",
        id: d.nodeId,
        nodeId: d.nodeId,
        title: d.project,
        subtitle: d.summary,
        score: 70,
      });
    }
    for (const c of d.calls) {
      const hay = `${c.caller} ${c.callee} ${c.kind} ${c.purpose} ${c.auth ?? ""}`.toLowerCase();
      if (hay.includes(q)) {
        hits.push({
          kind: "call",
          id: `${d.nodeId}:${c.caller}:${c.callee}`,
          nodeId: d.nodeId,
          title: `${c.caller} → ${c.callee}`,
          subtitle: `${d.project} · ${c.kind} · ${c.purpose}`,
          score: 55,
        });
      }
    }
    const p = d.prompting;
    for (const m of p.models ?? []) {
      if (`${m.role} ${m.model} ${m.env ?? ""}`.toLowerCase().includes(q)) {
        hits.push({
          kind: "model",
          id: `${d.nodeId}:model:${m.role}`,
          nodeId: d.nodeId,
          title: m.model,
          subtitle: `${d.project} · ${m.role}`,
          score: 65,
        });
      }
    }
    for (const f of p.fragments ?? []) {
      if (`${f.location} ${f.instruction}`.toLowerCase().includes(q)) {
        hits.push({
          kind: "prompt",
          id: `${d.nodeId}:prompt:${f.location}`,
          nodeId: d.nodeId,
          title: f.location,
          subtitle: `${d.project} · ${f.instruction}`,
          score: 60,
        });
      }
    }
    for (const s of p.services ?? []) {
      if (`${s.name} ${s.job}`.toLowerCase().includes(q)) {
        hits.push({
          kind: "prompt-service",
          id: `${d.nodeId}:svc:${s.name}`,
          nodeId: d.nodeId,
          title: s.name,
          subtitle: `${d.project} · ${s.job}`,
          score: 58,
        });
      }
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, 50);
}
