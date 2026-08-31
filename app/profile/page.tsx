import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { LogoutButton } from "./LogoutButton";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
  if (!user) redirect("/login");

  const stats = await db.collection("statistics").findOne({ userId: session.userId });
  const recentMatches = await db
    .collection("recentMatches")
    .find({ userId: session.userId })
    .sort({ finishedAt: -1 })
    .limit(10)
    .toArray();

  const games = stats?.games ?? 0;
  const wins = stats?.wins ?? 0;
  const losses = stats?.losses ?? 0;
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar username={user.username} />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-4xl w-full mx-auto space-y-8">
          <h1 className="text-lg tracking-widest text-muted text-center">PROFILE</h1>

          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <Avatar seed={session.userId} size="lg" ring />
            </div>
            <p className="text-2xl font-bold text-primary">{user.username}</p>
            <p className="text-sm text-muted">{user.email}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center max-w-xl mx-auto">
            <Stat label="GAMES" value={games} />
            <Stat label="WINS" value={wins} color="text-primary" />
            <Stat label="LOSSES" value={losses} color="text-danger" />
            <Stat label="WIN RATE" value={`${winRate}%`} color="text-accent" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <p className="text-xs text-muted tracking-widest">RECENT MATCHES</p>
            {recentMatches.length === 0 ? (
              <p className="text-sm text-muted">No matches yet. Go play one!</p>
            ) : (
              <ul className="space-y-1.5">
                {recentMatches.map((m) => (
                  <li
                    key={m._id.toString()}
                    className="flex items-center justify-between text-sm border-b border-surface2 py-2"
                  >
                    <span className={m.result === "win" ? "text-primary" : "text-danger"}>
                      {m.result === "win" ? "WIN" : "LOSS"}
                    </span>
                    <span className="text-muted text-xs">{m.roomCode}</span>
                    <span className="text-muted text-xs">
                      {new Date(m.finishedAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-center pt-4">
            <LogoutButton />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-lg border border-surface2 bg-surface py-3">
      <p className={`text-xl font-bold ${color ?? "text-ink"}`}>{value}</p>
      <p className="text-[10px] text-muted mt-1">{label}</p>
    </div>
  );
}
