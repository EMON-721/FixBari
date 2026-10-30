# FixBari

**FixBari** is a Bangladesh-focused platform connecting customers with local service professionals for home and business needs.

**Owner / Project Lead:** Md. Emon Hossain.

## What FixBari does

Customers can discover home services, request bookings or quotations, manage their service history, submit support requests and view indicative repair estimates. Technicians manage assigned jobs, availability and quotation offers. Administrators oversee bookings, customers, professionals, catalog content, reviews and verification decisions.

The core catalog covers home repair, cleaning, electrical work, painting, plumbing and transport.

## Applications

| Application | Purpose |
|---|---|
| `apps/web` | Customer discovery, bookings, quotations, property details and support |
| `apps/admin` | Service listings, bookings, users, technician verification and request oversight |
| `apps/technician` | Assigned jobs, availability, profile and quotations |

## Architecture

FixBari is a monorepo with three Next.js/React frontend apps and five backend services: NestJS Authentication, Express Orders, NestJS Service Catalog, Django Payments and FastAPI Notifications. PostgreSQL/Prisma provides data persistence, RabbitMQ handles events, and Traefik routes API traffic. Shared packages contain UI components and types. Existing internal `@local-services/*` package identifiers remain for compatibility.

## Design

Responsive service storefront and management dashboards, reusable form and card components, amber accents and service-focused navigation. The original Figma reference and architecture documentation are retained.

## Documentation

- [System requirements and architecture](docs/SRS.md)
- [Feature catalog and implementation matrix](docs/FEATURE_IMPLEMENTATION_MATRIX.md)
- [Payment architecture and setup](docs/PAYMENT_SETUP_AND_VERIFICATION.md)
- [Verification report](docs/VALIDATION_REPORT.md)
- [Deployment handoff](docs/GITHUB_HANDOFF.md)

**FixBari — Local service, made simpler.**
