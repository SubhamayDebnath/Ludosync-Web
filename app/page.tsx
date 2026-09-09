import { getSession } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HomeHero } from "@/components/HomeHero";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar username={session?.username ?? null} isAdmin={session?.isAdmin} />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <HomeHero hasSession={!!session} />
      </main>
      <Footer />
    </div>
  );
}
