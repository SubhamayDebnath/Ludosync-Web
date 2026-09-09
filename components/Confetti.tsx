"use client";

import { useMemo } from "react";

const COLORS = ["#FF4D5E", "#22C55E", "#FFD53E", "#3FA9F5", "#B8F34A", "#A78BFA"];

/** A short, cheap confetti burst — no canvas/physics lib, just a handful of falling divs. */
export function Confetti({ pieces = 24 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.4,
        color: COLORS[i % COLORS.length],
        size: 6 + Math.random() * 5,
        rotate: Math.random() * 360,
      })),
    [pieces],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {bits.map((b) => (
        <span
          key={b.id}
          className="animate-confetti absolute top-0 rounded-sm"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size * 1.4,
            backgroundColor: b.color,
            animationDelay: `${b.delay}s`,
            transform: `rotate(${b.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
