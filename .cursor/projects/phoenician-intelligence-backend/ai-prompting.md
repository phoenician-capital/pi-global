# PI control (.NET) — AI / prompting

**Does not write DD sections.** Report `reasoning_llm` lives in PI Python. This backend has a small Anthropic surface for **developer ops**, plus OpenAI **TTS** (`binary_media`, not generation).

## Models

| Role | Model | Where | Auth |
|------|-------|-------|------|
| Error / log triage | `claude-haiku-4-5-20251001` | `DeveloperController` AnalyzeError* | `Anthropic:ApiKey` / `ANTHROPIC_API_KEY` |
| Run analysis + log chat | `claude-sonnet-4-6` | `DeveloperController` analyze-run / log-chat | same |
| Text-to-speech | OpenAI `/v1/audio/speech` | `TextToSpeechController` | `Open_AI_tts` |

## System prompt roles (evidence)

1. **DevOps triage (Haiku)** — `Controllers/DeveloperController.cs`  
   “You are an expert DevOps and backend engineer for the Phoenician Intelligence platform…”  
   Includes architecture context (React FE, .NET EB, Python ECS, RDS, Secrets, S3/EFS) and common failure modes (ECS secrets, CapIQ/AlphaSense, Claude 529, OOM…).

2. **Run / log analyst (Sonnet)** — same controller  
   “You are an expert analyst for the Phoenician Intelligence platform…”  
   Focuses on report-run logs: data_collection → main_workflow → DCF; markdown Result / Data Collection summary.

## Call kinds (AI-adjacent only)

| Kind | What |
|------|------|
| `reasoning_llm` | Anthropic Messages for DevOps / run analysis only |
| `binary_media` | OpenAI TTS speech synthesis |
| `billing_vendor` | Anthropic/OpenAI/DeepSeek/… **cost sync** adapters (not prompts) |

## Non-edges

- No DD section Jinja / report writing here.
- No CapIQ financial scrape from this LLM path.
- Prompt lab / improve-prompt UIs on the FE hit **Python** brain / n8n helpers via this BFF — templates live under `phoenician-intelligence`.

See also: `call-architecture.md` · systems `ai-prompting-map.md`.
