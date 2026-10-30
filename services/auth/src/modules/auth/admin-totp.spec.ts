import { matchingTotpStep, totpCode, totpUri } from "./admin-totp";

describe("Admin TOTP RFC 6238 behavior", () => {
  const secret = "3132333435363738393031323334353637383930";
  it("matches the RFC 6238 SHA1 vector (last six digits)", () => {
    expect(totpCode(secret,1)).toBe("287082");
    expect(matchingTotpStep(secret,"287082",59000)).toBe(1);
  });
  it("rejects malformed or incorrect OTPs", () => {
    expect(matchingTotpStep(secret,"000000",59000)).toBeNull();
    expect(matchingTotpStep(secret,"12345",59000)).toBeNull();
    expect(matchingTotpStep(secret,"abcdef",59000)).toBeNull();
  });
  it("encodes authenticator enrollment using Base32", () => {
    const url = totpUri(secret,"admin@example.com");
    expect(url).toContain("secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ");
    expect(url).toContain("issuer=FixBari");
  });
});
