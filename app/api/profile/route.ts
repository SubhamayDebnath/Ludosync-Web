import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const db = await getDb();
  const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

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

  return NextResponse.json({
    username: user.username,
    email: user.email,
    games,
    wins,
    losses,
    winRate,
    recentMatches: recentMatches.map((m) => ({
      id: m._id.toString(),
      roomCode: m.roomCode,
      result: m.result,
      players: m.players,
      finishedAt: m.finishedAt,
    })),
  });
}
