# capiq-downloader (final pass)

| fact | value |
|------|------|
| Artefacts / company | **43** (`financials`/Key Stats always last) |
| CLI | `capiq-downloader` → `download` \| `download-book` \| `status` |
| Multi-account | `CAPIQ_USERNAME/PASSWORD` + `_2`…`_N`; `--accounts 1-10` / `2,4`; `CAPIQ_DEFAULT_ACCOUNTS` |
| Pool stagger | `CAPIQ_POOL_STAGGER_S` default **4s** |
| Max parallel | `CAPIQ_MAX_PARALLEL` default **5** |
| Local cache | `.data/capiq/companies/<safe_stem>/` + `manifest.json` |
| Strategy S3 | `s3://$STRATEGY_S3_BUCKET/inputs/capiq/companies/<stem>/` |
