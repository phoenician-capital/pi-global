# Deploy — capiq-screen-agent

| Item | Value |
|------|-------|
| Region | `eu-north-1` |
| Instance | `i-0ef36803457fc6db4` t4g.small ARM |
| EIP | `13.62.39.214` |
| HTTPS | `https://13-62-39-214.sslip.io` (Let’s Encrypt) |
| SG | `sg-0a14cd762ae4c1d98` (:3001 world; SSH whitelist) |
| Process | systemd → PM2 (`backend/ecosystem.aws.config.cjs`) |
| Cron | 20:00 UTC mind refresh; 20:30 UTC `nightly-dream.mjs` |
| Backup S3 | `BACKUP_BUCKET` / `BACKUP_REGION` (setup mentions `capiq-agent-backups-jk`); retention default 14d |
| CapIQ dump S3 | `phoenician-capital-capiq-data` via download configs |
| Tunnel | cloudflared → `:3001` for CapIQ HTTPS / rotating trycloudflare |

## `aws/*.config.js` meaning

| Pattern | Role |
|---------|------|
| `*-download.config.js` | PM2 one-shots: `uv run phoenician-capiq download` for universe slices + ingest watchers |
| `*-retry.config.js` | Retry variants |
| `us-screen-final2.config.js` | Further download pass |
| Ops Python/SQL | Inspect/seed/watch — not Express runtime |

Source of truth: `aws/DEPLOYMENT.md`.
