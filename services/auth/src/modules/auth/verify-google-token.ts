/**
 * Google Identity Services ID-token verification. Native Node crypto is used
 * instead of a new dependency, keeping the existing pnpm lockfile reproducible.
 * Fail closed on invalid signature, issuer, audience, expiry and email status.
 */
import { createPublicKey, verify as verifySignature, type JsonWebKey } from "node:crypto";

const JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const ALLOWED_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);
let cache: { expires: number; keys: Array<JsonWebKey & { kid?: string }> } | undefined;

type GoogleClaims = {
  sub?: string; email?: string; email_verified?: boolean; iss?: string;
  aud?: string | string[]; exp?: number; iat?: number;
  name?: string; given_name?: string; family_name?: string; picture?: string;
};

function parseBase64Json<T>(part: string): T {
  const raw = Buffer.from(part, "base64url");
  if (raw.byteLength > 16384 || !raw.length) throw new Error("Invalid JWT part");
  return JSON.parse(raw.toString("utf8")) as T;
}

async function fetchKeys(): Promise<Array<JsonWebKey & {kid?:string}>> {
  const now = Date.now();
  if (cache && now < cache.expires) return cache.keys;
  const response = await fetch(JWKS_URL, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error("Google JWKS unavailable");
  const body = await response.json() as { keys?: Array<JsonWebKey & {kid?:string}> };
  if (!Array.isArray(body.keys) || body.keys.length === 0) throw new Error("Invalid JWKS");
  // Respect Google's rotation; max 1 hour cache, no indefinitely trusting old keys.
  const maxAge = /max-age=(\d+)/i.exec(response.headers.get("cache-control") || "");
  const seconds = Math.min(3600, Math.max(60, Number(maxAge?.[1] ?? 300)));
  cache = { keys: body.keys, expires: now + seconds * 1000 };
  return body.keys;
}

export async function verifyGoogleIdToken(token: string, expectedAudience: string): Promise<GoogleClaims> {
  if (!expectedAudience || token.length > 16384) throw new Error("Invalid token input");
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT");
  const header = parseBase64Json<{ alg?: string; typ?: string; kid?: string }>(parts[0]);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Unsupported JWT algorithm");
  const keys = await fetchKeys();
  const jwk = keys.find(key => key.kid === header.kid && key.kty === "RSA" && (!key.alg || key.alg === "RS256"));
  if (!jwk) throw new Error("Unknown Google signing key");
  const publicKey = createPublicKey({ key: jwk, format: "jwk" });
  const signed = Buffer.from(`${parts[0]}.${parts[1]}`, "ascii");
  const signature = Buffer.from(parts[2], "base64url");
  if (!verifySignature("RSA-SHA256", signed, publicKey, signature)) throw new Error("Invalid token signature");
  const claims = parseBase64Json<GoogleClaims>(parts[1]);
  const now = Math.floor(Date.now() / 1000);
  if (!ALLOWED_ISSUERS.has(claims.iss ?? "") || claims.aud !== expectedAudience ||
      typeof claims.exp !== "number" || claims.exp <= now ||
      typeof claims.iat !== "number" || claims.iat > now + 60 ||
      !claims.sub || !claims.email || claims.email_verified !== true) {
    throw new Error("Invalid Google token claims");
  }
  return claims;
}
