import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAdminSession } from "@/lib/admin";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  if (id === admin.userId) {
    return NextResponse.json({ error: "You can't ban your own account" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const banned = body.banned !== false; // default: ban

  const db = await getDb();
  const result = await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: { banned } });
  if (result.matchedCount === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ ok: true, banned });
}
