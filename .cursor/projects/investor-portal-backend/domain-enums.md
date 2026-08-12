# Domain enums — investor-portal-backend

Source: `backend/PhoenicianCapital.Domain/Enums/`.

## `DocumentCategory`

`Statements`, `FundDocuments`, `Policies`, `Letters`, `PortfolioCompanies`, `WiringInstructions`, `KycDocuments`, `TaxDocuments`, `ContractNotes`

## `FieldType`

`Text`, `Email`, `Phone`, `Date`, `Number`, `Select`, `Textarea`, `File`

## `FundType`

`Offshore`, `OffshoreMaster`

## `InvestorFormFieldType`

`Text`, `Date`, `Number`, `Checkbox`, `Select`, `Textarea`, `Signature`

## `KycDocStatus`

`Required`, `Uploaded`, `UnderReview`, `Approved`, `Rejected`, `Expired`

## `KycStatus`

`NotStarted`, `Pending`, `Approved`, `Rejected`, `MoreInfoRequired`

## `RequestStatus`

`AwaitingSignature`, `Pending`, `Approved`, `Rejected`

## `UserRole`

`Admin`, `Investor`

Do not confuse with PI backend roles (`INVESTOR` / `CLIENT` / `DEVELOPER`).
