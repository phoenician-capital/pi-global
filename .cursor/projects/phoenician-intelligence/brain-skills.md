# DD Brain / skills (final pass)

## 27 role skills (`skills/registry.py`)
`pc-decision-record`, `pc-memory-librarian`, `pc-agentic-query-generator`, `pc-principal-lens`, `pc-evidence-citer`, `pc-dd-lead-analyst`, `pc-business-model-analyst`, `pc-financials-analyst`, `pc-market-analyst`, `pc-management-analyst`, `pc-valuation-analyst`, `pc-assumption-critic`, `pc-unit-economics-analyst`, `pc-three-statement-analyst`, `pc-wacc-reviewer`, `pc-constraint-guidance-analyst`, `pc-dd-challenger`, `pc-thesis-challenger`, `pc-red-team-analyst`, `pc-red-flag-detector`, `pc-independent-risk-auditor`, `pc-competitive-analyst`, `pc-competitor-deep-diver`, `pc-tam-analyst`, `pc-customer-journey-analyst`, `pc-channel-economics-analyst`, `pc-correction-learner`

## Mine / approve
| fact | value |
|------|------|
| Trigger | on-demand `POST /api/brain/mine` (**no cron**) |
| Parallel | `BRAIN_MINE_PARALLEL` default **10**; single-flight; stale after **45m** |
| .NET upsert status | stored as **`approved`** (“generation trusted”) |
| Approve API | `PUT /api/brain/playbooks/{id}/approve` → compile domain `SKILL.md`; also reject / UpdateContent / regenerate→mine |
| Skills admin | `POST /api/skills/{reload,calibrate,update}` needs `X-Admin-Key` / `SKILLS_ADMIN_KEY` (503 if unset) |
| Prompt Lab path | `POST /api/prompt-lab/approve-section` → `source=prompt_lab_approved` calibrates `pc-correction-learner` |
