# Edge cases — Linker (v4)

- Flask: 404 unknown_job · 500 accounts · 401 not authenticated (JSON) or login redirect
- Host prune cron: `/etc/cron.hourly/capiq-linker-prune` (backup to in-app hourly)
- Soft-302 without CloudFront `X-Origin-Auth`
