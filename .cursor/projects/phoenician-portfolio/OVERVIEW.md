# phoenician-portfolio (v2)

**Local:** `phoenician-portfolio/` · uv · Python ≥3.11 (prod 3.12)

**Role:** Exactly **two books** — Phoenician (wire `john`, `custom/*`) vs AI (UI “AI”, wire `universe`, `books/universe/**`). Claude stages size AI book; Weight Lab owns Phoenician. Advisory research never feeds ER/weights. Wire `ai` → **410**.

## Subpackages
| Path | Role |
|------|------|
| `portfolio_manager/` 0.2.0 | Engine + `pm-serve` |
| `portfolio_manager_frontend/` | Svelte 5.1 + Kit 2.8 SPA |
| `earnings_predictor/` 0.1.0 | Next-print research only |
| `capiq-downloader/` 0.1.0 | CapIQ Hard refresh |
| `.cursor/kb/00–14` | Authoritative tiny-logic (prefer when editing) |

## Live
- FE: `https://main.d13pt3zp42x49n.amplifyapp.com` (Amplify `d13pt3zp42x49n`)
- BE: `https://pm-c158299c049442bcbddfb0b6c90d4d19.ecs.eu-north-1.on.aws` (`pm-serve-1b08`)
- S3: `phoenician-capital-strategy`
