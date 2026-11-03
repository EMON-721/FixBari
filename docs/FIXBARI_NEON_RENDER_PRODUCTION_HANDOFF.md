# FixBari production Auth deployment handoff — 2026-11-03

## Provisioned resources
- Dedicated Neon project: **FixBari** (project ID `delicate-queen-00953480`), Singapore, PostgreSQL 17
- Neon branch `main`, database `fixbari`
- Render free Docker web service: [fixbari-auth](https://dashboard.render.com/web/srv-dbkrfhuc6qcc73b8prsg), Singapore; public URL `https://fixbari-auth.onrender.com`
- Existing customer frontend: [fix-bari](https://vercel.com/emon-grad-track/fix-bari), canonical website `https://fix-bari.vercel.app`

## Status at handoff
- Neon database has been provisioned but is **empty**. Do not claim users can register yet.
- Render's Docker image successfully built from `services/auth/Dockerfile`, but startup deployment failed because Prisma migration could not connect with the unconfigured `DATABASE_URL`.
- Render service has only nonsecret defaults: `NODE_ENV=production`, `JWT_EXPIRATION=15m`, and `CORS_ORIGINS` for the trusted customer origins.
- The Vercel frontend project has **no `AUTH_SERVICE_ORIGIN`** configured, so the page correctly reports that registration is unavailable.
- GitHub build and local integration tests do not establish successful production DB migration or signup.
- No password, Neon connection URI or signing secret is stored in this document or the Git repository.

## Finish the private configuration
1. Open [Neon console](https://console.neon.tech) → `FixBari` → **Connect**. Choose the `main` branch, `fixbari` database and the database owner role. Copy a **direct, unpooled connection string** appropriate for Prisma migrations with SSL. Handle it as a secret.
2. Open [Render fixbari-auth environment](https://dashboard.render.com/web/srv-dbkrfhuc6qcc73b8prsg/env). Create `DATABASE_URL` with that Neon connection string and `JWT_SECRET` with a unique, randomly generated secret of at least 32 bytes. The Render UI must hold these, not public code.
3. Render will deploy/restart the service after environment changes. The image's startup script runs `prisma migrate deploy` before starting the NestJS Auth API. Check deployment logs, resolve any migration errors, and confirm the deployment is **Live**.
4. Open `https://fixbari-auth.onrender.com/api/auth/health`. Only continue if it returns **HTTP 200 JSON**. Ensure the schema includes tables such as `auth_users`, `auth_sessions`, and `_prisma_migrations` in Neon.
5. Go to [Vercel fix-bari environment settings](https://vercel.com/emon-grad-track/fix-bari/settings/environment-variables) and create a **server-only** environment variable `AUTH_SERVICE_ORIGIN=https://fixbari-auth.onrender.com` with Production target. Do not use `NEXT_PUBLIC_` for private values.
6. Redeploy the existing `fix-bari` project from its GitHub main branch. Confirm `https://fix-bari.vercel.app/api/auth/health` returns 200; then register a **test customer** and verify database persistence, a Customer ID, email/password login, logout and account isolation.
7. Catalog and Orders services require separate deployment, same database with properly scoped backend credentials, and gateway/service origins before live COD bookings are supported. Do not present successful authentication as the entire booking system being live.

## Security constraints
- Never copy `DATABASE_URL` or `JWT_SECRET` into a ChatGPT message, Git commit, Vercel public variable, frontend component, screenshot, or logs.
- Do not migrate unrelated projects or use an unrelated database in place of the dedicated FixBari database.
- A failed deployment does not mean users were registered. Do not invent customer records or success states.
