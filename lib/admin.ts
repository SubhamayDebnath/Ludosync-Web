import { getSession } from "./session";
import { getEngineHttpUrl, getAdminApiKey } from "./env";
import type { SessionPayload } from "./auth";

/** Returns the session only if it belongs to an admin; null otherwise (never throws). */
export async function requireAdminSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session?.isAdmin) return null;
  return session;
}

/**
 * Calls the engine's internal /admin/* API. Server-only — the admin key never reaches
 * the browser. Callers must have already verified the caller is an admin themselves.
 */
export async function engineAdminFetch(path: string, init?: RequestInit): Promise<Response> {
  const key = getAdminApiKey();
  if (!key) {
    return new Response(JSON.stringify({ error: "admin_api_key_not_configured" }), { status: 503 });
  }
  const base = getEngineHttpUrl();
  return fetch(`${base}/admin${path}`, {
    ...init,
    headers: { ...(init?.headers ?? {}), "x-admin-key": key },
  });
}
