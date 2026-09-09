"use client";

import { motion } from "framer-motion";

export function AuthCard({ emoji = "🎲", children }: { emoji?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md w-full mx-auto rounded-2xl border border-surface2 bg-surface/80 backdrop-blur-sm p-6 sm:p-8 shadow-xl shadow-black/20"
    >
      <div className="flex justify-center mb-1 text-3xl">{emoji}</div>
      {children}
    </motion.div>
  );
}
