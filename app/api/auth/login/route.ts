import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  verifySecret,
  createSessionToken,
  isBootstrapAdminUsername,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`login:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { identifier, password } = parsed.data;

  const db = await getDb();
  const users = db.collection("users");
  const idLower = identifier.toLowerCase();
  const user = await users.findOne({ $or: [{ usernameLower: idLower }, { emailLower: idLower }] });

  // Constant-shaped response whether or not the user exists, to avoid user enumeration.
  const genericError = NextResponse.json({ error: "Incorrect username/email or password" }, { status: 401 });
  if (!user) return genericError;

  const valid = await verifySecret(password, user.passwordHash);
  if (!valid) return genericError;

  if (user.banned) {
    return NextResponse.json({ error: "This account has been suspended" }, { status: 403 });
  }

  // Bootstrap admin access from an env var the first time a matching username logs in,
  // then persist it — after that, admin status lives entirely in the DB.
  let isAdmin = user.isAdmin === true;
  if (!isAdmin && isBootstrapAdminUsername(user.username)) {
    isAdmin = true;
    await users.updateOne({ _id: user._id }, { $set: { isAdmin: true } });
  }

  const token = await createSessionToken({ userId: user._id.toString(), username: user.username, isAdmin });
  const res = NextResponse.json({ ok: true, username: user.username });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
