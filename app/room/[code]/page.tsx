import { getSession } from "@/lib/session";
import { RoomClient } from "./RoomClient";

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await getSession();
  return (
    <RoomClient
      code={code.toUpperCase()}
      userId={session?.userId ?? null}
      defaultName={session?.username ?? ""}
    />
  );
}
