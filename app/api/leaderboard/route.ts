import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

// A registered player appears on the leaderboard as soon as they've finished a single game.
const MIN_GAMES_THRESHOLD = 1;

export async function GET() {
  const db = await getDb();

  const rows = await db
    .collection("statistics")
    .find({ games: { $gte: MIN_GAMES_THRESHOLD } })
    .sort({ wins: -1, games: 1 })
    .limit(50)
    .toArray();

  // userId in statistics is stored as a plain string (ObjectId.toString()); map it back to a username.
  const usersByIdString = new Map<string, string>();
  const allUsers = await db.collection("users").find({}).project({ username: 1 }).toArray();
  for (const u of allUsers) usersByIdString.set(u._id.toString(), u.username as string);

  const leaderboard = rows.map((r) => {
    const games = r.games ?? 0;
    const wins = r.wins ?? 0;
    return {
      username: usersByIdString.get(r.userId) ?? "Unknown",
      games,
      wins,
      winRate: games > 0 ? Math.round((wins / games) * 100) : 0,
    };
  });

  return NextResponse.json({ leaderboard, minGames: MIN_GAMES_THRESHOLD });
}
