# FixBari — Source validation and release status

**Date:** 2026-10-30  
**Project name:** FixBari  
**Owner:** Md. Emon Hossain  
**Release classification:** GitHub-ready *source candidate*, **not** production-verified deployment.

## Verified in this workspace

- All original 427 V3 ZIP file entries were compared at the file level. **No original source file was deleted** (Python `__pycache__` artifacts are not required source files).
- Public website text, interactive preview and account branding use **FixBari**. Owner attributed on the About page, footer and project documentation.
- 294 TypeScript/JavaScript/TSX source files transpiled without syntax diagnostics using the available TypeScript compiler (this is syntax validation, not module resolution or a full typecheck).
- 33 Python source files passed AST parsing; JSON files parsed; preview JavaScript passed `node --check`.
- Rule-based cost estimator passed five unit assertions (Dhaka baseline, complex-tier pricing, method tag and invalid inputs).
- The 24 V1 and 30 V2 *proposals* remain in the feature implementation registry.

## Added source changes

- Customer request/quotation and cost estimator screens; Admin customer directory, technician verification and request triage screens.
- Technician quotation offer UI, weekly availability, profile update and estimated earnings UI.
- Authenticated customer profile editing and address persistence; migrations for profile and technician review state.
- Verified technician restrictions and conditional job claiming; quote opportunities expose only whitelisted public scope fields; conditional offer selection.
- Distinct access/refresh token purposes; JWT secret fallback removed; production Django key required; CORS and previous project API routing cleaned up.
- Original design components, service seed catalog, multi-app / microservice structure and old documentation preserved.

## Not tested or incomplete

- Next.js full build and package type checking: unavailable without workspace package installation.
- Full PostgreSQL migrations and multi-container integration: no container stack or connected database was run.
- Browser E2E of the **updated** preview: Chromium was not installed in this execution environment. Preview scripts passed syntax validation; do not claim fresh browser testing.
- External authentication/OAuth, KYC, SMTP/SMS/Push provider configuration, SSLCOMMERZ merchant sandbox/live payments, refunds and settlement, AI photo model, voice, demand forecasting and remaining V1/V2 integrations are incomplete.
- No hosting, no domain setup, no GitHub push, no production credential handling. These are reserved for the owner.

**Important:** The preview is a self-contained browser-only demonstration. It is not authenticated or connected to the real backend. Do not accept payments or customer identity documents before infrastructure, security and legal readiness checks are complete.
