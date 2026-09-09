"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";
import {
  getSoundPreference,
  setSoundPreference,
  getOrCreateDisplayName,
  saveDisplayName,
} from "@/lib/clientStorage";
import { randomGuestName } from "@/lib/randomName";

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between rounded-xl border border-surface2 bg-surface px-4 py-3.5"
    >
      <span className="text-sm text-ink">{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          on ? "bg-primary" : "bg-surface3"
        }`}
      >
        <motion.span
          className="inline-block h-4.5 w-4.5 rounded-full bg-background shadow"
          style={{ height: 18, width: 18 }}
          animate={{ x: on ? 22 : 3 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  );
}

export function SettingsClient({ username, isAdmin }: { username: string | null; isAdmin?: boolean }) {
  const [soundOn, setSoundOn] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [savedName, setSavedName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    setSoundOn(getSoundPreference());
    if (!username) setGuestName(getOrCreateDisplayName());
  }, [username]);

  function toggleSound(v: boolean) {
    setSoundOn(v);
    setSoundPreference(v);
  }

  function saveGuestName() {
    const trimmed = guestName.trim().slice(0, 24) || randomGuestName();
    setGuestName(trimmed);
    saveDisplayName(trimmed);
    setSavedName(true);
    setTimeout(() => setSavedName(false), 1800);
  }

  function shuffleGuestName() {
    const next = randomGuestName();
    setGuestName(next);
    saveDisplayName(next);
  }

  async function submitPasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (newPassword !== confirmPassword) {
      setPwError("New passwords don't match");
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error ?? "Could not change password");
        return;
      }
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar username={username} isAdmin={isAdmin} />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-xl w-full mx-auto space-y-8">
          <h1 className="text-lg tracking-widest text-muted text-center">SETTINGS</h1>

          <section className="space-y-3">
            <p className="text-xs text-muted tracking-widest">SOUND</p>
            <Toggle on={soundOn} onChange={toggleSound} label="Sound effects (dice, capture, win)" />
          </section>

          {!username && (
            <section className="space-y-3">
              <p className="text-xs text-muted tracking-widest">GUEST DISPLAY NAME</p>
              <div className="flex items-center gap-3 rounded-xl border border-surface2 bg-surface p-4">
                <Avatar seed={guestName || "guest"} size="lg" />
                <div className="flex-1 space-y-2">
                  <input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value.slice(0, 24))}
                    className="w-full bg-surface2 rounded-full px-4 py-2 outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveGuestName}
                      className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-background hover:opacity-90 transition"
                    >
                      {savedName ? "Saved ✓" : "Save"}
                    </button>
                    <button
                      onClick={shuffleGuestName}
                      className="rounded-full border border-secondary/60 px-4 py-1.5 text-xs font-medium text-secondary hover:bg-secondary/10 transition"
                    >
                      🎲 Shuffle
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted">
                Create an account to keep your name, avatar, and stats permanently — see{" "}
                <a href="/register" className="text-primary underline">
                  Register
                </a>
                .
              </p>
            </section>
          )}

          {username && (
            <section className="space-y-3">
              <p className="text-xs text-muted tracking-widest">CHANGE PASSWORD</p>
              <form onSubmit={submitPasswordChange} className="space-y-3 rounded-xl border border-surface2 bg-surface p-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-muted block">CURRENT PASSWORD</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full bg-surface2 rounded-full px-4 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted block">NEW PASSWORD</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-surface2 rounded-full px-4 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-muted block">CONFIRM NEW PASSWORD</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-surface2 rounded-full px-4 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>
                {pwError && <p className="text-sm text-danger">{pwError}</p>}
                {pwSuccess && <p className="text-sm text-primary">Password updated ✓</p>}
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="w-full rounded-full bg-primary px-6 py-3 font-semibold text-background hover:opacity-90 transition disabled:opacity-50"
                >
                  {pwLoading ? "Updating…" : "UPDATE PASSWORD"}
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
