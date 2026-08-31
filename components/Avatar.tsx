"use client";

import { avatarFor } from "@/lib/avatar";

const SIZE_CLASSES = {
  sm: "h-6 w-6 text-xs",
  md: "h-9 w-9 text-base",
  lg: "h-14 w-14 text-2xl",
} as const;

export function Avatar({
  seed,
  size = "md",
  ring,
}: {
  seed: string;
  size?: keyof typeof SIZE_CLASSES;
  ring?: boolean;
}) {
  const { emoji, bg } = avatarFor(seed);
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${SIZE_CLASSES[size]} ${
        ring ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
      }`}
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      {emoji}
    </span>
  );
}
