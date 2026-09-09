export function getEngineWsUrl(): string {
  const url = process.env.NEXT_PUBLIC_ENGINE_WS_URL;
  if (!url) throw new Error("NEXT_PUBLIC_ENGINE_WS_URL is not configured");
  return url;
}

/**
 * Server-only HTTP base URL for the engine, used by the admin API to call the engine's
 * internal /admin/* routes. Derived from the public WS URL unless explicitly overridden —
 * most deployments run both on the same host, just different protocols/paths.
 */
export function getEngineHttpUrl(): string {
  const explicit = process.env.ENGINE_HTTP_URL;
  if (explicit) return explicit;
  const wsUrl = process.env.NEXT_PUBLIC_ENGINE_WS_URL;
  if (!wsUrl) throw new Error("NEXT_PUBLIC_ENGINE_WS_URL or ENGINE_HTTP_URL must be configured");
  return wsUrl.replace(/^ws/, "http");
}

export function getAdminApiKey(): string | null {
  return process.env.ADMIN_API_KEY || null;
}
