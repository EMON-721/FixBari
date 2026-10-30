# FixBari — Build and test verification

**Date:** 2026-10-30  
**Owner:** Md. Emon Hossain  
**Repository:** https://github.com/EMON-721/FixBari

## GitHub Actions verification

**Run [41086311513](https://github.com/EMON-721/FixBari/actions/runs/41086311513): 4 of 4 jobs passed.**

- **Full build:** pnpm workspace dependency installation, Prisma client generation, production Next.js/TypeScript app and service builds.
- **Database:** PostgreSQL 16, Prisma migration deployment and status, Django migration and four Django mock-gateway payment security tests.
- **Security unit checks:** Google ID token cryptographic verification (issuer, audience, signature, expiry, tampering and verified email) and five rule-based repair cost estimator assertions.
- **Browser:** Chromium E2E on the interactive offline preview: 24-service catalog, booking, quotation, estimate, technician job completion, customer acceptance and admin approval.
- **Docker:** Docker Compose configuration is syntactically valid with sample environment placeholders.

Original source modules, older SRS material, preview and the 54 V1/V2 feature proposals remain in the repository.

## Scope and boundaries

The build and database migration checks are real CI results; they do **not** mean a public website is deployed. The browser E2E tests the local interactive preview, not a fully connected hosted backend. Google OAuth needs a live authorized Google Cloud client and domain to validate user sign-in end-to-end. Payment security tests use a mocked SSLCOMMERZ response, not a real gateway charge, settlement or refund.

Production credentials, SMTP/SMS delivery, KYC identity verification, photo AI, full cloud integrations and the remaining V1/V2 proposals require further implementation or live environment verification. See `KNOWN_GAPS.md`, `RELEASE_CHECKLIST.md` and `PAYMENT_SETUP_AND_VERIFICATION.md`.
