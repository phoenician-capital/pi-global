# Invariants — Linker

1. Never xlrd→xlwt round-trip for `.xls` (destroys drawings) — use BIFF patcher.  
2. One active pipeline job.  
3. Cache append-only.  
4. `/healthz` public; else PI JWT.  
5. CF CachingDisabled + AllViewer for cookies.
