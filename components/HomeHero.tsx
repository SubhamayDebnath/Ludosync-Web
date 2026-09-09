"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const DICE_COLORS = [
  { emoji: "🔴", delay: 0 },
  { emoji: "🟢", delay: 0.12 },
  { emoji: "🟡", delay: 0.24 },
  { emoji: "🔵", delay: 0.36 },
];

export function HomeHero({ hasSession }: { hasSession: boolean }) {
  return (
    <div className="w-full max-w-4xl mx-auto text-center space-y-10 bg-glow-playful">
      <div className="space-y-3">
        <div className="flex justify-center gap-2 text-4xl">
          {DICE_COLORS.map((d, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
            >
              {d.emoji}
            </motion.span>
          ))}
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-5xl sm:text-6xl font-bold tracking-tight text-primary"
        >
          LUDO
        </motion.h1>
        <p className="text-muted text-sm">small, colorful, multiplayer ludo — for all ages 🎉</p>
      </div>

      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/create"
            className="block px-6 py-3.5 rounded-full bg-primary text-background font-semibold text-center shadow-[0_0_24px_-6px_rgba(184,243,74,0.7)] hover:opacity-90 transition"
          >
            🎲 CREATE ROOM
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/join"
            className="block px-6 py-3.5 rounded-full border-2 border-secondary text-secondary font-semibold text-center hover:bg-secondary/10 transition"
          >
            🔗 JOIN ROOM
          </Link>
        </motion.div>
        <p className="text-xs text-muted mt-2">no account needed — jump right in</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-4">
        <FeatureCard i={0} emoji="⚡" title="Instant rooms" desc="Create a room, share the code, start whenever you're ready" />
        <FeatureCard i={1} emoji="👨‍👩‍👧‍👦" title="2–4 players" desc="Play with friends or family, remote or same device" />
        <FeatureCard i={2} emoji="💬" title="In-room chat" desc="Chat while you play — gone when the room closes" />
      </div>

      {!hasSession && (
        <div className="pt-4 flex justify-center gap-6 text-sm">
          <Link href="/login" className="text-muted hover:text-primary transition">
            LOG IN
          </Link>
          <Link href="/register" className="text-muted hover:text-primary transition">
            REGISTER
          </Link>
          <Link href="/leaderboard" className="text-muted hover:text-primary transition">
            LEADERBOARD
          </Link>
        </div>
      )}
    </div>
  );
}

function FeatureCard({ i, emoji, title, desc }: { i: number; emoji: string; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
      whileHover={{ y: -3 }}
      className="rounded-xl border border-surface2 bg-surface p-4 text-left"
    >
      <div className="text-2xl">{emoji}</div>
      <p className="mt-2 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted">{desc}</p>
    </motion.div>
  );
}
