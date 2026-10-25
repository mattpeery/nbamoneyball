import "server-only";
import crypto from "crypto";

const COOKIE_PREFIX = "nba_group_";
/** A year, so members aren't re-asked for the group password during the season. "You know the password," not security-critical. */
export const GROUP_SESSION_MAX_AGE_S = 365 * 24 * 60 * 60;
const SESSION_TTL_MS = GROUP_SESSION_MAX_AGE_S * 1000;

function sign(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function groupCookieName(groupId: string): string {
  return `${COOKIE_PREFIX}${groupId}`;
}

/** Builds a signed "expiresAt.signature" token for a specific group. Returns null if the secret isn't configured. */
export function createGroupSessionToken(groupId: string): string | null {
  const secret = process.env.GROUP_SESSION_SECRET;
  if (!secret) return null;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${groupId}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function verifyGroupSessionToken(groupId: string, token: string | undefined | null): boolean {
  const secret = process.env.GROUP_SESSION_SECRET;
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [tokenGroupId, expiresAt, signature] = parts;
  if (tokenGroupId !== groupId) return false;
  const payload = `${tokenGroupId}.${expiresAt}`;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(expiresAt) > Date.now();
}
