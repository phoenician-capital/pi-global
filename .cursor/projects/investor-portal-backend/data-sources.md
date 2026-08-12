# Data — Investor Portal (v2)

## Entities
User, UserEmail, RefreshToken, KnownLoginFingerprint, Fund, Account, AccountUser, Kyc*, DocumentFolder/Document/Version, DeletedDocumentArchive, PortfolioCompany(+Video), Notification*, ClientRequest, InvestorForm*, TradeEntry, ContractNoteTransaction, StrategyShareLink, AuditLog.

## Stores
| Store | Name |
|-------|------|
| S3 clean | `phoenician-capital-documents` |
| S3 quarantine | `phoenician-capital-quarantine` |
| S3 strategy | `phoenician-capital-strategy` (`custom/book.json`, …) |
| S3 web | `phoenician-capital-invest-portal` |
| Dynamo | `phoenician-capital-strategy-book` / book id `johns-portfolio` |
| Graph | `ir@phoeniciancapital.com` |
| FMP secret | `phoenician-ai-api-keys` field `FMP_KEY` |
