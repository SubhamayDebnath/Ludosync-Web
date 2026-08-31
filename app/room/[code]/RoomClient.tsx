"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EngineSocket, type EngineMessage } from "@/lib/engineSocket";
import { getEngineWsUrl } from "@/lib/env";
import {
  getPlayerToken,
  savePlayerToken,
  saveDisplayName,
  getOrCreateDisplayName,
  getSoundPreference,
  setSoundPreference,
} from "@/lib/clientStorage";
import type { GameState, LobbyState } from "@/lib/gameTypes";
import { legalPieceIdsForUi } from "@/lib/clientRules";
import { Board } from "@/components/Board";
import { Dice } from "@/components/Dice";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ConnectionDot, connStateFor } from "@/components/ConnectionDot";
import { ChatPanel, type ChatMsg } from "@/components/ChatPanel";
import { Avatar } from "@/components/Avatar";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToastStack, type ToastItem } from "@/components/ToastStack";
import { sounds } from "@/lib/sounds";

type Phase =
  | "name-entry"
  | "connecting"
  | "connect-error"
  | "lobby"
  | "playing"
  | "finished"
  | "expired"
  | "room-error";

export function RoomClient({ code, userId, defaultName }: { code: string; userId: string | null; defaultName: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("name-entry");
  const [name, setName] = useState(defaultName); // hydration-safe: same value on server & first client render
  const [slow, setSlow] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [selfId, setSelfId] = useState<string | null>(null);
  const [pings, setPings] = useState<Record<string, number>>({});
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollLocked, setRollLocked] = useState(false); // guards against double-click/double-fire
  const [lastMove, setLastMove] = useState<{ pieceId: string; captured?: unknown[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [winnerId, setWinnerId] = useState<string | null>(null);

  const socketRef = useRef<EngineSocket | null>(null);
  const lobbyReceiptRef = useRef<{ serverNow: number; local: number } | null>(null);
  const autoPlayedVersionRef = useRef<number | null>(null);
  const toastIdRef = useRef(0);
  const selfIdRef = useRef<string | null>(null);
  selfIdRef.current = selfId; // handleMessage is captured once at mount; mirror latest selfId via ref

  // Client-only fallback to a remembered guest name, applied AFTER hydration so
  // the server-rendered and first client-rendered HTML always match exactly.
  useEffect(() => {
    setSoundOn(getSoundPreference());
    if (!defaultName) {
      const remembered = getOrCreateDisplayName();
      if (remembered) setName(remembered);
    }
    const existingToken = getPlayerToken(code);
    if (existingToken || defaultName) {
      startConnect(existingToken ?? undefined, defaultName);
    }
    return () => socketRef.current?.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pushToast = useCallback((text: string, tone: ToastItem["tone"] = "muted") => {
    const id = `t${toastIdRef.current++}`;
    setToasts((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    setSoundPreference(next);
  }

  function startConnect(existingToken?: string, nameOverride?: string) {
    const trimmed = (nameOverride ?? name ?? "Player").trim().slice(0, 24) || "Player";
    saveDisplayName(trimmed);
    setPhase("connecting");
    setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 8_000);

    const socket = new EngineSocket({
      wsUrl: getEngineWsUrl(),
      connectTimeoutMs: 10_000,
      overallTimeoutMs: 60_000,
      onMessage: (msg: EngineMessage) => handleMessage(msg),
    });
    socketRef.current = socket;

    socket
      .connect()
      .then(() => {
        socket.send({
          type: "room:join",
          code,
          name: trimmed,
          isGuest: !userId,
          userId,
          playerToken: existingToken,
        });
      })
      .catch(() => {
        clearTimeout(slowTimer);
        setPhase("connect-error");
      });

    setTimeout(() => clearTimeout(slowTimer), 61_000);
  }

  function handleMessage(msg: EngineMessage) {
    switch (msg.type) {
      case "room:joined": {
        setSelfId(msg.playerId as string);
        savePlayerToken(code, msg.playerToken as string);
        const room = msg.room as LobbyState;
        lobbyReceiptRef.current = { serverNow: room.serverTime, local: Date.now() };
        setLobby(room);
        setPhase(room.status === "PLAYING" ? "playing" : "lobby");
        break;
      }
      case "room:state": {
        const room = msg.room as LobbyState;
        lobbyReceiptRef.current = { serverNow: room.serverTime, local: Date.now() };
        setLobby(room);
        break;
      }
      case "game:start":
      case "game:state": {
        const g = msg.game as GameState | null;
        if (g) {
          setGame(g);
          setDice(g.currentDice);
          setRollLocked(false);
          setPhase(g.status === "FINISHED" ? "finished" : "playing");
        }
        if (msg.lastMove) {
          const info = msg.lastMove as { pieceId: string; captured?: unknown[] };
          setLastMove(info);
          if (info.captured && info.captured.length > 0) sounds.capture();
          else sounds.move();
        }
        break;
      }
      case "dice:result": {
        setRolling(true);
        sounds.dice();
        const rolledValue = msg.dice as number;
        const rolledBy = msg.playerId as string;
        setTimeout(() => {
          setDice(rolledValue);
          setRolling(false);
          const who = rolledBy === selfIdRef.current ? "You" : "";
          if (who) pushToast(`🎲 You rolled a ${rolledValue}${rolledValue === 6 ? " — roll again!" : ""}`);
        }, 420);
        break;
      }
      case "move:result": {
        if (msg.ok === false) setRollLocked(false);
        break;
      }
      case "chat:message": {
        setChat((prev) => [...prev, msg.message as ChatMsg]);
        break;
      }
      case "player:ping": {
        setPings((prev) => ({ ...prev, [msg.playerId as string]: msg.pingMs as number }));
        break;
      }
      case "game:finished": {
        setWinnerId(msg.winnerId as string);
        setPhase("finished");
        sounds.win();
        break;
      }
      case "room:expired": {
        setPhase("expired");
        break;
      }
      case "error": {
        setRollLocked(false);
        const isFatal = Boolean(msg.fatal);
        if (isFatal) {
          setErrorMsg(msg.message as string);
        } else {
          pushToast(msg.message as string, "danger");
        }
        break;
      }
      case "__socket_closed": {
        break;
      }
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/room/${code}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const requestDice = useCallback(() => {
    if (rollLocked) return;
    setRollLocked(true);
    socketRef.current?.send({ type: "dice:request" });
    // Safety valve: if no response ever arrives, don't leave the button stuck forever.
    setTimeout(() => setRollLocked(false), 4000);
  }, [rollLocked]);

  const selectPiece = useCallback((pieceId: string) => {
    socketRef.current?.send({ type: "move:request", pieceId });
  }, []);

  function sendChat(text: string) {
    socketRef.current?.send({ type: "chat:send", text });
  }

  function startNow() {
    socketRef.current?.send({ type: "room:start_now" });
  }

  function exitGame() {
    if (!window.confirm("Leave this game? You can rejoin with the room link if it hasn't started.")) return;
    socketRef.current?.send({ type: "room:leave" });
    socketRef.current?.close();
    router.push("/");
  }

  // ---------- Derived turn/legal-move state (used by both render and the effects below) ----------
  const currentPlayer = game?.players[game.turnIndex] ?? null;
  const isMyTurn = !!currentPlayer && currentPlayer.id === selfId;
  const me = game?.players.find((p) => p.id === selfId) ?? null;
  const legalIds = me && isMyTurn && phase === "playing" ? legalPieceIdsForUi(me, dice) : new Set<string>();
  const legalIdsOrdered = me ? me.pieces.filter((p) => legalIds.has(p.id)).map((p) => p.id) : [];

  // Auto-play the only legal move so players aren't forced to click when there's no real choice.
  useEffect(() => {
    if (!game || !isMyTurn || phase !== "playing" || dice === null) return;
    if (legalIdsOrdered.length !== 1) return;
    if (autoPlayedVersionRef.current === game.version) return;
    autoPlayedVersionRef.current = game.version;
    const t = setTimeout(() => selectPiece(legalIdsOrdered[0]), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.version, dice, isMyTurn, phase]);

  // Keyboard: space/enter to roll, 1-4 to pick a piece when it's your move.
  const keyStateRef = useRef({ isMyTurn, dice, legalIdsOrdered, phase, rollLocked });
  keyStateRef.current = { isMyTurn, dice, legalIdsOrdered, phase, rollLocked };
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return; // don't hijack chat typing
      const s = keyStateRef.current;
      if (s.phase !== "playing") return;
      if ((e.code === "Space" || e.key === "Enter") && s.isMyTurn && s.dice === null && !s.rollLocked) {
        e.preventDefault();
        requestDice();
      }
      if (["1", "2", "3", "4"].includes(e.key) && s.isMyTurn && s.dice !== null) {
        const idx = Number(e.key) - 1;
        if (idx < s.legalIdsOrdered.length) selectPiece(s.legalIdsOrdered[idx]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [requestDice, selectPiece]);

  // ---------- Render ----------

  if (phase === "name-entry") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar username={defaultName || null} />
        <main className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="max-w-md w-full mx-auto space-y-6 text-center">
            <h1 className="text-lg tracking-widest text-muted">JOIN ROOM {code}</h1>
            <div className="flex justify-center">
              <Avatar seed={name || "guest"} size="lg" />
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 24))}
              placeholder="Your display name"
              autoFocus
              className="w-full bg-surface2 rounded-full px-4 py-3 text-center outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
            <button
              onClick={() => startConnect()}
              disabled={!name.trim()}
              className="w-full px-6 py-3 rounded-full bg-primary text-background font-semibold hover:opacity-90 transition disabled:opacity-40"
            >
              JOIN
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (phase === "connecting") {
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

  if (phase === "connect-error") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar username={defaultName || null} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full mx-auto text-center space-y-4">
            <h1 className="text-lg tracking-widest text-danger">GAME SERVER UNAVAILABLE</h1>
            <p className="text-sm text-muted">Game server is taking too long to start.</p>
            <button
              onClick={() => startConnect()}
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

  if (phase === "room-error" || errorMsg) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar username={defaultName || null} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full mx-auto text-center space-y-4">
            <h1 className="text-lg tracking-widest text-danger">{errorMsg ?? "Something went wrong"}</h1>
            <Link href="/" className="text-primary underline text-sm">
              Back to home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (phase === "expired") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar username={defaultName || null} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full mx-auto text-center space-y-4">
            <h1 className="text-lg tracking-widest text-danger">ROOM EXPIRED</h1>
            <p className="text-sm text-muted">Not enough players joined before the countdown ended.</p>
            <Link href="/create" className="text-primary underline text-sm">
              Create a new room
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (phase === "lobby" && lobby) {
    const slots = Array.from({ length: lobby.maxPlayers });
    const selfEntry = lobby.players.find((p) => p.id === selfId);
    const isHost = !!selfEntry?.isCreator;
    const canStartNow = isHost && lobby.players.length >= 2;

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar username={defaultName || null} />
        <ToastStack toasts={toasts} />
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full mx-auto space-y-6">
            <h1 className="text-lg tracking-widest text-muted text-center">LUDO ROOM</h1>
            <div className="text-center">
              <p className="text-3xl font-bold tracking-[0.3em] text-primary font-game-mono">{lobby.code}</p>
              <button onClick={copyLink} className="mt-2 text-xs text-secondary underline">
                {copied ? "Copied ✓" : "[ COPY LINK ]"}
              </button>
            </div>

            {lobby.lobbyEndAt && lobbyReceiptRef.current && (
              <div className="text-center">
                <p className="text-xs text-muted">STARTING IN</p>
                <CountdownTimer
                  endAt={lobby.lobbyEndAt}
                  serverNowAtReceipt={lobbyReceiptRef.current.serverNow}
                  receivedAtLocal={lobbyReceiptRef.current.local}
                  className="text-4xl font-bold text-primary"
                />
              </div>
            )}

            <ul className="space-y-2">
              {slots.map((_, i) => {
                const p = lobby.players[i];
                if (!p) {
                  return (
                    <li key={i} className="flex items-center gap-3 text-muted text-sm py-1.5 px-3 rounded-lg bg-surface/50">
                      <span className="h-9 w-9 rounded-full border border-dashed border-muted/50" /> WAITING
                    </li>
                  );
                }
                return (
                  <li key={p.id} className="flex items-center gap-3 text-sm py-1.5 px-3 rounded-lg bg-surface">
                    <Avatar seed={p.id} size="md" ring={p.id === selfId} />
                    <span className={p.id === selfId ? "text-primary font-semibold" : "text-ink"}>
                      {p.id === selfId ? "YOU" : p.name}
                    </span>
                    <span
                      className="ml-auto h-2 w-2 rounded-full"
                      style={{ backgroundColor: p.connected ? "#B8F34A" : "#FF6B6B" }}
                      title={p.connected ? "connected" : "disconnected"}
                    />
                    {p.isCreator && <span className="text-[10px] text-accent">HOST</span>}
                  </li>
                );
              })}
            </ul>

            <p className="text-center text-xs text-muted">
              {lobby.players.length} / {lobby.maxPlayers} PLAYERS
            </p>

            {isHost && (
              <button
                onClick={startNow}
                disabled={!canStartNow}
                className="w-full px-6 py-3 rounded-full bg-primary text-background font-semibold hover:opacity-90 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {canStartNow ? "START NOW" : "NEED 2+ PLAYERS TO START"}
              </button>
            )}

            <button onClick={exitGame} className="w-full text-center text-xs text-muted hover:text-danger transition">
              Leave room
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if ((phase === "playing" || phase === "finished") && game && selfId) {
    const winner = phase === "finished" ? game.players.find((p) => p.id === (winnerId ?? game.winnerId)) : null;

    return (
      <div className="min-h-screen flex flex-col px-3 py-3 sm:px-4 sm:py-4">
        <ToastStack toasts={toasts} />
        <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col gap-3">
          <header className="flex items-center justify-between text-xs gap-2">
            <Link href="/" className="text-primary font-bold tracking-widest">
              🎲 LUDO
            </Link>
            <div className="flex items-center gap-3">
              <button onClick={toggleSound} className="text-muted hover:text-primary" aria-label="Toggle sound">
                {soundOn ? "🔊" : "🔇"}
              </button>
              {me && (
                <ConnectionDot
                  name="YOU"
                  pingMs={pings[me.id] ?? null}
                  state={connStateFor(true, pings[me.id] ?? null)}
                  highlight
                />
              )}
              <button
                onClick={exitGame}
                className="rounded-full border border-danger/50 px-3 py-1 text-danger hover:bg-danger/10 transition"
              >
                EXIT
              </button>
            </div>
          </header>

          {phase === "finished" && winner && (
            <div className="rounded-lg border border-primary bg-surface p-4 text-center space-y-1">
              <p className="text-xs text-muted">GAME OVER</p>
              <p className="text-xl font-bold text-primary">
                {winner.id === selfId ? "YOU WON! 🎉" : `${winner.name} wins`}
              </p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4 flex-1">
            <div className="lg:w-[60%] max-w-xl mx-auto lg:mx-0 w-full">
              <div className="bg-surface rounded-lg p-2 border border-surface2">
                <Board
                  players={game.players}
                  currentColor={currentPlayer?.color ?? null}
                  selectablePieceIds={legalIds}
                  onSelectPiece={selectPiece}
                  lastMoveInfo={lastMove}
                />
              </div>
            </div>

            <div className="lg:w-[40%] w-full flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4 bg-surface rounded-lg p-3 border border-surface2">
                <p className="text-sm">
                  {phase === "finished" ? (
                    <span className="text-muted">Game finished</span>
                  ) : isMyTurn ? (
                    <span className="text-primary font-semibold">YOUR TURN</span>
                  ) : (
                    <span className="text-muted">{currentPlayer?.name}&rsquo;s turn</span>
                  )}
                </p>
                <Dice
                  value={dice}
                  rolling={rolling}
                  onRoll={requestDice}
                  disabled={phase === "finished" || !isMyTurn || rollLocked || (dice !== null && game.diceRolledThisTurn)}
                />
              </div>

              <div className="bg-surface rounded-lg p-3 border border-surface2 space-y-2">
                <p className="text-[10px] text-muted tracking-widest">PLAYERS</p>
                {game.players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <Avatar seed={p.id} size="sm" />
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.connected ? "#B8F34A" : "#FF6B6B" }}
                    />
                    <ConnectionDot
                      name={p.id === selfId ? "YOU" : p.name}
                      pingMs={pings[p.id] ?? null}
                      state={connStateFor(p.connected, pings[p.id] ?? null)}
                      highlight={p.id === currentPlayer?.id}
                    />
                    <span className="ml-auto text-[10px] text-muted">
                      {p.pieces.filter((x) => x.steps === 58).length}/4 home
                    </span>
                  </div>
                ))}
              </div>

              <ChatPanel messages={chat} onSend={sendChat} selfPlayerId={selfId} />

              {phase === "finished" && (
                <Link
                  href="/"
                  className="text-center text-sm text-primary underline rounded-full py-2 bg-surface border border-surface2"
                >
                  Back to home
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-surface2 border-t-primary animate-spin" />
    </main>
  );
}
