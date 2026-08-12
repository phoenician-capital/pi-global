# Deploy — Investor Portal

Workflows: `deploy-backend.yml` (OIDC→ECR/ECS), `deploy-admin-portal.yml` (Node20→S3+CF).  
TF modules: vpc, security, rds, s3, alb, ecs, waf, monitoring, malware-scanner.  
Region eu-north-1. App Store id `6770306049`.
