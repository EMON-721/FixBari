# FixBari — Production integration verification

Updated 2026-10-30. This document distinguishes code shipped from actual online verification.

## Deployment topology
Customer app deployed on Vercel. Admin and technician apps require separate deployments. Auth (NestJS), orders (Express), catalog (NestJS), Django payment service and notifications (FastAPI), PostgreSQL, and RabbitMQ must have reachable production endpoints. A Next.js frontend deployment does not start these persistent services.

## Backend and data
- Prisma migration includes the new admin_mfa table. Apply via `prisma migrate deploy` against the intended managed PostgreSQL instance, using a backed-up DB.
- Catalog seed `services/services/scripts/seed-data.ts` uses non-destructive upserts. It retains existing admin-managed catalog entries. The 24 original listings are inserted when missing; 16 new proposals are inserted inactive with price 0, requiring administrator pricing/activation. **Do not treat 0 as a free service**.
- Booking routes must resolve static catalog slugs to database UUIDs. A booking is real only after a persisted order is returned by the online API.
- Admin-to-admin status management is permitted for an authenticated admin; self-suspension is blocked. Test fixtures cover role restrictions.

## Authentication and sessions
- Google ID tokens use server signature, issuer and audience checks; a real browser sign-in on an authorized origin is still required.
- Refresh tokens are stored as SHA256 digests in AuthSession. Rotation invalidates the previous token; logout, password reset and account disable revoke refresh sessions. Access JWTs expire after 15 minutes; immediate access-JWT revocation is not yet implemented across all services.
- Admin TOTP uses AES-256-GCM encrypted secrets and RFC 6238 verification. Configure `ADMIN_2FA_ENCRYPTION_KEY` as a **private, persistent, random 32-byte hex key** in the Auth service. Never expose it through `NEXT_PUBLIC_*`. Apply the migration first.
- API enrollment: authenticated admin POST `/api/auth/admin/2fa/setup`, then confirm with POST `/api/auth/admin/2fa/confirm` containing `{ "code":"123456" }` (example placeholder only). Login POST `/api/auth/login` accepts `otpCode` for enrolled admins. **Admin Settings enrollment interface is still pending**, so enrollment is not complete end-to-end.
- Orders and catalog APIs can enforce MFA for admin JWTs when `REQUIRE_ADMIN_MFA=true`. This setting must only be enabled after administrator onboarding is working; other services and role revocation still require cross-service audit.

## Payments
- The SSLCOMMERZ Django service has mock tests. Real sandbox checkout, payment callback/IPN validation, server-side amount match, idempotency, refund API and live production settlement are **not verified**.
- Do not enable live checkout until merchant credentials, sandbox URLs, callback URLs, HTTPS, signing/validation and reconciliation have been checked with actual test transactions.
- No real transaction or refund was initiated in this code update.

## Verification gates
- GitHub Actions runs TypeScript apps build, Google-token tests, repair estimate tests, admin Jest permission/TOTP tests, PostgreSQL and Django migrations, Django payment tests, Docker Compose config and offline Chromium preview.
- CI success is not evidence of deployed backend connectivity or real payment settlement.
- Before claiming production ready, run a connected E2E journey against test accounts: login (including admin MFA), browse active services, quote/booking, assign verified technician, process sandbox payment and refund, check DB state, revoke sessions and verify permissions.
- Ensure backend URLs, JWT secret, DB URL, Google client ID, merchant keys, SMTP and messaging provider configuration exist in private environment settings and are never committed.

## Status
Production services and live provider credentials were not provided by these source code changes. Keep live OAuth, real payment/refunds, backend-connected E2E, cross-service session revocation, technician/provider validation, and admin onboarding marked pending until the corresponding online tests pass.
