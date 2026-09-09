import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LeaderboardTable, type LeaderboardRow } from "@/components/LeaderboardTable";

export const dynamic = "force-dynamic";

// A registered player appears on the leaderboard as soon as they've finished a single game.
const MIN_GAMES_THRESHOLD = 1;

export default async function LeaderboardPage() {
  const session = await getSession();
  let leaderboard: LeaderboardRow[] = [];
  let dbError = false;

  try {
    const db = await getDb();
    const rows = await db
      .collection("statistics")
      .find({ games: { $gte: MIN_GAMES_THRESHOLD } })
      .sort({ wins: -1, games: 1 })
      .limit(50)
      .toArray();

    const allUsers = await db.collection("users").find({}).project({ username: 1 }).toArray();
    const usersByIdString = new Map<string, string>();
    for (const u of allUsers) usersByIdString.set(u._id.toString(), u.username as string);

    leaderboard = rows.map((r) => {
      const games = r.games ?? 0;
      const wins = r.wins ?? 0;
      return {
        userId: r.userId as string,
        username: usersByIdString.get(r.userId) ?? "Unknown",
        games,
        wins,
        winRate: games > 0 ? Math.round((wins / games) * 100) : 0,
      };
    });
  } catch {
    dbError = true;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar username={session?.username ?? null} isAdmin={session?.isAdmin} />
      <main className="flex-1 px-4 py-10 bg-glow-playful">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          <h1 className="text-lg tracking-widest text-muted text-center">🏆 LEADERBOARD</h1>

          {dbError ? (
            <p className="text-center text-sm text-danger">Leaderboard is temporarily unavailable.</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-sm text-muted">
              No ranked players yet — finish a game to be the first to appear here.
            </p>
          ) : (
            <LeaderboardTable rows={leaderboard} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
