# Deploy — PI .NET (v2)

| Item | Value |
|------|-------|
| Workflow | `.github/workflows/deploy.yml` |
| Artifact | `s3://elasticbeanstalk-eu-north-1-578736536410/phoenician-api-prod/backend-deploy.zip` |
| Domain | `https://api.phoeniciancapital.com` |
| Logs | `/aws/elasticbeanstalk/phoenician-api-prod` |
| Postdeploy | `.platform/hooks/postdeploy/01_mount_efs.sh` (**must be +x**) |
| Docs | `AWS-DEPLOYMENT.md`, `docs/AWS_DEPLOYMENT_GUIDE.md`, `SECURITY.md`, WAF/DCF docs |

**Invariant:** Unix zip paths (Windows Compress-Archive breaks Linux EB).
