"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const PIP_LAYOUT: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 0],
    [2, 2],
  ],
};

export function Dice({
  value,
  rolling,
  onRoll,
  disabled,
}: {
  value: number | null;
  rolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}) {
  const [displayValue, setDisplayValue] = useState(value ?? 1);
  const [spinFace, setSpinFace] = useState(1);
  const spinTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (value !== null) setDisplayValue(value);
  }, [value]);

  // While rolling, actually cycle through faces at a fast tick — a static random pick
  // on one render doesn't read as a spin, it just reads as "wrong number".
  useEffect(() => {
    if (rolling) {
      spinTimer.current = setInterval(() => setSpinFace(1 + Math.floor(Math.random() * 6)), 70);
    } else if (spinTimer.current) {
      clearInterval(spinTimer.current);
      spinTimer.current = null;
    }
    return () => {
      if (spinTimer.current) clearInterval(spinTimer.current);
    };
  }, [rolling]);

  const shown = rolling ? spinFace : displayValue;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <motion.button
        type="button"
        onClick={onRoll}
        disabled={disabled || rolling}
        aria-label={disabled ? "Not your turn" : rolling ? "Rolling…" : "Roll dice (space bar works too)"}
        aria-live="polite"
        whileHover={disabled ? undefined : { scale: 1.06 }}
        whileTap={disabled ? undefined : { scale: 0.92 }}
        animate={
          rolling
            ? { rotate: [0, -12, 14, -8, 6, 0], scale: [1, 1.12, 0.96, 1.08, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={rolling ? { duration: 0.5, ease: "easeInOut" } : { type: "spring", stiffness: 400, damping: 18 }}
        className={`grid h-16 w-16 grid-cols-3 grid-rows-3 gap-1 rounded-2xl border-2 p-2 ${
          disabled
            ? "border-surface2 bg-surface cursor-not-allowed opacity-40"
            : "border-primary bg-gradient-to-br from-surface2 to-surface3 shadow-[0_0_20px_-4px_rgba(184,243,74,0.65)] cursor-pointer"
        }`}
      >
        {Array.from({ length: 9 }).map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const active = PIP_LAYOUT[shown]?.some(([r, c]) => r === row && c === col);
          return (
            <span
              key={i}
              className={`rounded-full transition-colors ${
                active ? (disabled ? "bg-muted" : "bg-primary shadow-[0_0_6px_rgba(184,243,74,0.9)]") : "bg-transparent"
              }`}
              style={{ width: "100%", height: "100%" }}
            />
          );
        })}
      </motion.button>
      <span className="text-[10px] text-muted tracking-wide h-3">
        {rolling ? "Rolling…" : !disabled ? "SPACE to roll" : ""}
      </span>
    </div>
  );
}
