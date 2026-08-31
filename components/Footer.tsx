import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto px-4 py-8 text-center">
      <div className="mx-auto max-w-4xl border-t border-surface2 pt-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
          <Link href="/create" className="hover:text-primary transition">
            Create Room
          </Link>
          <Link href="/leaderboard" className="hover:text-primary transition">
            Leaderboard
          </Link>
          <span>·</span>
          <span>🎲 small multiplayer ludo</span>
        </div>
        <p className="mt-3 text-[11px] text-muted/70">No ads. No tracking. Just dice.</p>
      </div>
    </footer>
  );
}
