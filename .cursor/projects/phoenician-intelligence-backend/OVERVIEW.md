# phoenician-intelligence-backend — .NET InvestorPlatform (v2)

**Local:** `phoenician-intelligence-backend/` · **TFM net8.0** · Live `https://api.phoeniciancapital.com`

**Role:** Auth/OTP, ticker-request lifecycle, Python report orchestration, screening/universe, SignalR notes, costs/vendor billing, brain playbooks, TTS, SSE.

## Stack
EF Core+Npgsql 8.0, JWT Bearer 8.0, AWS SDK CE/ECS/S3/SM 3.7.400, OpenAI 2.1, MailKit, BCrypt, FluentValidation, Serilog, Swashbuckle, YahooFinanceApi.

## Roles
`INVESTOR` · `CLIENT` (1 active request) · `DEVELOPER`

## Hosting
EB `phoenician-capital-api` / env **`phoenician-api-prod`** · PathBase `/api` · EFS mount postdeploy · RDS `investor_platform_db`
