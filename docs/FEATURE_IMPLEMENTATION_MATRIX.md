# FixBari — V1 and V2 feature inventory

This is an implementation ledger for the uploaded code plus the updated work. “Preview” means working **browser-only demonstration**, not deployed backend functionality. “Foundation” means a supporting authenticated database/API path exists; it does not imply end-to-end completion.

## Previous V1 improvements (all preserved)

| # | Feature | Current status |
|---:|---|---|
| 1 | Verified Technician System | Proposed / partial in original app |
| 2 | Location-Based Matching | Proposed / partial in original app |
| 3 | In-App Chat & Communication | Proposed / partial in original app |
| 4 | Smart Scheduling & Recurring Services | Proposed / partial in original app |
| 5 | Verified Reviews | Proposed / partial in original app |
| 6 | Billing, Commission & Payout | Proposed / partial in original app |
| 7 | Google Login / Email Verification | Proposed / partial in original app |
| 8 | Email/SMS/Push Notification | Proposed / partial in original app |
| 9 | Cancellation & Refund Policy | Proposed / partial in original app |
| 10 | Technician Job OTP Verification | Proposed / partial in original app |
| 11 | Before/After Work Photos | Proposed / partial in original app |
| 12 | Dispute Resolution & Support | Proposed / partial in original app |
| 13 | Service Warranty & Rework | Proposed / partial in original app |
| 14 | Bengali & English | Proposed / partial in original app |
| 15 | Coupons & Promotional Offers | Proposed / partial in original app |
| 16 | Subscription Maintenance Packages | Proposed / partial in original app |
| 17 | Favorite Technicians | Proposed / partial in original app |
| 18 | Smart Recommendations | Proposed / partial in original app |
| 19 | Business Bulk Booking | Proposed / partial in original app |
| 20 | Referral & Loyalty | Proposed / partial in original app |
| 21 | Admin CMS | Proposed / partial in original app |
| 22 | Revenue & Payout Reports | Proposed / partial in original app |
| 23 | Audit Logs & Fraud Monitoring | Proposed / partial in original app |
| 24 | Accessibility & SEO | Proposed / partial in original app |

## New V2 expansion (all 30 proposals preserved)

| # | Feature | Current status |
|---:|---|---|
| 1 | Emergency Service Booking | Preview demo + backend foundation |
| 2 | AI Photo-Based Problem Detection | Planned |
| 3 | Multiple Quotations | Preview demo + backend foundation |
| 4 | AI Repair Cost Estimator | Preview demo + backend foundation |
| 5 | Spare Parts & Materials | Planned |
| 6 | Smart Technician Replacement | Planned |
| 7 | Home & Appliance Profiles | Preview demo + backend foundation |
| 8 | Property Management | Preview demo + backend foundation |
| 9 | Family Booking Access | Planned |
| 10 | Service Bundle Builder | Planned |
| 11 | Waiting List System | Planned |
| 12 | Voice-Based Booking | Planned |
| 13 | Assisted Phone Booking | Planned |
| 14 | Technician Skill Assessment | Planned |
| 15 | Technician Team Jobs | Planned |
| 16 | Route Optimization | Planned |
| 17 | Digital Work Checklist | Preview demo |
| 18 | Customer Work Acceptance | Preview demo |
| 19 | Technician Safety SOS | Planned |
| 20 | Offline Technician Mode | Planned |
| 21 | Service Price Rules | Planned |
| 22 | SLA & Escalation Engine | Planned |
| 23 | Service Demand Forecasting | Planned |
| 24 | Quality Performance Score | Planned |
| 25 | Job Evidence Timeline | Preview demo |
| 26 | Weather-Sensitive Scheduling | Planned |
| 27 | Appliance QR Service Passport | Planned |
| 28 | Property Inspection Report | Backend request foundation |
| 29 | Supplier & Procurement Portal | Planned |
| 30 | Commercial Service Contracts | Backend request foundation |

## Improvements actually applied to the existing source

- Added `AdminRoleGuard` to mutation endpoints for catalog categories and services.
- Payment creation no longer automatically produces a success event or completed transaction.
- Gateway callbacks now reject mismatched amounts, transaction IDs and currencies before completing payments.
- Payment detail/list/initiate/refund endpoints require a backend-only internal service token.
- Refunds create pending requests instead of pretending money was returned.
- Public return-page status exposes only the verified payment status for a high-entropy transaction ID; the website no longer trusts URL parameters as payment proof.
- Notification service can send SMTP email when configured, and no longer marks undelivered messages as sent. SMS and push are unconfigured.
- Added Prisma models and SQL migration for expansion requests, events and technician quote offers.
- Added authenticated API routes for emergency/quote/support/property/appliance/inspection/contract request records, quote offers, administrative statuses and rule-based price estimates.
- Unified public app branding to FixBari, replaced old logo assets, removed fabricated marketing metrics and broken footer navigation entries.
- Added interactive static preview embedded in `apps/web/public/preview` and a Next.js navigation page.

## Not completed / needs integration

- Full auth-backed UI integration for all V1/V2 features; browser preview saves to local storage only.
- AI photo diagnosis, speech recognition, real ML cost prediction or demand forecasting require datasets, models, evaluations and hosted inference. The preview estimator is **rule-based**.
- Google OAuth, KYC, real location matching, job dispatch/SMS/Push, live chat, real payout/refund settlement, supplier APIs, production CMS and role-level privacy policies still need full integrations.
- SSLCOMMERZ sandbox merchant credentials and gateway transaction tests were not available.
- PostgreSQL migration, Docker startup, TypeScript build and end-to-end production testing remain unverified in this runtime.

## Feature preservation rule

Do not delete old V1/V2 requirements. Implement features with migrations, audited APIs, UIs and tests progressively; mark evidence for each item before changing its status to Production verified.

## FixBari update (2026-10-30)

- Product branding and public ownership updated to FixBari / Md. Emon Hossain.
- V3 existing modules, seed catalog, database entities, payment integration code, SRS and feature proposals retained.
- Added authenticated Customer request management UI and rule-based estimator UI at `/dashboard/requests`.
- Added Admin request triage UI at `/requests`, account directory at `/users` and technician approval UI at `/technicians`.
- Added Technician quote opportunity/offer UI, weekly availability editing, profile editing and calculated earning summary.
- Added explicit technician verification state to database migration; the order service checks approval before assigning jobs, and quote opportunities require approved technicians.
- Separated refresh/access tokens and removed default Express JWT secret.
- Removed prior hardcoded production API URLs from client/runtime routing; provided environment-driven setup.
- API credentials, payment merchant tests, hosted ML models, OAuth, remote proof-of-identity, live dispatch, SMS and full V1/V2 functional integration remain external or unfinished. This package does **not** claim all items are production-ready.

### Latest source notes

Customer profile editing, Admin account suspension/listing, technician verification, job-claim concurrency guard and typed repair estimator tests were added. New work is visible as code, **not** as proof of live operation. `docs/VALIDATION_REPORT.md` documents the checks and remaining dependencies.
