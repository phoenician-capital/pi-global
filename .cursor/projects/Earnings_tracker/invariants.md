# Invariants — Earnings_tracker

1. Postgres SoT.  
2. Distributed locks prevent concurrent full runs / same-ticker rescrapes.  
3. Summary search only keeps results **after** event date.  
4. API shares tracker scrape logic (single copy).  
5. Not CapIQ Playwright / not portfolio earnings pane.
