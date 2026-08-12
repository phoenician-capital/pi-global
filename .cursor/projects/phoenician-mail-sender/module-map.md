# Module map — phoenician-mail-sender

Loopback / Graph mail tool; twin pattern with portal `/api/ir-mail` (different auth & hosting).

## Backend (`backend/*.py`)

| Module | Purpose |
|--------|---------|
| `attachments.py` | Temp PDF attachment store with TTL cleanup |
| `campaigns.py` | In-flight campaign cancel registry + durable CSV audit logs |
| `config.py` | Settings from env/.env (auth mode, Graph creds) |
| `excel_parser.py` | Parse Excel recipient lists → firstName/email |
| `graph.py` | Microsoft Graph auth + sendMail (client_credentials preferred; ROPC gated) |
| `main.py` | FastAPI: health, parse-excel, upload-attachment, test-send, send-stream SSE, cancel |
| `models.py` | Pydantic request/response models |
| `security.py` | API key auth, headers, HTML escape, upload sniffing |
| `sse.py` | SSE event framing helpers |

## Frontend (`frontend/src/components/mail/`)

`AttachmentUploader`, `EmailComposer`, `RecipientUploader`, `SendProgressPanel`

Limits / Excel layout: `tiny-logic.md`, `http-status.md`, `excel-layout.md`.
