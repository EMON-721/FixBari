# FixBari — Activate Google Sign-In (Customer)

## Current deployment finding (2026-11-01)
The Vercel project `fix-bari` currently has **no configured project environment variables** (checked with no decryption). The customer login UI therefore has no `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, and the Google sign-in button must not be displayed as functional.

**Do not invent a Google Client ID. Do not paste a Google Client Secret into client code, `NEXT_PUBLIC_*` variables, GitHub, chat, or browser localStorage.** This project uses Google Identity Services ID-token sign-in, not an OAuth authorization-code exchange.

## Google Cloud setup (website owner)
1. Use a Google Cloud project you control. Configure the Google Auth platform app details/consent screen as required.
2. Under **Google Auth platform → Clients**, create an **OAuth client ID** of type **Web application**.
3. Under **Authorized JavaScript origins**, add the exact HTTPS origin(s) where customers will log in, e.g.
   - `https://fix-bari-emon-grad-track.vercel.app`
   - `https://fix-bari-git-main-emon-grad-track.vercel.app` (only if actually used)
   - `http://localhost:3000` for local development
   Do not include URL paths or trailing slashes. Avoid relying on dynamic Vercel preview domains: Google requires explicitly authorized origins.
4. If the OAuth consent screen is in Testing mode, include only the intended Google test accounts in the allowed tester list. Observe any publishing/verification requirements.
5. Copy the **OAuth Web client ID** (usually ending in `.apps.googleusercontent.com`); this identifier is public and is not a secret. The Google Client **Secret is not used by this ID-token button flow**.

## Configure BOTH sides
### Customer frontend: Vercel → `fix-bari` → Settings → Environment Variables
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: the Google OAuth **Web client ID** from step 5
- Target: **Production** and other environments only when their origins are in Google's list
- Save and **redeploy** the customer website. Next.js inlines `NEXT_PUBLIC_*` at build time; existing deployments do not pick up a new value.

### Auth backend: its actual hosting environment, not the Vercel frontend
- `GOOGLE_CLIENT_ID`: **the same Google OAuth Web client ID**
- The backend `POST /api/auth/google` route must be reachable from the customer frontend through the approved API gateway.
- Backend database connection, JWT session configuration and CORS/routing must already work. Do not put backend secrets in `NEXT_PUBLIC_*`.

### Login API connectivity
- The Vercel customer frontend also has **no `API_GATEWAY_ORIGIN` configured** at the time of this check.
- For working email/password, signup and Google login, configure `API_GATEWAY_ORIGIN` to an HTTPS backend gateway that actually routes `/api/auth/*`, `/api/services/*` and `/api/orders/*`.
- The source's local development fallback `http://localhost` is not a production backend. The site can render without live authentication services; this does **not** prove signup/login/booking works.
- If the backend is not deployed, deploy it and its database securely before trying to accept customer accounts.

## Acceptance tests
- Reload the **new** Vercel deployment in a fresh/private browser window on an exact Google-authorized origin.
- Confirm a Google-provided **Continue with Google** button appears only when a valid client ID was configured.
- Click it, select an authorized Google account, confirm `/api/auth/google` is called and its response creates the expected customer session.
- Confirm `GET /api/auth/me` reports `CUSTOMER`, then navigate to My Bookings and confirm an authenticated reload works.
- Confirm login with an existing email/password account still works. Google accounts are **not silently linked** to existing password accounts by email only (account takeover prevention); a safe account-linking flow would be required.
- Confirm opening Admin App with a customer token is rejected and no admin role is created by customer Google login.
- Test with no client ID: the Google area is hidden without showing an internal environment variable name to customers, but email/password remains available if the Auth Backend is configured.

## Source
- `apps/web/src/components/auth/login-form.tsx`
- `apps/web/src/contexts/auth-context.tsx`
- `services/auth/src/modules/auth/auth.service.ts`
- `services/auth/src/modules/auth/verify-google-token.ts`
- `apps/web/next.config.ts`
