"use client";

export type ConnState = "connected" | "slow" | "reconnecting" | "disconnected";

export function connStateFor(connected: boolean, pingMs: number | null): ConnState {
  if (!connected) return "reconnecting";
  if (pingMs === null) return "connected";
  if (pingMs > 250) return "slow";
  return "connected";
}

const DOT_COLOR: Record<ConnState, string> = {
  connected: "#B8F34A",
  slow: "#FFB454",
  reconnecting: "#FFB454",
  disconnected: "#FF6B6B",
};

export function ConnectionDot({
  name,
  pingMs,
  state,
  highlight,
}: {
  name: string;
  pingMs: number | null;
  state: ConnState;
  highlight?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${highlight ? "text-primary" : "text-muted"}`}
      title={state}
    >
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: DOT_COLOR[state] }}
        aria-hidden
      />
      <span className="truncate max-w-[7rem]">{name}</span>
      {state === "reconnecting" ? (
        <span className="text-accent">reconnecting…</span>
      ) : pingMs !== null ? (
        <span>{pingMs}ms</span>
      ) : null}
    </span>
  );
}
