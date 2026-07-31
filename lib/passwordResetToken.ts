import "server-only";
import crypto from "crypto";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function sign(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

/** Builds a signed "email.expiresAt.signature" token (email base64url-encoded so it's URL-safe). Returns null if the secret isn't configured. */
export function createPasswordResetToken(email: string): string | null {
  const secret = process.env.PASSWORD_RESET_SECRET;
  if (!secret) return null;
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const emailPart = Buffer.from(email.toLowerCase()).toString("base64url");
  const payload = `${emailPart}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** Returns the email the token was issued for, or null if it's missing, tampered with, or expired. */
export function verifyPasswordResetToken(token: string | undefined | null): string | null {
  const secret = process.env.PASSWORD_RESET_SECRET;
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [emailPart, expiresAt, signature] = parts;
  const payload = `${emailPart}.${expiresAt}`;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Number(expiresAt) <= Date.now()) return null;
  try {
    return Buffer.from(emailPart, "base64url").toString("utf-8");
  } catch {
    return null;
  }
}
