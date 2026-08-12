# CapIQ postMessage contract (v4)

## Inbound (`PI_REQUEST_TICKER`)
```
{ type: "PI_REQUEST_TICKER", payload: { ticker, companyName, rationale?, priority?: "normal"|"high" } }
```
- Origin must match `getCapiqEmbedOrigin()`
- Listener **disabled** for readonly CapIQ emails

## Outbound (`PI_REQUEST_TICKER_RESULT`)
- ok: `{ type, ok:true, requestId, ticker, reportUrl }`
- err: `{ ok:false, error: "not_authenticated" | message }`

No other `PI_*` message types found.
