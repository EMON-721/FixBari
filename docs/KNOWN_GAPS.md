# Known production dependencies and verification gaps

- GitHub Actions has passed the monorepo production build, PostgreSQL/Prisma and Django migrations, Docker Compose configuration, and Chromium offline browser tests. A live multi-container deployment and authenticated cross-service end-to-end integration have **not** been verified.
- 54 proposed V1+V2 features are tracked; only a subset have persistence/UI integrations. Do not confuse the demo registry with a working implementation.
- External integrations are unconfigured: SMTP delivery credentials, SMS provider, Google OAuth, KYC/document verification, payment gateway settlement/refunds, AI photo models, speech and demand forecasting.
- Admin 2FA and persistent platform settings need server-side work. Do not treat settings toggles or browser-only demo controls as production features.
- Technician earnings currently use a fixed illustrative revenue share; payouts should be calculated from an approved commission ledger and reconciled to a payment provider.
- Token revocation after user deactivation requires further authentication coordination across services and API gateways.
- The existing booking completion endpoint marks work complete when technician submits it; a future customer acceptance model requires a separate status transition before final settlement.
- Data storage, retention, consent, accessibility, abuse controls and backups require live infrastructure audits.
- `vercel.json` files deliberately omit old project rewrites. Set your own API gateway configuration in the hosting environment.
