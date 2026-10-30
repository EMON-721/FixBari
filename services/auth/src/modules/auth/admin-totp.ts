import * as crypto from "crypto";

function encryptionKey(): Buffer {
  const raw = process.env.ADMIN_2FA_ENCRYPTION_KEY;
  if (!raw || !/^[0-9a-fA-F]{64}$/.test(raw)) throw new Error("ADMIN_2FA_ENCRYPTION_KEY must be 32 bytes (hex)");
  return Buffer.from(raw, "hex");
}

export function encryptTotpSecret(secret: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(secret, "utf8"),cipher.final()]);
  return [iv.toString("hex"),cipher.getAuthTag().toString("hex"),data.toString("hex")].join(".");
}

export function decryptTotpSecret(payload: string): string {
  const [iv,tag,data] = payload.split(".");
  if (!iv || !tag || !data) throw new Error("Invalid TOTP cipher");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(),Buffer.from(iv,"hex"));
  decipher.setAuthTag(Buffer.from(tag,"hex"));
  return Buffer.concat([decipher.update(Buffer.from(data,"hex")),decipher.final()]).toString("utf8");
}

export function newTotpSecret(): string { return crypto.randomBytes(20).toString("hex"); }
export function totpCode(secret: string, step: number): string {
  const counter=Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac=crypto.createHmac("sha1",Buffer.from(secret,"hex")).update(counter).digest();
  const offset=hmac[19]&0x0f;
  return String((hmac.readUInt32BE(offset)&0x7fffffff)%1000000).padStart(6,"0");
}

export function matchingTotpStep(secret:string, code:string, now=Date.now()):number|null {
  if (!/^\d{6}$/.test(code)) return null;
  const current=Math.floor(now/30000);
  for(const step of [current-1,current,current+1]) {
    const a=Buffer.from(totpCode(secret,step));
    const b=Buffer.from(code);
    if(crypto.timingSafeEqual(a,b)) return step;
  }
  return null;
}
function base32(hex: string): string {
  const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const bytes=Buffer.from(hex,"hex");
  let bits=0,value=0,out="";
  for (const byte of bytes) {
    value=(value<<8)|byte; bits+=8;
    while (bits>=5) {out+=alphabet[(value>>>(bits-5))&31];bits-=5;}
  }
  if(bits>0) out+=alphabet[(value<<(5-bits))&31];
  return out;
}
export function totpUri(secret:string,email:string):string {
  const label=encodeURIComponent("FixBari:"+email);
  return `otpauth://totp/${label}?secret=${base32(secret)}&issuer=FixBari&algorithm=SHA1&digits=6&period=30`;
}
