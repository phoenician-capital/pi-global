# Data flows (v2)

## 1. DD report (PI)

```
PI SPA → .NET ticker request (RDS)
  → Python /api/reports/generate → subprocess(SUBPROCESS_*)
      → CapIQ/AlphaSense/PDF/reviews → EFS raw_data/
      → Vertex/Gemini/AlphaSense RAG (~142 jinja prompts)
      → sections [2,3,4,5,6,7,8,9,10,12,1,11] + UE-DCF
      → EFS companies/{ticker}/ → callback .NET → SSE/SPA
```

## 2. Portfolio books

```
PI /api/internal/universe (+ DD/risk/DCF)
  → Stages 0–6 → S3 books/universe/** + custom/*
  → replay sells-first → Redis tips → pm-serve → Amplify SPA
```

Advisory side-channels (never ER/weights): earnings_predictor, CapIQ downloader, insiders, TT, debate, lessons.

## 3. CapIQ link injection

```
Screening upload → Linker Flask → Playwright companyId → BIFF/xlsx → download
Auth: pi_auth from PI login · CF Origin-Auth
```

## 4. Earnings calendar

```
EventBridge weekly → Lambda → Postgres
Hourly summary trigger → ECS API Playwright tier
React CF SPA ↔ FastAPI
```

## 5. Investor docs

```
Admin upload → S3 quarantine → (optional) scan → clean bucket → Postgres meta
  → investor web/mobile presigned (300s) · DocuSeal e-sign
```

## 6. Strategy book → portal

```
S3 phoenician-capital-strategy/custom/book.json
  → Lambda → Dynamo phoenician-capital-strategy-book (johns-portfolio)
  → /api/strategy-book/top5 + factsheet share links
```

## 7. IR mail

```
Local: Excel+TipTap → mail-sender → Graph
Prod:  Admin IrMail → /api/ir-mail → Graph (no parse-excel on portal)
```

## Vendor consumers

| Vendor | Who |
|--------|-----|
| CapIQ | PI Python, Linker, Screen agent, portfolio capiq-downloader |
| Vertex/Gemini | PI RAG |
| Anthropic | PI DD, Portfolio stages, Linker CLI |
| DeepSeek | PI cheap, Earnings_tracker, optional Portfolio |
| FMP | Portfolio, PI FE, Factsheet, Portal |
| Graph | Portal IrMail + mail-sender |
| OpenAI | Portal AI rename; PI TTS |
