"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/Avatar";

export interface LeaderboardRow {
  userId: string;
  username: string;
  games: number;
  wins: number;
  winRate: number;
}

const MEDAL = ["🥇", "🥈", "🥉"];

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="max-w-xl mx-auto rounded-2xl border border-surface2 bg-surface overflow-hidden">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-4 py-2.5 text-xs text-muted border-b border-surface2">
        <span>PLAYER</span>
        <span className="text-right">GAMES</span>
        <span className="text-right">WINS</span>
        <span className="text-right">WIN RATE</span>
      </div>
      {rows.map((row, i) => (
        <motion.div
          key={row.userId}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: Math.min(i, 10) * 0.04 }}
          className={`grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-4 py-2.5 text-sm border-b border-surface2/60 last:border-0 ${
            i < 3 ? "bg-primary/5" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 text-center text-base">{MEDAL[i] ?? <span className="text-muted text-xs">{i + 1}</span>}</span>
            <Avatar seed={row.userId} size="sm" />
            <span className="truncate">{row.username}</span>
          </div>
          <span className="text-right text-muted">{row.games}</span>
          <span className="text-right text-primary font-semibold">{row.wins}</span>
          <span className="text-right text-accent">{row.winRate}%</span>
        </motion.div>
      ))}
    </div>
  );
}
