# Edge cases — Mobile (v4)

| rule | detail |
|------|--------|
| Client email regex | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| Period parse | ISO `^(19|20)\d{2}-(\d{2})-\d{2}` · `Q[1-4]` · `quarter [1-4]` |
| Nested vs standalone | wipe@5+hash only in **nested** mobile-app; standalone plaintext PIN |
| Impersonation 401 | does not refresh under impersonation token |
