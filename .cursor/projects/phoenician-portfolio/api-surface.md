# API — pm-serve (v2)

| Method | Path |
|--------|------|
| GET | `/`, `/api/health`, `/api/universe` |
| GET | `/api/universe-book/{state,status,stage0,performance,cost}` |
| GET | `/api/custom/{state,performance,inception,cost}` |
| GET | `/api/compare`, `/api/compare/intraday?range=1d|5d` |
| GET | `/api/trades?book=john|universe` (**required**; `ai`→410) |
| GET | `/api/holdings/trailing-overview?book=john|universe|all` |
| GET | `/api/lessons*`, `/api/insiders*`, `/api/earnings/*`, `/api/technical-trader/*` |
| GET | `/api/debate/{status,bootstrap,chats,thread,cost,ask/job}` — bare `/api/debate` → **404** |
| POST | `/api/universe-book/run`, `/api/custom/{research,book,preview-execution}`, `/api/universe/selection` |
| POST | `/api/book-notional` (**no-op $250M**), lessons/insiders/earnings/TT/debate actions |

**410 retired:** `/api/state|performance|status|cost`, `POST /api/strategy/*`, `book=ai`.  
**404:** `/api/research/*`.  
Authority: `.cursor/kb/07-api-surface.md` when local tree present.
