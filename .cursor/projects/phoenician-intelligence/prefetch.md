# Prefetch pipeline (final pass)

| fact | value |
|------|------|
| Phase 1 | CapIQ Excel **sequential** (account pool) |
| Phase 2 | PDFs + Reviews via `ThreadPoolExecutor` |
| Workers | `--workers` / default **8** (Phase 2 only) |
| Sources | `--source all` / `pdfs` / `capiq` / `reviews`; `--sources` comma exact; `--watch-only`; `--reconcile` |
| Single ticker PDFs | auto-enables reviews unless `--sources` set |
| Watch seed batch | chunks of **200** |
