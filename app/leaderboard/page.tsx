import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";

const MIN_GAMES_THRESHOLD = 3;

export default async function LeaderboardPage() {
  const session = await getSession();
  let leaderboard: { userId: string; username: string; games: number; wins: number; winRate: number }[] = [];
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
      <Navbar username={session?.username ?? null} />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          <h1 className="text-lg tracking-widest text-muted text-center">🏆 LEADERBOARD</h1>

          {dbError ? (
            <p className="text-center text-sm text-danger">Leaderboard is temporarily unavailable.</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-sm text-muted">
              No ranked players yet — win a few games to appear here.
            </p>
          ) : (
            <div className="max-w-xl mx-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted text-xs border-b border-surface2">
                    <th className="text-left py-2 font-normal">PLAYER</th>
                    <th className="text-right py-2 font-normal">GAMES</th>
                    <th className="text-right py-2 font-normal">WINS</th>
                    <th className="text-right py-2 font-normal">WIN RATE</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row, i) => (
                    <tr key={row.username} className="border-b border-surface2/60">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-muted w-4">{i + 1}.</span>
                          <Avatar seed={row.userId} size="sm" />
                          {row.username}
                        </div>
                      </td>
                      <td className="text-right py-2.5 text-muted">{row.games}</td>
                      <td className="text-right py-2.5 text-primary">{row.wins}</td>
                      <td className="text-right py-2.5 text-accent">{row.winRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
