import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashSecret, createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`register:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const { username, email, password, recoveryCode } = parsed.data;

  const db = await getDb();
  const users = db.collection("users");

  const existing = await users.findOne({
    $or: [{ usernameLower: username.toLowerCase() }, { emailLower: email.toLowerCase() }],
  });
  if (existing) {
    return NextResponse.json({ error: "Username or email already in use" }, { status: 409 });
  }

  const [passwordHash, recoveryCodeHash] = await Promise.all([
    hashSecret(password),
    hashSecret(recoveryCode),
  ]);

  const now = new Date();
  const result = await users.insertOne({
    username,
    usernameLower: username.toLowerCase(),
    email,
    emailLower: email.toLowerCase(),
    passwordHash,
    recoveryCodeHash,
    createdAt: now,
  });

  const token = await createSessionToken({ userId: result.insertedId.toString(), username });
  const res = NextResponse.json({ ok: true, username });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
