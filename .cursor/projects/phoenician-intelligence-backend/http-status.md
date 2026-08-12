# HTTP status — PI .NET (v4)

| code | when |
|-----:|------|
| 400 | universe q <2 or >80; invite bad role |
| 401 | OTP/password fail; message body |
| 403 | suspended/unverified; invite Forbid; S3 key outside `ticker-requests/{id}/` |
| 409 | company notes reorder conflict |
| 429 | OtpRateLimitException path (limiter currently disabled) |
| 503 | BrainPlaybooks if PythonApi:BaseUrl missing |
