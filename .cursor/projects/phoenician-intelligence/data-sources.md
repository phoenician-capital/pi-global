# Data sources — PI Python (v2)

| Client | Pattern | Env names |
|--------|---------|-----------|
| Anthropic | SDK | `ANTHROPIC_API_KEY`, `PI_ANTHROPIC_API_KEY` |
| OpenAI / DeepSeek / xAI | SDKs; DeepSeek `https://api.deepseek.com` | `OPENAI_API_KEY`, `DEEPSEEK_*`, `GROK_API_KEY`/`XAI_API_KEY` |
| Gemini/Vertex | GenAI + Discovery Engine | `GEMINI_API_KEY`, `GOOGLE_CLOUD_PROJECT`, `GOOGLE_APPLICATION_CREDENTIALS`, `VERTEX_AI_SEARCH_*`, `USE_*` |
| Perplexity | `api.perplexity.ai` | `PERPLEXITY_API_KEY` |
| CapIQ | `api.capitaliq.com`, `capitaliq.com/CIQDotNet` | `CAPIQ_USERNAME/PASSWORD` |
| FMP | `financialmodelingprep.com/stable` | `FMP_KEY` |
| Serp/Trustpilot | scraperapi / trustpilot | `SERPAPI_KEY` |
| S3 | bucket URLs | `USE_S3_STORAGE`, `S3_BUCKET_NAME`, `UPLOAD_S3_BUCKET`, `BACKUP_S3_BUCKET`, `AWS_REGION` |
| .NET | callback/prefetch | `CSHARP_API_URL`, `BACKEND_API_BASE`, `CALLBACK_SECRET`, `INTERNAL_API_SECRET` |
| Screen/memory | `SCREENER_API_URL`; EC2 `13.62.39.214` | `EC2_INVESTOR_MEMORY_*` |
| Neo4j | local bolt / Aura | `config/neo4j_config.py` |
| GCP WIF | `gcp-aws-config.json` → SA `phoenician-rag-prod@…` | project `461776887688` |
