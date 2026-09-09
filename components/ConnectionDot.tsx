"use client";

import { motion } from "framer-motion";

export type ConnState = "connected" | "slow" | "reconnecting" | "disconnected";

export function connStateFor(connected: boolean, pingMs: number | null): ConnState {
  if (!connected) return "reconnecting";
  if (pingMs === null) return "connected";
  if (pingMs > 250) return "slow";
  return "connected";
}

const BAR_COLOR: Record<ConnState, string> = {
  connected: "#B8F34A",
  slow: "#FFB454",
  reconnecting: "#FF6B6B",
  disconnected: "#FF6B6B",
};

/** BGMI-style signal strength: how many of the 4 bars light up for a given ping. */
function barsFor(state: ConnState, pingMs: number | null): number {
  if (state === "reconnecting" || state === "disconnected") return 0;
  if (pingMs === null) return 4; // no reading yet — assume good rather than alarming the player
  if (pingMs <= 80) return 4;
  if (pingMs <= 150) return 3;
  if (pingMs <= 250) return 2;
  return 1;
}

const BAR_HEIGHTS = [4, 7, 10, 13]; // px, ascending like a phone signal icon

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
  const litBars = barsFor(state, pingMs);
  const color = BAR_COLOR[state];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs ${highlight ? "text-primary" : "text-muted"}`}
      title={`${state}${pingMs !== null ? ` · ${pingMs}ms` : ""}`}
    >
      <span className="inline-flex items-end gap-[1.5px]" aria-hidden>
        {BAR_HEIGHTS.map((h, i) => {
          const isLit = i < litBars;
          return (
            <motion.span
              key={i}
              className="w-[3px] rounded-[1px]"
              style={{ height: h, backgroundColor: isLit ? color : "#33392f" }}
              animate={
                state === "reconnecting"
                  ? { opacity: [0.25, 0.9, 0.25] }
                  : { opacity: isLit ? 1 : 0.4 }
              }
              transition={
                state === "reconnecting"
                  ? { duration: 0.9, repeat: Infinity, delay: i * 0.1 }
                  : { duration: 0.2 }
              }
            />
          );
        })}
      </span>
      <span className="truncate max-w-[7rem]">{name}</span>
      {state === "reconnecting" ? (
        <span className="text-accent">reconnecting…</span>
      ) : pingMs !== null ? (
        <span className="font-game-mono">{pingMs}ms</span>
      ) : null}
    </span>
  );
}
