# Password policy — Portal (v4)

| rule | value |
|------|------:|
| bcrypt cost | **12** |
| HIBP | k-anon SHA1 prefix-5 → pwnedpasswords.com |
| HIBP fail mode | **fail-open** (allow if API down) |
| min / max length | **12** / **128** |
| charset | upper + lower + digit + special |
| OTP pattern | `^\d{6}$` |
