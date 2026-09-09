import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/admin";

export async function GET(req: NextRequest) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const db = await getDb();
  const filter = q
    ? { $or: [{ usernameLower: { $regex: q } }, { emailLower: { $regex: q } }] }
    : {};

  const users = await db
    .collection("users")
    .find(filter)
    .project({ passwordHash: 0, recoveryCodeHash: 0 })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const stats = await db
    .collection("statistics")
    .find({ userId: { $in: users.map((u) => u._id.toString()) } })
    .toArray();
  const statsByUserId = new Map(stats.map((s) => [s.userId as string, s]));

  const rows = users.map((u) => {
    const s = statsByUserId.get(u._id.toString());
    return {
      id: u._id.toString(),
      username: u.username as string,
      email: u.email as string,
      isAdmin: u.isAdmin === true,
      banned: u.banned === true,
      createdAt: u.createdAt ?? null,
      games: s?.games ?? 0,
      wins: s?.wins ?? 0,
    };
  });

  return NextResponse.json({ users: rows });
}
