# FixBari COD-only customer + admin rollout

## Implemented code changes
- The customer storefront and booking form show Cash on Delivery (COD) only. The orders backend rejects any new non-COD booking at its API boundary; no SSLCOMMERZ initiation runs for accepted COD bookings.
- A successful booking screen requires a server-issued booking ID, calls the order pending rather than already confirmed, and links to the user's actual booking details.
- Customers who start booking before signing in can return to the same booking URL after login, registration or configured Google sign-in. The public signup explicitly creates a CUSTOMER account; technician onboarding is separate.
- The public service index merges existing static offerings with active database services and uses admin-approved live prices. If the backend is unreachable it still shows the catalog, but never labels static entries as immediately bookable.
- Original Local Services Admin navigation and existing service CRUD/booking workflows remain present. The new Requests page allows admin search, filtering, full payload inspection, quotation inspection and controlled status transitions.
- The new **Import FixBari additional services** button in Admin > Services imports missing entries from the 10-category/40-service catalog. It is idempotent with respect to category+slug and preserves existing catalog prices/statuses.
- Imported services are **inactive by default**, for explicit price and availability review by the admin. Of the 40 catalog entries, 24 have illustrative prices and 16 still need formal quotes. Unpriced offerings direct customers to authenticated quotation requests instead of a fictitious paid booking.

## Steps required to make the changes operational
1. Deploy all relevant frontends and their matching Auth, Catalog, Orders services with correctly configured API gateway routes, database, migrations, and secret environment variables. A successful frontend build is not proof that those backend services run.
2. Sign in using a properly provisioned ADMIN account at the separately deployed admin application.
3. Go to Admin > Services > **Import FixBari additional services** once. The button is an explicit operator action; source-code commits do **not** mutate your production catalog.
4. Review newly imported descriptions, base prices, duration, availability and service area. Activate only services with approved positive prices. Keep unpriced entries in quotation workflow.
5. Confirm the customer website displays approved services with current live prices. Check a new account's signup, login, logout, session expiry, password reset (only after email delivery is configured), browse, service details and checkout.
6. Submit a real COD booking in a test environment. Verify the same order appears after refresh in My Bookings and in Admin > Bookings, with paymentStatus=PENDING and paymentMethod=COD.
7. Approve a technician, assign the booking, verify the technician can see only assigned work, and verify status transitions on admin and customer portals.
8. Test a service without an approved price: quotation request should be persisted under the customer and visible in Admin > Requests. No payment or booking confirmation should be invented.
9. Test API calls that spoof paymentMethod=ONLINE (should reject) and cross-customer and non-admin access to privileged endpoints (should reject).
10. Test on mobile and desktop, with network failures and duplicate clicks, and verify server-side logs and audit records.

## Still dependent on infrastructure / tests
- Admin account initial provisioning and authenticator setup must be configured with proper backend data and secrets.
- Live Google OAuth, password-reset email delivery, all technician dispatch / notifications, fully persistent implementations of the whole V1/V2 feature proposal list, and cross-service authenticated E2E are not proven by source edits.
- The original payment gateway integration remains in source for a later reviewed release; it is disabled for **new bookings** by the COD-only API guard, not deleted.
- Real COD collection/reconciliation after service completion is an operational feature; recording an order with PENDING payment must not be presented as settled revenue.
- Avoid hosting admin and customer UIs under a single app without their own role/session authorization enforcement.

## Protected data
Never commit customer records, admin password/OTP, Google OAuth client secrets, SMS/SMTP tokens, or payment credentials to a public repository.
