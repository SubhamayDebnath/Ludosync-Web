import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashSecret, verifySecret } from "@/lib/auth";
import { forgotPasswordSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`forgot:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { identifier, recoveryCode, newPassword } = parsed.data;

  const db = await getDb();
  const users = db.collection("users");
  const idLower = identifier.toLowerCase();
  const user = await users.findOne({ $or: [{ usernameLower: idLower }, { emailLower: idLower }] });

  const genericError = NextResponse.json({ error: "Recovery details did not match" }, { status: 401 });
  if (!user) return genericError;

  const validCode = await verifySecret(recoveryCode, user.recoveryCodeHash);
  if (!validCode) return genericError;

  const newHash = await hashSecret(newPassword);
  await users.updateOne({ _id: user._id }, { $set: { passwordHash: newHash } });

  return NextResponse.json({ ok: true });
}
