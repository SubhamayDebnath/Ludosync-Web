"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "HOME" },
  { href: "/create", label: "CREATE" },
  { href: "/join", label: "JOIN" },
  { href: "/leaderboard", label: "LEADERBOARD" },
];

export function Navbar({ username, isAdmin }: { username?: string | null; isAdmin?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
      <nav className="mx-auto flex max-w-2xl items-center justify-between rounded-2xl border border-surface2/80 bg-surface/80 px-4 py-2.5 shadow-lg shadow-black/20 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-primary" onClick={() => setOpen(false)}>
          <span className="text-lg">🎲</span>
          <span className="text-sm sm:text-base">LUDO</span>
        </Link>

        <div className="hidden items-center gap-1 sm:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  active ? "bg-primary text-background" : "text-muted hover:text-ink hover:bg-surface2"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          {username ? (
            <>
              <Link
                href="/profile"
                className="rounded-full border border-secondary/60 px-3.5 py-1.5 text-xs font-medium text-secondary hover:bg-secondary/10 transition"
              >
                {username.toUpperCase()}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full border border-accent/60 px-3.5 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 transition"
                >
                  🛠 ADMIN
                </Link>
              )}
              <Link
                href="/settings"
                aria-label="Settings"
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-ink hover:bg-surface2 transition"
              >
                ⚙️
              </Link>
            </>
          ) : (
            <>
              <Link href="/settings" className="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted hover:text-ink transition">
                ⚙️
              </Link>
              <Link href="/login" className="rounded-full px-3.5 py-1.5 text-xs font-medium text-muted hover:text-ink transition">
                LOG IN
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-background hover:opacity-90 transition"
              >
                SIGN UP
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink sm:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
      </nav>

      {open && (
        <div className="mx-auto mt-2 max-w-4xl rounded-2xl border border-surface2/80 bg-surface/95 p-3 shadow-lg backdrop-blur-md sm:hidden">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  pathname === link.href ? "bg-primary text-background" : "text-muted hover:bg-surface2 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-1 border-t border-surface2 pt-2 space-y-1">
              {username ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-secondary hover:bg-surface2"
                  >
                    {username.toUpperCase()} · PROFILE
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-accent hover:bg-surface2"
                    >
                      🛠 ADMIN
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface2 hover:text-ink"
                  >
                    ⚙️ SETTINGS
                  </Link>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-medium text-muted hover:bg-surface2"
                    >
                      LOG IN
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="flex-1 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-background"
                    >
                      SIGN UP
                    </Link>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface2 hover:text-ink"
                  >
                    ⚙️ SETTINGS
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
