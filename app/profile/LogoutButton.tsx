"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="px-6 py-2.5 rounded-md border border-danger text-danger text-sm font-semibold hover:bg-danger/10 transition"
    >
      LOG OUT
    </button>
  );
}
