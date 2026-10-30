# FixBari — GitHub handoff and deployment preparation

This repository is the requested source-code deliverable. The source has been pushed to `EMON-721/FixBari` on GitHub. Hosting and production configuration remain with the owner.

## Owner and public naming

- Public product: **FixBari**
- Owner: **Md. Emon Hossain**
- Suggested repository name: `FixBari`
- Retain existing `@local-services/*` npm workspace identifiers, internal Docker service names and legacy migration identifiers. They are technical identifiers, not website branding; changing them unnecessarily risks broken imports.

## Repository publishing checklist

1. Use the existing `EMON-721/FixBari` GitHub repository on the `main` branch.
2. Before committing, check `.gitignore` and scan your staged files for `.env`, `.pem`, private keys, exported databases and personal customer information. Only example environment templates belong in git.
3. Copy `.env.example` to a local `.env` file **outside git**. Replace placeholders with independently generated secrets and provider credentials; do not reuse the prior project's hosted Railway endpoints.
4. Configure your own API gateway / frontend URLs. `API_GATEWAY_ORIGIN` is read by the Next.js configuration; in container setups requests to `/api` are routed by Traefik.
5. Provision PostgreSQL and RabbitMQ. Build Prisma clients and apply `packages/database/prisma/migrations/` migrations including the new technician verification migration.
6. Build each frontend and backend; start all services, then verify auth, role permissions, service discovery, booking, assigned-job transitions, request/quote workflow and notification delivery.
7. Obtain approved SSLCOMMERZ sandbox credentials and perform successful, failed, cancelled, duplicate IPN and mismatched-amount tests. **Do not enable live payments on the strength of an HTML preview.**
8. Configure your own SMTP/SMS credentials only when ready. Validate service identity, token expiration/rotation, and account-disable behavior.
9. Check responsive layouts and accessibility; monitor errors and back up the database.

## Important service notes

- The preview at `apps/web/public/preview/` uses browser localStorage and **is not connected to production accounts**.
- Payment/refund operations require live gateway verification; refunds stay pending until confirmed by an actual provider.
- The current repair estimator is **rule based**, not trained machine learning.
- Technician approval status is controlled by Admin, but actual ID verification/certificate checks require an operational workflow and secure document storage.
- The historical SRS and feature ledger preserve requirements; items marked planned are not shipped features.
- No public preview URL was generated, by request.

## Smoke-test instructions

A normal smoke-test sequence in your own infrastructure: register a customer → browse services → create booking → register technician → approve technician as Admin → assign a job → accept/start/complete work → check booking and analytics → create a quotation → submit a verified technician offer → select offer → verify request status. Test all roles with separate accounts.
