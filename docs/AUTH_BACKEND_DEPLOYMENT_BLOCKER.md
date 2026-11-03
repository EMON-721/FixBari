# FixBari live Signup / Login — 404 diagnosis and deployment gate

## Verified production problem

As of the fix, the Vercel project `fix-bari` deploys only `apps/web`, and **has no project environment variables**. The NestJS Auth service is in the repository under `services/auth`, but there is no live Auth service or PostgreSQL database connected to this Vercel project. Client `POST /api/auth/register` therefore received HTTP 404: frontend hosting alone cannot persist customer accounts.

Do **not** imitate successful signup by storing passwords or user records in localStorage, static JSON, or a serverless process's ephemeral file system.

## Changes made

- `apps/web/src/app/api/auth/[...path]/route.ts` is a same-origin, HTTPS-only production proxy to the real Auth backend. Missing backend configuration or an unreachable backend returns a structured **503 AUTH_SERVICE_UNAVAILABLE** rather than a misleading 404.
- `apps/web/src/components/auth/register-form.tsx` checks `/api/auth/health` before allowing password submission. If the backend is unavailable it explains that the account has not been created, and protects the user's entered credentials by not sending the registration request.
- `apps/web/next.config.ts` no longer rewrites arbitrary API paths to local localhost in production. Non-auth service rewrites activate only if an explicit valid gateway origin exists.

## Required operational work for real signup (not completed by these frontend commits)

1. Provision a dedicated production PostgreSQL database for FixBari, separate from unrelated applications. Keep all connection strings and user data private.
2. Deploy the existing NestJS `services/auth` service on a platform supporting a persistent Node.js backend (or explicitly adapt it to serverless) with a stable HTTPS hostname. This service depends on `@local-services/database` and Prisma.
3. Set its private environment variables including `DATABASE_URL` and a long, cryptographically random `JWT_SECRET`. Check the Auth service's other required settings. Never use test/sample secrets or share secret values through a public repository.
4. Apply the existing Prisma migrations (including `20261101170000_customer_number`) with `pnpm --filter @local-services/database db:migrate:deploy` or the repository's verified equivalent, using the correct production DB and safe migration procedure. Inspect migration logs and account-number constraints.
5. Confirm the backend returns HTTP 200 JSON from `GET https://<auth-host>/api/auth/health`. Confirm HTTPS, network policies and basic rate limits. CORS restrictions should include the customer and admin domains only as appropriate.
6. In Vercel `fix-bari` → **Settings → Environment Variables**, add the server-only `AUTH_SERVICE_ORIGIN=https://<auth-host>` (just the HTTPS origin, with no path), targeting Production. Redeploy so the Next.js server can reach it.
7. Use a test account (not a real customer's credentials) to confirm POST `/api/auth/register` persists a single CUSTOMER user with a generated Customer ID, then login and GET `/api/auth/me`. Verify the account persists after redeployment and database restart.
8. Independently deploy and connect Catalog and Orders services before promising end-to-end COD booking. A successful Auth service alone does not make the full marketplace functional.

## Current limitations

- GitHub's Docker, database-migration, build and offline browser CI jobs verify **source and test infrastructure**, not that a real production database and auth server are running.
- The public sign-up form will remain intentionally unavailable while `AUTH_SERVICE_ORIGIN` is missing, and explicitly says so. This is safer than accepting account data with nowhere to persist it.
- Password reset currently needs a real mail-delivery provider to send reset links. Do not advertise operational email recovery before that provider is configured.

## Reproducible checks (safe)

- `GET /api/auth/health` on the public site: **503 JSON** with `AUTH_SERVICE_UNAVAILABLE` if unconfigured; **200** via real backend when configured correctly
- `POST /api/auth/register` when backend is unconfigured: **503 JSON**; no account is created
- On valid backend: verify normal registration, duplicate-email rejection, password policy, customer-only role, stable Customer ID, and logout/login
- Admin privileges remain separate and must be checked server-side

**Safety:** Do not paste passwords, database connection strings, JWT secrets, OTPs or OAuth client secrets into GitHub issues, chat or frontend env vars.
