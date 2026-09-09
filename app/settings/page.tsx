import { getSession } from "@/lib/session";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getSession();
  return <SettingsClient username={session?.username ?? null} isAdmin={session?.isAdmin ?? false} />;
}
