import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const session = await getSession();
  if (!session?.isAdmin) redirect("/");

  return <AdminClient username={session.username} />;
}
