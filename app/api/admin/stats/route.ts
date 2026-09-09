import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdminSession, engineAdminFetch } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = await getDb();
  const [totalUsers, totalRankedPlayers, matchAggregate] = await Promise.all([
    db.collection("users").countDocuments({}),
    db.collection("statistics").countDocuments({ games: { $gte: 1 } }),
    db
      .collection("recentMatches")
      .aggregate([{ $group: { _id: { roomCode: "$roomCode", finishedAt: "$finishedAt" } } }, { $count: "total" }])
      .toArray(),
  ]);
  const totalMatchesPlayed = matchAggregate[0]?.total ?? 0;

  let engine: { totalRooms: number; totalPlayers: number; byStatus: Record<string, number> } | null = null;
  try {
    const engineRes = await engineAdminFetch("/stats");
    if (engineRes.ok) engine = await engineRes.json();
  } catch {
    engine = null; // engine unreachable — still return DB stats
  }

  return NextResponse.json({ totalUsers, totalRankedPlayers, totalMatchesPlayed, engine });
}
