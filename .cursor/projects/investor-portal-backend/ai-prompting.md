# AI — Investor Portal

Admin-only OpenAI `https://api.openai.com/v1/chat/completions`. Not used on investor-facing read paths for portfolio decisions.

## Models

| Model | Used by |
|-------|---------|
| **gpt-4o-mini** | `OpenAiNameExtractor`, `OpenAiStatementSegmenter`, `OpenAiAnnualReportYearExtractor`, `OpenAiSubscriptionDateExtractor`, `OpenAiContractNoteTypeVerifier` (text mode), rename/verify admin flows |
| **gpt-4o** | Vision / amount extraction paths on transactions (`OpenAiContractNoteExtractor` and related) |

## Service → job

| Class | Job |
|-------|-----|
| `OpenAiNameExtractor` | AI rename for statements / annual reports / subscriptions |
| `OpenAiStatementSegmenter` | Split multi-statement PDFs |
| `OpenAiAnnualReportYearExtractor` | Year from annual report |
| `OpenAiSubscriptionDateExtractor` | Subscription date; text-first then PDF-as-base64 vision fallback; JSON `response_format` |
| `OpenAiContractNoteExtractor` | Route/extract contract notes (amounts) |
| `OpenAiContractNoteTypeVerifier` | Verify note type; text then vision fallback |

Client friction password before destructive AI is **UX only**, not a security boundary.

See `features-inventory.md` (full Infrastructure service list), `tools.md` (statement-split CLIs), `naming.md`.
