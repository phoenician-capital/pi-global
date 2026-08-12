# AI — Earnings_tracker

DeepSeek via OpenAI-compatible SDK `https://api.deepseek.com`. Env key often named `OPENAI_API_KEY` (value is DeepSeek).

| Model default | Used for |
|---------------|----------|
| `deepseek-v4-pro` | `smart_finder.py`, `webcast_finder.py`, `earnings/extract_earnings.py` |
| `deepseek-chat` | Summaries (`summary/{extract,ranker,sec_handler}.py`, `summary_finder.py`, `summary_generator.py`) |

Module list: [`module-map.md`](./module-map.md). Locks / schedules: [`tiny-logic.md`](./tiny-logic.md).
