export function getEngineWsUrl(): string {
  const url = process.env.NEXT_PUBLIC_ENGINE_WS_URL;
  if (!url) throw new Error("NEXT_PUBLIC_ENGINE_WS_URL is not configured");
  return url;
}
