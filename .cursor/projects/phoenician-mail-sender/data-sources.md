# Data sources — phoenician-mail-sender

| Source | What |
|--------|------|
| Excel upload | Recipients: firstName + email (`excel_parser.py`) |
| PDF attachments | Temp store + magic-byte sniff (`attachments.py`) |
| Microsoft Graph | `sendMail` as IR mailbox |
| CSV audit logs | Under `logs/` via `campaigns.py` |

No CapIQ / PI / portal DB.
