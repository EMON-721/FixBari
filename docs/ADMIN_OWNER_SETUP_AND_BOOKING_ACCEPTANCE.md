# FixBari — Admin owner setup and customer booking acceptance checklist

## Important: no preset admin credentials
There is no safe universal or hardcoded admin password. The owner supplies an email address to the trusted deployment operator **through a private channel**, not a public GitHub issue or repository file. A privileged account must be explicitly provisioned in the backend as `ADMIN` and verified as active. Public sign-up must always create `CUSTOMER`, never `ADMIN`.

An operator should create the first admin using an audited, one-time, environment-restricted bootstrap or a protected database administration procedure. The bootstrap must reject an already configured owner, must not log credentials or temporary reset tokens, and must be disabled after setup. Do not put passwords, password hashes, admin email allowlists that bypass authorization, or seed credentials into Git.

## Owner's first login
1. Open the separately deployed **Admin** application and choose Sign in. The admin app is an independent Next.js app (`apps/admin`, development port 3010), not a special user-facing customer registration page.
2. Enter the email address associated with a provisioned `ADMIN` account.
3. Set an initial password using a **single-use, expiring** invitation/password setup flow delivered through verified private email. If SMTP or this provisioning flow is not configured, do not claim that self-service onboarding works.
4. Log in with that password. If MFA is enabled, enter the current 6-digit authenticator code. Enroll MFA through authenticated setup and confirmation and retain recovery procedures in a secure private location.
5. Confirm `GET /api/auth/me` identifies the current user as an active `ADMIN`; confirm a customer or technician cannot open any admin data or mutation API.

**Security note:** The repository currently uses client-side token storage and cookie synchronization. A production launch should replace browser-readable long-lived credentials with a hardened HttpOnly/Secure/SameSite session design, plus server-side permission checks, request forgery protection where applicable, expiry, rotation and revocation. Validate 2FA at the actual login/session boundary.

## Admin functions: verification matrix
- Catalog: add/update/deactivate categories, services, approved prices and descriptions; validate server-side permissions.
- Bookings: review new orders, assign approved technicians, track state history, cancel with reason, inspect customer-owned data only as needed.
- Users: view minimally necessary account directory, suspend/reactivate users, protect own and last-owner accounts; audit changes.
- Technicians: manage application, verification, availability and approved assignments.
- Requests and quotations: triage customer requests, compare technician offers, maintain an auditable status timeline.
- Payments: only show verified gateway settlements; never mark unpaid transactions paid based on a return URL; refunds remain pending until provider confirmation.
- Admin management: invite authorized admin users with granular permissions, 2FA and audit logs. The database currently has only `CUSTOMER`, `TECHNICIAN`, `ADMIN` roles, so granular admin-to-admin permissions must not be claimed without a separate implementation.
- Settings and CMS: server-backed changes only, explicit input validation, image/file access authorization and change history.
- Dashboard: analytics based on real orders and reconciled money, not preview/example figures.

## Customer-to-booking acceptance test
1. Create a new CUSTOMER with normal signup. Check duplicate email, invalid fields and password handling.
2. Sign in, sign out, reload, refresh expired tokens and reset a forgotten password. Test Google sign-in only after actual OAuth setup.
3. Browse categories and view the actual selected service details, inclusions, availability, indicative price, and quotation requirements.
4. Choose date, time, service address and package; submit a booking exactly once. Validate errors and prevent duplicated submissions.
5. Receive a persistent booking ID **only after the orders service confirms it**. Verify customer sees the same order after refresh and a second login.
6. For COD, keep payment pending until cash is actually collected and reconciled. For online payment, start a real sandbox session and verify callback authenticity, amount, transaction ID and currency.
7. Verify admin can view and assign the order only to an approved technician. Technician can see only assigned jobs.
8. Verify customer, technician and admin see consistent state transitions, cancellation, completion, receipts and support/dispute information. Refunds require provider reconciliation.
9. Confirm non-admin access to every admin page and API returns 401/403. Test direct API calls, not merely hidden buttons.
10. Repeat on mobile and desktop, including slow network, interrupted requests, duplicate clicks and stale sessions.

## Known launch blockers (do not mark as completed based on UI alone)
The repository's known-gaps documentation records incomplete production 2FA, SMTP/provider configuration, live OAuth, payment sandbox verification, fully integrated V1/V2 screens, and authenticated cross-service browser tests. The offline preview is localStorage-based, **not** proof of live bookings or payments.

Source references: `README.md`, `docs/KNOWN_GAPS.md`, `docs/FEATURE_IMPLEMENTATION_MATRIX.md`, `services/auth/src/modules/auth/auth.controller.ts`, `apps/admin/src/contexts/auth-context.tsx`.
