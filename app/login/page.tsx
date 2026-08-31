"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
        return;
      }
      router.push("/profile");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <form onSubmit={submit} className="max-w-md w-full mx-auto space-y-5">
          <h1 className="text-lg tracking-widest text-muted text-center">LOG IN</h1>

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
            <label className="text-xs text-muted block">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Logging in…" : "LOG IN"}
          </button>

          <div className="flex justify-between text-xs">
            <Link href="/forgot-password" className="text-secondary underline">
              Forgot password?
            </Link>
            <Link href="/register" className="text-primary underline">
              Create account
            </Link>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
