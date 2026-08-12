# Architecture — pi-global

```
src/routes (+layout ssr=false) → vite build → build/
GitHub Actions on main → npm ci/build → zip build/ → Amplify create/start-deployment
```

Future graph UI should consume `.cursor/systems/*` + `.cursor/projects/*/OVERVIEW.md` as the node/edge catalog.
