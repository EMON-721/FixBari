# FixBari customer sign-up without Google

## Customer flow
1. Open /register on the customer site.
2. Enter first name, last name, email address, Bangladeshi mobile (01XXXXXXXXX or +8801XXXXXXXXX), password, confirm password and accept Terms/Privacy.
3. Server normalizes email to lowercase and stores the mobile number in +880 format. Names and passwords are validated server-side. Passwords are hashed, never returned.
4. The Auth backend persists a CUSTOMER account and a permanent, automatically generated numeric account number. Customer-facing format: FB-000001, FB-000002, etc. The original UUID is retained as the internal primary key.
5. Successful registration starts an authenticated customer session. When not returning to an in-progress booking, the customer is taken to Profile to see the new Customer ID.
6. Future login uses **email and password**. Mobile is required contact information, not yet an enabled mobile-password login identifier. Service address remains editable in Profile and is collected during Booking.

## Security and database
- The Prisma `AuthUser.customerNumber` uses a database sequence; a migration backfills existing users with unique numeric IDs and assigns new IDs automatically.
- IDs are **public account references, never authentication secrets**. Possession of an ID never authorizes access to another customer's records.
- Customer signup cannot grant ADMIN permissions. Admin login and 2FA remain separate.
- Registration/login endpoints are rate-limited. Client and backend enforce mobile format; password must have at least 8 characters, including uppercase, lowercase and digit.
- Existing Google backend integration is retained for possible legacy integrations, but the FixBari customer login UI no longer shows Google.
- The current system can create accounts immediately without Google or OTP; therefore new email/mobile details are not verified simply by signup. SMS/email verification, anti-bot protection and reset-email delivery require an actual provider before public production onboarding.

## Deployment gate
These changes require deploying the Auth backend with its PostgreSQL database and applying `prisma migrate deploy`, then deploying the customer frontend with a valid HTTPS `API_GATEWAY_ORIGIN` that serves /api/auth, /api/services and /api/orders. A Vercel frontend-only READY status does not establish that signup or booking works.

## Validate
1. Submit valid registration; verify the response includes a customerNumber, role CUSTOMER and no password hash.
2. Reload /dashboard/profile and confirm the formatted Customer ID matches the database-generated number.
3. Check the user can log out, sign back in with email/password and see the same Customer ID.
4. Reject duplicate emails, invalid or absent mobile, weak password, and malicious role=ADMIN requests.
5. Check customer cannot access admin pages/APIs or anyone else's bookings.
6. Validate bookings use COD with PENDING payment status.
