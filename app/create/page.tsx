import { getSession } from "@/lib/session";
import { CreateRoomClient } from "./CreateRoomClient";

export default async function CreateRoomPage() {
  const session = await getSession();
  return <CreateRoomClient userId={session?.userId ?? null} defaultName={session?.username ?? ""} />;
}
