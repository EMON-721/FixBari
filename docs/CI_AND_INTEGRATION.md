# FixBari Build and Integration Checks

- `.github/workflows/ci.yml` defines build, PostgreSQL/Django migration and Chromium preview E2E jobs. It does not run until source is pushed and GitHub Actions executes.
- Local preview E2E test: `python tests/browser_preview_e2e.py` (requires Playwright and Chromium).
- Node monorepo: `corepack pnpm install --frozen-lockfile`, `corepack pnpm --filter @local-services/database db:generate`, `corepack pnpm build`.
- Database: use a disposable PostgreSQL database for `pnpm --filter @local-services/database exec prisma migrate deploy` and `python services/payment/manage.py migrate`.
- Google Sign-in: configure `GOOGLE_CLIENT_ID` for auth service and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` for customer app; register the actual site origin in Google Cloud. Both IDs must match. Do not put OAuth client secrets in the browser.
- Payments: configure `SSLCOMMERZ_STORE_ID`/`SSLCOMMERZ_STORE_PASSWORD` backend-only; `PAYMENT_INTERNAL_TOKEN` must match orders and payment services; HTTPS callback URLs are required. Sandbox verified callbacks and refund settlement need merchant credentials; unit/browser demo cannot authorize real funds.
- No `.env`, real keys, real customer data, or payment secrets should be committed.
- Offline browser E2E is not a hosted full-stack E2E test. Add service-to-service E2E only after a deployable test stack exists.
