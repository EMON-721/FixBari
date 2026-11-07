# FixBari

**FixBari** is a Bangladesh-focused home and business service marketplace connecting customers with local professionals. **Owner / Project Lead:** Md. Emon Hossain.

## How the platform works

1. A customer browses a service category, selects a service, submits location and service details, and requests a booking or quotation.
2. The Orders API manages requests and service status; the catalog service provides available services and indicative prices.
3. Technicians see assigned jobs, manage availability, respond with quotations and update job progress.
4. Where configured, the payment backend starts an SSLCOMMERZ checkout and validates gateway callbacks server-side. Estimated prices are **illustrative**, not final technician quotations.

## Customer website — `apps/web`

This is the public-facing responsive service storefront. It supports discovery across home repairs, electrical, plumbing, cleaning, painting and transportation-related categories. Customers can view services and price indications, request or track bookings, submit quotation requests and compare offers, manage account/profile and property details, access support and view a rule-based repair estimate. Availability of individual actions depends on their API integration and feature status; demo-preview interactions are not necessarily persisted.

## Technician website — `apps/technician`

The technician workspace focuses on onboarding/profile details, assigned jobs, availability, offers and quotations, job progress/completion and the technician's view of earnings. Displayed payout or revenue-share figures must not be treated as settled payments until payment-provider reconciliation is integrated.

## Backend services and data

| Component | Responsibility |
|---|---|
| `services/auth` (NestJS) | Account registration, password/Google identity authentication, JWT access and refresh tokens, user profiles and protected account operations |
| `services/orders` (Express) | Bookings, quotation lifecycle and coordination with payment service |
| `services/catalog` (NestJS) | Service categories, service listings and catalog API |
| `services/payment` (Django) | SSLCOMMERZ checkout session and payment verification/callback logic |
| `services/notifications` (FastAPI) | Notification-service integration points |
| PostgreSQL + Prisma | Persistent user/order/catalog records and migration-managed schema |
| Django migrations | Payment service database schema |
| RabbitMQ | Asynchronous event coordination |
| Traefik | API routing in container deployment |
| Shared packages | Reusable React UI components and TypeScript types |

Internal `@local-services/*` package identifiers are retained for workspace compatibility.

## Security, privacy and payments

- Google ID credentials are verified cryptographically server-side. Live OAuth requires a configured Google Cloud client ID, authorized origins and an actual user sign-in test.
- Access tokens require active current user records. Production security review should cover cross-service authorization, revocation, session storage, logs and audit trails.
- The payment integration separates merchant credentials and server-only tokens from browser code. A sandbox or live SSLCOMMERZ transaction, IPN and refund must be validated with real merchant configuration before enabling checkout.
- Keep all secrets, merchant credentials and user data out of GitHub. Enforce least-privilege access, HTTPS and access logs in hosting.

## Verification and implementation status

Prior GitHub Actions [run 41086311513](https://github.com/emonhossain24/FixBari/actions/runs/41086311513) reported four passing jobs covering builds, Prisma/PostgreSQL and Django migrations, Google-token checks, mocked payment tests and a Chromium **offline-preview** browser journey. This is not proof of a production deployment, live OAuth, real card/wallet settlement, fully connected cross-service E2E, or completed security hardening. See the linked reports for the precise boundary. Later changes require a fresh passing CI run.

## Project documentation

- [Requirements and architecture](docs/SRS.md)
- [Feature implementation matrix](docs/FEATURE_IMPLEMENTATION_MATRIX.md)
- [Build and test verification](docs/VALIDATION_REPORT.md)
- [Known implementation gaps](docs/KNOWN_GAPS.md)
- [SSLCOMMERZ setup and verification](docs/PAYMENT_SETUP_AND_VERIFICATION.md)
- [Deployment handoff](docs/GITHUB_HANDOFF.md)

**FixBari — Local service, made simpler.**

## Website & repository links

- **Source repository:** https://github.com/emonhossain24/FixBari
- **Published website URL:** https://fix-bari.vercel.app

