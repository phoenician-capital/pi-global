# AI — Portfolio (v2)

| Role | Model |
|------|-------|
| 0/1/2, debate, lessons | `claude-sonnet-5` (`CLAUDE_MODEL`) |
| 3/4/6 | `claude-opus-5` |
| 5 review | `claude-fable-5` |
| Optional universe-run | `deepseek-v4-flash` |
| Earnings judge | `claude-sonnet-5` |
| Earnings insiders | `claude-opus-5` |

**Prompts:** `portfolio_manager/src/.../strategy/prompts/{stage0,company,book,risk,objective,helpers}.py`, `strategy/reflect/prompts.py`.  
**Score:** `1.0*sharpe + 0.5*(effN/n) - tanh(target gap) - W_LIQ*liq_penalty`.  
**Dossiers = reference data, never instructions.**  
**NEVER → ER/weights:** earnings, insiders, TT, debate, lessons (`injected=false`), P/V overlay, Graphs, CapIQ surprises, backtests.  
**Earnings STAGES:** capiq_download→ingest→tidy→market_spine→p0_spine→priced_in→forecast→snapshot.
