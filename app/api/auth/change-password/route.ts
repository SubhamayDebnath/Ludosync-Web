import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSession } from "@/lib/session";
import { hashSecret, verifySecret } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (!rateLimit(`change-password:${session.userId}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { currentPassword, newPassword } = parsed.data;

  const db = await getDb();
  const users = db.collection("users");
  const user = await users.findOne({ _id: new ObjectId(session.userId) });
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const valid = await verifySecret(currentPassword, user.passwordHash);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });

  const passwordHash = await hashSecret(newPassword);
  await users.updateOne({ _id: user._id }, { $set: { passwordHash } });

  return NextResponse.json({ ok: true });
}
