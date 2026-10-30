# FixBari

**FixBari** is a Bangladesh-focused home and local services booking and management platform.  
**Owner / Project Lead:** Md. Emon Hossain.

Customers can browse cleaning, electrical, plumbing, repair, painting and transport services, make bookings, request quotations and submit service support requests. Technicians manage jobs, their working schedule and quotation submissions. Administrators oversee service listings, booking assignments, customers, technicians, verification reviews and support requests.

## Applications and architecture

| Application | Role | Main responsibilities |
|---|---|---|
| `apps/web` | Customer | Service search, booking, estimates, quotations, history and support requests |
| `apps/admin` | Admin | Bookings, customers, catalog, verification decisions and request triage |
| `apps/technician` | Technician | Assigned jobs, schedule, profile, earning estimates and quotation offers |

Built as a monorepo with three **Next.js** frontends and five backend services: NestJS Auth, Express Orders, NestJS Services, Django Payments and FastAPI Notifications. PostgreSQL + Prisma store most records, RabbitMQ connects events and Traefik is the container gateway. The original internal `@local-services/*` workspace package identifiers are retained for compatibility; the public product name is **FixBari**.

## Design

Responsive customer storefront with a neutral/amber accent; management sidebars and forms for different roles. The original Figma reference remains in `docs/SRS.md`. The current public site includes clear ownership information and avoids presenting sample statistics as real company achievements.

## Features

Core service categories, booking lifecycle, technician job stages, payment integration foundation, quotation proposals, service request triage, rule-based repair cost estimates and technician verification are supported by the source. A self-contained browser demonstration is provided at `apps/web/public/preview/index.html`; this uses demo data and does not collect payment.

**All previously proposed V1 and V2 requirements remain in `docs/FEATURE_IMPLEMENTATION_MATRIX.md`.** Please use it to distinguish actual API/UI features from uncompleted integrations. Full ML-powered diagnosis, live SMS, payment settlement, KYC document providers and live external service tests are not represented as finished. Google customer login has a Google Identity Services frontend and a server-verified token endpoint; it requires matching Google Cloud client IDs at deployment.

## Before taking payments or releasing to customers

Use `docs/GITHUB_HANDOFF.md` and `docs/RELEASE_CHECKLIST.md`. Configure your own database, queue, secrets, approved payment credentials and gateway URLs. Run migrations, build and test each service. Nothing has been hosted or pushed to GitHub by this package. Never commit an actual `.env` file or user data.

## Ownership

**Md. Emon Hossain — Owner / Project Lead.** This ownership label does not replace original third-party licenses or claim authorship of earlier contributors. See `OWNER.md`.
