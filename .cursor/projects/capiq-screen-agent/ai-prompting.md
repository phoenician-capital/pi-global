# AI prompting — capiq-screen-agent

## Providers (roles)

| Role | Typical | Env |
|------|---------|-----|
| Chat / synthesis | Anthropic Opus-class (overridable) | `CLAUDE_MODEL_CHAT`, `CHAT_MODEL`, `SYNTHESIS_MODEL` |
| Screen + Dream | Sonnet-class | `SCREEN_MODEL`, `DREAM_MODEL` |
| Staging desk | Z.AI GLM `glm-5.2` | `SCREEN_LLM_PROVIDER` / `ZAI_*` · port 3002 |
| Llama desk | DeepSeek `deepseek-v4-flash` | port 3004 · `DEEPSEEK_*` / OpenRouter |
| Suggest | Managed Agents stream | `MANAGED_SUGGESTER_AGENT_ID`, `SUGGEST_MODEL` |
| Compare judges | OpenAI + Claude | `OPENAI_API_KEY`, `COMPARE_*_JUDGE_*` |
| Auditor | Anthropic + web_search | `AUDITOR_GATE_MODEL` |

Provider switches: `SCREEN_LLM_PROVIDER`, `CHAT_LLM_PROVIDER`, `LLM_PROVIDER`, `NE_LLM_PROVIDER`, …

## Prompt templates (`backend/prompts/*.j2`)

Chat: `chat-opener.*`, `chat-reply.*`, `generate-question.*`, `persona.j2`, `persona-partner.j2`, `framework-evolution.j2`, `suggest-reply.*`  
Memory: `extract-insights.*`, `extract-chat-verdict.*`, `mind-narrative.*`, `company-mind.*`, `correction-summary.*`, `screener-agreement-summary.*`, `investor-summary.user.j2`  
Screen: `screen.system/user.j2`, `screen.gates.j2`, `screen.merit.j2`, `screen.research.*`, `screen.critique.user.j2`, `screen.portfolio.user.j2`, `screen.gate-walkthrough.*`  
Events / NE / research: `extract-events.*`, `future-study.*`, `research-company.*`  
Auditors: `auditor-identify.system.j2`, `auditor-gate.system.j2` (under domain)

## Fragments (non-secret)

- Partner = John’s thinking partner; apply **16 Points** + FAQ; second person “you”.
- Screener = top-of-funnel triage; injects living mind + playbooks + skills; verdicts Pass/Watch.
- Auditor gate = Tier 1/2 network resolution with web evidence; JSON verdict.
- Dreams DO/DON’T: don’t invent stances; may propose `/principles/proposed/<slug>.md`.

Managed Memory betas: `managed-agents-*`, `dreaming-*`. Skills injection via `SKILLS_INJECT` / `skills-updater.js`.
