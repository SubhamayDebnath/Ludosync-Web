"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    router.push(`/room/${clean}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <form onSubmit={submit} className="max-w-md w-full mx-auto space-y-6">
          <h1 className="text-lg tracking-widest text-muted text-center">JOIN ROOM</h1>
          <div className="space-y-2">
            <label htmlFor="code" className="text-xs text-muted block text-center">
              ROOM CODE
            </label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="AB7K9Q"
              autoFocus
              className="w-full bg-surface2 rounded-2xl px-3 py-3 text-center text-2xl tracking-[0.3em] outline-none focus-visible:ring-1 focus-visible:ring-primary font-game-mono"
            />
          </div>
          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full px-6 py-3.5 rounded-full bg-primary text-background font-semibold hover:opacity-90 transition disabled:opacity-40"
          >
            JOIN
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
