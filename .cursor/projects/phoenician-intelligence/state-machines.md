# State machines — phoenician-intelligence

Report lifecycle: submit → progress.json sections → callback to .NET → FE poll/cache.

| Machine | Where |
|---------|-------|
| Section generation order / deps | [`section-map.md`](./section-map.md) |
| H2H stages 0 → 0.5 → Tier1/2 → 5 | `section-map.md` |
| Risk auditor steps 1–8 | `section-map.md` |
| Prefetch Phase1 sequential CapIQ / Phase2 workers=8 | [`prefetch.md`](./prefetch.md) |
| Job cancel / stuck ECS | `tiny-logic.md`, `edge-cases.md`, `api/ecs_task_protection.py` |
