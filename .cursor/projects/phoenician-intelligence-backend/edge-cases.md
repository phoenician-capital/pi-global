# Edge cases — PI .NET (v4)

- EB pending markers path quirk: `/app/companies/companies/.pending_updates` (**double `companies`**)
- S3 attachments: `ticker-requests/{requestId}/{guid}_{fileName}`
- Stale PROCESSING: >4h AND not in Python active; if Python down → **never** false-reset
- Activity monitor: exact emails, no DEVELOPER bypass
