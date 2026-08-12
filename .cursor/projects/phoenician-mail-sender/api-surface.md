# API — Mail sender

| Method | Path |
|--------|------|
| GET | `/health` (no key) |
| POST | `/api/mail/parse-excel` |
| POST | `/api/mail/upload-attachment` |
| POST | `/api/mail/test-send` |
| POST | `/api/mail/send-stream` (SSE) |
| POST | `/api/mail/cancel/{campaign_id}` |

**Parity note:** portal IrMail has no `parse-excel` (recipients handled in admin UI).
