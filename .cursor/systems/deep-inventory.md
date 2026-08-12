# Deep inventory (max-info pass)

Entry point for file-level inventories added after the tiny-logic / gap / final-pass layers.

## Systems-level

| Doc | Contents |
|-----|----------|
| [overview.md](./overview.md) | Platform map |
| [linkage-graph.md](./linkage-graph.md) | Edges between systems |
| [data-flows.md](./data-flows.md) | Data movement |
| [aws-inventory.md](./aws-inventory.md) | AWS resources |
| [urls-and-domains.md](./urls-and-domains.md) | Hosts |
| [auth-boundaries.md](./auth-boundaries.md) | Auth islands |
| [cap-iq-and-screen.md](./cap-iq-and-screen.md) | CapIQ surfaces |
| [ai-prompting-map.md](./ai-prompting-map.md) | Where LLMs live |
| [compose-and-scripts.md](./compose-and-scripts.md) | Make / compose / CLIs |
| [tiny-logic-index.md](./tiny-logic-index.md) | Behavioral constants index |
| [COMPLETENESS.md](./COMPLETENESS.md) | Coverage checklist |
| [call-taxonomy.md](./call-taxonomy.md) | Shared call_kind labels |
| [call-architecture.md](./call-architecture.md) | Platform call heatmap + mermaid |
| [glossary.md](./glossary.md) | Terms |

## Per-project deep inventories

| Project | New / expanded |
|---------|----------------|
| phoenician-intelligence | [`section-map.md`](../projects/phoenician-intelligence/section-map.md), [`python-api-routes.md`](../projects/phoenician-intelligence/python-api-routes.md) |
| phoenician-intelligence-backend | [`controllers-inventory.md`](../projects/phoenician-intelligence-backend/controllers-inventory.md) |
| phoenician-intelligence-frontend | [`routes-inventory.md`](../projects/phoenician-intelligence-frontend/routes-inventory.md) |
| phoenician-portfolio | [`module-map.md`](../projects/phoenician-portfolio/module-map.md) |
| investor-portal-backend | [`domain-enums.md`](../projects/investor-portal-backend/domain-enums.md), [`features-inventory.md`](../projects/investor-portal-backend/features-inventory.md) |
| investor-portal-mobile | [`screens-inventory.md`](../projects/investor-portal-mobile/screens-inventory.md) |
| Earnings_tracker | [`module-map.md`](../projects/Earnings_tracker/module-map.md) |
| Linker | [`module-map.md`](../projects/Linker/module-map.md) |
| Factsheet-Automation | [`fund-copy.md`](../projects/Factsheet-Automation/fund-copy.md) |
| phoenician-mail-sender | [`module-map.md`](../projects/phoenician-mail-sender/module-map.md) |
| **capiq-screen-agent** | [`OVERVIEW`](../projects/capiq-screen-agent/OVERVIEW.md) · [`call-architecture`](../projects/capiq-screen-agent/call-architecture.md) · [`module-map`](../projects/capiq-screen-agent/module-map.md) · [`tiny-logic`](../projects/capiq-screen-agent/tiny-logic.md) · [`api-surface`](../projects/capiq-screen-agent/api-surface.md) |

## What this pass added (summary)

- Full DD section name + dependency DAG + engine folder list + H2H/RA steps + Langfuse names + Docker health
- Representative Python FastAPI route table
- Every .NET controller prefix, DbSets, seed emails/roles, hosted services
- Every PI FE page route + service filename + storage keys
- Portfolio strategy/server/FE route/EP package trees
- Portal Application Features, all enum members, Hangfire jobs, Infrastructure services, admin pages
- Both mobile screen/service trees + app versions
- Earnings tracker modules, web components, DB column highlights
- Linker capiq/analysis modules + qualitative prompt opener
- Factsheet component list + fund marketing statics + performance year span
- Mail-sender module one-liners + FE components
