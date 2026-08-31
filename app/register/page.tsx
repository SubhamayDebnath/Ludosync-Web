"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, recoveryCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
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
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <form onSubmit={submit} className="max-w-md w-full mx-auto space-y-5">
          <h1 className="text-lg tracking-widest text-muted text-center">REGISTER</h1>

          <Field label="USERNAME" value={username} onChange={setUsername} autoFocus />
          <Field label="EMAIL" type="email" value={email} onChange={setEmail} />
          <Field label="PASSWORD" type="password" value={password} onChange={setPassword} />
          <div className="space-y-1">
            <Field label="SECRET RECOVERY CODE" value={recoveryCode} onChange={setRecoveryCode} />
            <p className="text-[11px] text-muted">Save this somewhere safe — you&rsquo;ll need it to reset your password.</p>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 rounded-full bg-primary text-background font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Creating account…" : "CREATE ACCOUNT"}
          </button>

          <p className="text-center text-xs text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-muted block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        required
        className="w-full bg-surface2 rounded-full px-4 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-primary"
      />
    </div>
  );
}
