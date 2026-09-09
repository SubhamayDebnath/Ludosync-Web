import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const SESSION_COOKIE = "ludo_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function hashSecret(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifySecret(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface SessionPayload {
  userId: string;
  username: string;
  isAdmin: boolean;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId !== "string" || typeof payload.username !== "string") return null;
    return { userId: payload.userId, username: payload.username, isAdmin: payload.isAdmin === true };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

/**
 * Bootstraps admin access from an env var (comma-separated usernames) so a fresh
 * deployment can have an admin without a manual DB edit. Once a matching user logs in,
 * `isAdmin` is persisted on their user document — the env var is only a bootstrap trigger,
 * not something checked on every request.
 */
export function isBootstrapAdminUsername(username: string): boolean {
  const list = process.env.ADMIN_USERNAMES;
  if (!list) return false;
  return list
    .split(",")
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean)
    .includes(username.toLowerCase());
}
