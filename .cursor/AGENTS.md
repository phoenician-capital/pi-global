# AGENTS — PI Global (KB max-info)

You are working in **`pi-global`**: SvelteKit static site on Amplify that will **graph Phoenician Capital infrastructure**.

## How to use this KB

1. [`.cursor/README.md`](./README.md) → [`systems/overview.md`](./systems/overview.md) → [`systems/linkage-graph.md`](./systems/linkage-graph.md).
2. Coverage: [`systems/COMPLETENESS.md`](./systems/COMPLETENESS.md).
3. **Call kinds (data fetch vs reasoning vs …):** [`systems/call-taxonomy.md`](./systems/call-taxonomy.md) → [`systems/call-architecture.md`](./systems/call-architecture.md) → `projects/<name>/call-architecture.md`.
4. **Prompt engineering:** [`systems/ai-prompting-map.md`](./systems/ai-prompting-map.md) → `projects/<name>/ai-prompting.md` (+ PI `prompts-tiny.md` / `section-map.md`).
5. Behavioral constants: [`systems/tiny-logic-index.md`](./systems/tiny-logic-index.md) → `projects/<name>/tiny-logic.md` + gap siblings.
6. File-level inventories: [`systems/deep-inventory.md`](./systems/deep-inventory.md) (sections, controllers, FE routes, enums, modules, screens).
7. Subpackages: portfolio `earnings-predictor.md` / `capiq-downloader.md`; PI `brain-skills.md` / `prefetch.md` / `section-map.md`; portal `tools.md` / `admin-factsheet.md` / `domain-enums.md`; **Screen** `projects/capiq-screen-agent/` (call-architecture + tiny-logic).
8. Local reference trees are gitignored (incl. `capiq-screen-agent/`). Never invent edges. Never commit secrets.

## Where to see calls + prompts (extreme depth)

| Surface | What you get |
|---------|----------------|
| **Live UI → `Map`** | Constellation with LOD zoom, vendor toggle, path hops, blast up/down colors. |
| **Live UI → `Product guides`** | Guided desk: Simple → Talks to → AI. **Show on map** bridges back. |
| **Live UI → `AI & calls`** | **Cross-project atlas:** every model role, writing-rule fragment, and call-kind taxonomy (+ per-product connection tables). |
| **Live UI → `Walkthroughs`** | Step rail + play-through of confirmed workflows (plain-English steps). |
| **⌘K search** | Products, journeys, business functions, schedulers, AI/calls — with starter suggestions. |
| **Markdown source of truth** | `.cursor/systems/call-taxonomy.md` · `call-architecture.md` · `ai-prompting-map.md` · each `projects/<name>/call-architecture.md` + `ai-prompting.md` |
| **UI data mirror** | `src/lib/ecosystem/intelligence.js` (must stay aligned with `.cursor/` — never invent edges). |

## This repo

SvelteKit 5 + adapter-static → Amplify `d3w0s20ak7lflk` · GHA zip ·  
https://main.d3w0s20ak7lflk.amplifyapp.com
