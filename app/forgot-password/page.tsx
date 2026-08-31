"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, recoveryCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not reset password");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full mx-auto text-center space-y-3">
            <h1 className="text-lg text-primary">Password updated ✓</h1>
            <p className="text-sm text-muted">Redirecting to log in…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <form onSubmit={submit} className="max-w-md w-full mx-auto space-y-5">
          <h1 className="text-lg tracking-widest text-muted text-center">RESET PASSWORD</h1>

          <div className="space-y-1.5">
            <label className="text-xs text-muted block">USERNAME OR EMAIL</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoFocus
              required
              className="w-full bg-surface2 rounded-full px-4 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted block">SECRET RECOVERY CODE</label>
            <input
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
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
              className="w-full bg-surface2 rounded-full px-4 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 rounded-full bg-primary text-background font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Resetting…" : "RESET PASSWORD"}
          </button>

          <p className="text-center text-xs text-muted">
            <Link href="/login" className="text-primary underline">
              Back to log in
            </Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
