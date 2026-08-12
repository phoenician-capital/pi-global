# Architecture — PI Python (v2)

```
FastAPI orchestrator (2 workers)
  ├─ JWT / X-Internal-Secret / X-Callback-Secret
  ├─ Job registry + ECS scale-in protection
  └─ subprocess(main.py | main_deepseek.py) + SUBPROCESS_*
         ├─ DataCollectionOrchestrator
         │    AlphaSense PDFs → CapIQ Excels → PDF crawler → company reviews
         ├─ RAG warm (Vertex | Gemini FS | AlphaSense) + agentic query gen
         ├─ Parallel Perplexity web research (as needed)
         ├─ Sections order [2,3,4,5,6,7,8,9,10,12,1,11]
         ├─ §8 UE-DCF 8-step + LibreOffice + P/V gate
         ├─ Assemble JSON/docs → callback .NET
         └─ Optional H2H / risk auditor / brain mine
```

**Filesystem tenants:** `companies/{TICKER}/` (+ `/cheap/`), `raw_data/{TICKER}/` on EFS.  
**Config SoT:** `config/config.py`. No DI framework.
