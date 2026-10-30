# FixBari — Deployment and verification checklist

**Current stage:** Partial V1/V2 source update and interactive browser-only preview. No production readiness claim.

## Must configure privately

- PostgreSQL database and migrations; use strong `POSTGRES_PASSWORD`.
- RabbitMQ with protected management port and `RABBITMQ_PASSWORD`.
- `JWT_SECRET`, `DJANGO_SECRET_KEY` and `PAYMENT_INTERNAL_TOKEN` as backend-only secrets; never expose tokens in a `NEXT_PUBLIC_` environment variable.
- Auth and Orders services must share `JWT_SECRET`. Orders and Payment services must share `PAYMENT_INTERNAL_TOKEN`.
- SSLCOMMERZ sandbox credentials, payment base URL, site URL; verify payment callbacks, amount, currency, transaction ID, replay protection and refund settlement.
- SMTP host, account, secret and valid sender configured for actual email delivery.
- Domain/TLS, proper RBAC, user account verification, nondevelopment secret rotation and backups.

## Verification gates

1. Generate Prisma clients and apply the new expansion migration to a throwaway PostgreSQL database.
2. Build all three Next.js apps and services; resolve any TypeScript and package errors.
3. Run integration tests for customer/admin/technician login and access restrictions.
4. Validate booking, scheduling, quotes, emergency, technician assignment and evidence on real DB transactions.
5. Run SSLCOMMERZ sandbox payment success/fail/cancel/refund tests; verify no false completed status.
6. Connect real email and verify failure path; implement reliable SMS/Push when providers are selected.
7. Confirm service areas, technician verification processes, data privacy and permissions.
8. Run mobile UI, accessibility, backup restore, monitoring and vulnerability scans.
9. Deploy a preview environment before staging/production; record tested commit and release evidence.

## Local interactive preview

The static preview files are in `apps/web/public/preview`; the single-file deliverable `Local_Services_Interactive_Preview.html` can be opened directly in a browser. It saves demo records only in local storage; it does not use the actual backend. No payment credentials, NID data or customer secrets should be entered.
