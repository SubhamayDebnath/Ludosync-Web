"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EngineSocket, type EngineMessage } from "@/lib/engineSocket";
import { getEngineWsUrl } from "@/lib/env";
import { savePlayerToken, saveDisplayName } from "@/lib/clientStorage";
import { randomGuestName } from "@/lib/randomName";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";

type Stage = "form" | "connecting" | "ready-error";

export function CreateRoomClient({ userId, defaultName }: { userId: string | null; defaultName: string }) {
  const router = useRouter();
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(4);
  const [name, setName] = useState(() => defaultName || randomGuestName());
  const [stage, setStage] = useState<Stage>("form");
  const [slow, setSlow] = useState(false);
  const socketRef = useRef<EngineSocket | null>(null);

  function startCreate() {
    const trimmed = name.trim() || "Player";
    saveDisplayName(trimmed);
    setStage("connecting");
    setSlow(false);

    const slowTimer = setTimeout(() => setSlow(true), 8_000);

    const socket = new EngineSocket({
      wsUrl: getEngineWsUrl(),
      connectTimeoutMs: 10_000,
      overallTimeoutMs: 60_000,
      onMessage: (msg: EngineMessage) => {
        if (msg.type === "room:created") {
          clearTimeout(slowTimer);
          const code = msg.code as string;
          const playerToken = msg.playerToken as string;
          savePlayerToken(code, playerToken);
          router.push(`/room/${code}`);
        }
      },
    });
    socketRef.current = socket;

    socket
      .connect()
      .then(() => {
        // Only now — after a real WebSocket connection AND engine:ready — do we ask for a room.
        socket.send({ type: "room:create", maxPlayers, name: trimmed, isGuest: !userId, userId });
      })
      .catch(() => {
        clearTimeout(slowTimer);
        setStage("ready-error");
      });
  }

  function retry() {
    socketRef.current?.close();
    setStage("form");
  }

  if (stage === "connecting") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar username={defaultName || null} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full mx-auto text-center space-y-4">
            <h1 className="text-lg tracking-widest text-muted">STARTING GAME SERVER</h1>
            <div className="flex justify-center py-6">
              <div className="h-10 w-10 rounded-full border-2 border-surface2 border-t-primary animate-spin" />
            </div>
            <p className="text-sm text-ink">{slow ? "Still connecting…" : "Connecting…"}</p>
            {slow && <p className="text-xs text-muted">The game server is waking up. This can take up to a minute.</p>}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (stage === "ready-error") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar username={defaultName || null} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full mx-auto text-center space-y-4">
            <h1 className="text-lg tracking-widest text-danger">GAME SERVER UNAVAILABLE</h1>
            <p className="text-sm text-muted">Game server is taking too long to start.</p>
            <button
              onClick={retry}
              className="mt-4 px-6 py-3 rounded-full bg-primary text-background font-semibold hover:opacity-90"
            >
              TRY AGAIN
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar username={defaultName || null} />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full mx-auto space-y-8">
          <h1 className="text-lg tracking-widest text-muted text-center">CREATE ROOM</h1>

          <div className="flex justify-center">
            <Avatar seed={name || "player"} size="lg" />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-xs text-muted block">
              YOUR NAME
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 24))}
              placeholder="Player"
              maxLength={24}
              className="w-full bg-surface2 rounded-full px-4 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted text-center">PLAYERS</p>
            <div className="flex gap-3 justify-center">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setMaxPlayers(n as 2 | 3 | 4)}
                  className={`h-14 w-14 rounded-xl border-2 font-semibold text-lg transition ${
                    maxPlayers === n
                      ? "border-primary bg-primary/10 text-primary scale-105"
                      : "border-surface2 text-muted hover:border-secondary"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-muted">
              You control when it starts — hit &ldquo;Start Now&rdquo; once 2+ players have joined. Idle
              rooms auto-close after 10 minutes.
            </p>
          </div>

          <button
            onClick={startCreate}
            className="w-full px-6 py-3.5 rounded-full bg-primary text-background font-semibold hover:opacity-90 transition"
          >
            🎲 CREATE ROOM
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
