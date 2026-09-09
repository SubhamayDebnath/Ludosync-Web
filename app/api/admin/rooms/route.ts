import { NextResponse } from "next/server";
import { requireAdminSession, engineAdminFetch } from "@/lib/admin";

export async function GET() {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const res = await engineAdminFetch("/rooms");
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: "engine_unreachable" }, { status: 502 });
  }
}
