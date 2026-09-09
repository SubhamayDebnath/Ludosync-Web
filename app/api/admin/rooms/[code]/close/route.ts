import { NextResponse } from "next/server";
import { requireAdminSession, engineAdminFetch } from "@/lib/admin";

export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const admin = await requireAdminSession();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { code } = await params;
  try {
    const res = await engineAdminFetch(`/rooms/${encodeURIComponent(code)}/close`, { method: "POST" });
    const body = await res.json();
    return NextResponse.json(body, { status: res.status });
  } catch {
    return NextResponse.json({ error: "engine_unreachable" }, { status: 502 });
  }
}
