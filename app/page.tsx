import Link from "next/link";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar username={session?.username ?? null} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl mx-auto text-center space-y-10">
          <div className="space-y-3">
            <div className="flex justify-center gap-1 text-4xl">
              <span>🔴</span>
              <span>🟢</span>
              <span>🟡</span>
              <span>🔵</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-primary">LUDO</h1>
            <p className="text-muted text-sm">small, colorful, multiplayer ludo — for all ages 🎉</p>
          </div>

          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <Link
              href="/create"
              className="px-6 py-3.5 rounded-full bg-primary text-background font-semibold text-center hover:opacity-90 hover:scale-[1.02] transition"
            >
              🎲 CREATE ROOM
            </Link>
            <Link
              href="/join"
              className="px-6 py-3.5 rounded-full border-2 border-secondary text-secondary font-semibold text-center hover:bg-secondary/10 transition"
            >
              🔗 JOIN ROOM
            </Link>
            <p className="text-xs text-muted mt-2">no account needed — jump right in</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-4">
            <FeatureCard emoji="⚡" title="Fast rounds" desc="30s lobby, real-time dice & moves" />
            <FeatureCard emoji="👨‍👩‍👧‍👦" title="2–4 players" desc="Play with friends or family, remote or same device" />
            <FeatureCard emoji="💬" title="In-room chat" desc="Chat while you play — gone when the room closes" />
          </div>

          {!session && (
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
      </main>
      <Footer />
    </div>
  );
}

function FeatureCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-surface2 bg-surface p-4 text-left">
      <div className="text-2xl">{emoji}</div>
      <p className="mt-2 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted">{desc}</p>
    </div>
  );
}
