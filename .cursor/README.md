# PI Global — Infrastructure Knowledge Base (max-info pass)

Distilled from **source-level** reads of every reference tree. Env **names only** — never secret values.

## Navigation

| Need | Path |
|------|------|
| Agent entry | [`AGENTS.md`](./AGENTS.md) |
| Topology | [`systems/overview.md`](./systems/overview.md) |
| How products connect | [`systems/linkage-graph.md`](./systems/linkage-graph.md) |
| Data flows | [`systems/data-flows.md`](./systems/data-flows.md) |
| AI / prompting map | [`systems/ai-prompting-map.md`](./systems/ai-prompting-map.md) |
| AWS inventory | [`systems/aws-inventory.md`](./systems/aws-inventory.md) |
| URLs | [`systems/urls-and-domains.md`](./systems/urls-and-domains.md) |
| Auth boundaries | [`systems/auth-boundaries.md`](./systems/auth-boundaries.md) |
| CapIQ / Screen | [`systems/cap-iq-and-screen.md`](./systems/cap-iq-and-screen.md) |
| Glossary | [`systems/glossary.md`](./systems/glossary.md) |
| **Tiny logic index** | [`systems/tiny-logic-index.md`](./systems/tiny-logic-index.md) |
| **Deep inventories** | [`systems/deep-inventory.md`](./systems/deep-inventory.md) |
| **Call taxonomy** | [`systems/call-taxonomy.md`](./systems/call-taxonomy.md) |
| **Call architecture** | [`systems/call-architecture.md`](./systems/call-architecture.md) |
| **Completeness checklist** | [`systems/COMPLETENESS.md`](./systems/COMPLETENESS.md) |
| Compose / CLIs | [`systems/compose-and-scripts.md`](./systems/compose-and-scripts.md) |

## Projects

| Local folder | KB |
|--------------|-----|
| `phoenician-intelligence/` | [`projects/phoenician-intelligence/`](./projects/phoenician-intelligence/) |
| `phoenician-intelligence-backend/` | [`projects/phoenician-intelligence-backend/`](./projects/phoenician-intelligence-backend/) |
| `phoenician-intelligence-frontend/` | [`projects/phoenician-intelligence-frontend/`](./projects/phoenician-intelligence-frontend/) |
| `phoenician-portfolio/` | [`projects/phoenician-portfolio/`](./projects/phoenician-portfolio/) |
| `Earnings_tracker/` | [`projects/Earnings_tracker/`](./projects/Earnings_tracker/) |
| `Linker/` | [`projects/Linker/`](./projects/Linker/) |
| `Factsheet-Automation/` | [`projects/Factsheet-Automation/`](./projects/Factsheet-Automation/) |
| `investor-portal-backend/` | [`projects/investor-portal-backend/`](./projects/investor-portal-backend/) |
| `investor-portal-mobile/` | [`projects/investor-portal-mobile/`](./projects/investor-portal-mobile/) |
| `phoenician-mail-sender/` | [`projects/phoenician-mail-sender/`](./projects/phoenician-mail-sender/) |
| `capiq-screen-agent/` | [`projects/capiq-screen-agent/`](./projects/capiq-screen-agent/) |
| This site | [`projects/pi-global-app/`](./projects/pi-global-app/) |

## Per-project file convention

Each project folder aims for:

`OVERVIEW` · `architecture` · **`call-architecture`** · `api-surface` · `ai-prompting` · `data-sources` · `deploy` · `env-catalog` · `invariants` · `links` · `read-first` · **`tiny-logic`** (+ formulas/flags/state-machines/kb-invariants + **v4** http-status/prompts/fx/naming/… gap files) + **deep inventories** (`section-map`, `*-inventory`, `module-map`, `fund-copy`, …)

(Some satellites omit unused sections. Start from [`systems/call-architecture.md`](./systems/call-architecture.md) for call kinds; [`systems/deep-inventory.md`](./systems/deep-inventory.md) for file lists.)
