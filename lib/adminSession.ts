import "server-only";
import crypto from "crypto";

const COOKIE_NAME = "nba_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function sign(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

/** Builds a signed "expiresAt.signature" token. Returns null if the secret isn't configured. */
export function createAdminSessionToken(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || !token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(payload) > Date.now();
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME };
