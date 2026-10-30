# FixBari

**Owner / Project Lead:** Md. Emon Hossain

FixBari is a Bangladesh-focused local-service booking platform for customers, technicians and administrators.

## Architecture
- Next.js customer, admin and technician applications
- NestJS Auth, Express Orders, NestJS Service Catalog, Django Payments and FastAPI Notifications
- PostgreSQL / Prisma, RabbitMQ and Traefik
- SSLCOMMERZ integration, customer requests, quotations, technician workflows and service management

## Verification

The verified-candidate source package and its CI workflow were prepared in ChatGPT. **This repository currently needs the complete monorepo source files before any CI checks can run.** Do not interpret this README as a deployed or production-verified application.

After importing all project files at the repository root, run the GitHub Actions workflow `FixBari CI — build, database and browser smoke`. The workflow checks dependency installation, monorepo build, PostgreSQL/Django migrations, offline browser E2E, and Google JWT cryptographic fixture tests.

Merchant credentials, actual Google Cloud OAuth client ID, SMTP/SMS settings, and any real user data must be supplied securely by the operator after deployment; never commit credentials.
