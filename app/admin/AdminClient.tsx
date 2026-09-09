"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

type Tab = "overview" | "rooms" | "users";

interface Stats {
  totalUsers: number;
  totalRankedPlayers: number;
  totalMatchesPlayed: number;
  engine: { totalRooms: number; totalPlayers: number; byStatus: Record<string, number> } | null;
}

interface RoomRow {
  code: string;
  status: string;
  maxPlayers: number;
  playerCount: number;
  connectedCount: number;
  createdAt: number;
  autoCloseAt: number | null;
  players: { id: string; name: string; isGuest: boolean; connected: boolean; pingMs: number | null }[];
}

interface UserRow {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  banned: boolean;
  createdAt: string | null;
  games: number;
  wins: number;
}

const STATUS_COLOR: Record<string, string> = {
  CREATING: "text-muted",
  READY: "text-muted",
  LOBBY: "text-accent",
  STARTING: "text-accent",
  PLAYING: "text-primary",
  FINISHED: "text-secondary",
  EXPIRED: "text-danger",
};

function timeAgo(ms: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export function AdminClient({ username }: { username: string }) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar username={username} />
      <main className="flex-1 px-4 py-8">
        <div className="max-w-5xl w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg tracking-widest text-muted">🛠 ADMIN</h1>
            <div className="flex gap-1 rounded-full bg-surface p-1 border border-surface2">
              {(["overview", "rooms", "users"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase transition ${
                    tab === t ? "bg-primary text-background" : "text-muted hover:text-ink"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {tab === "overview" && <OverviewTab />}
              {tab === "rooms" && <RoomsTab />}
              {tab === "users" && <UsersTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-surface2 bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-2xl font-bold text-primary mt-1">{value}</p>
      {sub && <p className="text-[11px] text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          if (d.error) setError(d.error);
          else setStats(d);
        }
      })
      .catch(() => !cancelled && setError("Failed to load"));
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!stats) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="TOTAL USERS" value={stats.totalUsers} />
        <StatCard label="RANKED PLAYERS" value={stats.totalRankedPlayers} />
        <StatCard label="MATCHES PLAYED" value={stats.totalMatchesPlayed} />
        <StatCard
          label="LIVE ROOMS"
          value={stats.engine?.totalRooms ?? "—"}
          sub={stats.engine ? `${stats.engine.totalPlayers} players connected` : "engine unreachable"}
        />
      </div>
      {stats.engine && (
        <div className="rounded-xl border border-surface2 bg-surface p-4">
          <p className="text-xs text-muted mb-2">ROOMS BY STATUS</p>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(stats.engine.byStatus).map(([status, count]) => (
              <span key={status} className={`text-sm ${STATUS_COLOR[status] ?? "text-ink"}`}>
                {status}: <b>{count}</b>
              </span>
            ))}
            {Object.keys(stats.engine.byStatus).length === 0 && <span className="text-sm text-muted">No active rooms</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function RoomsTab() {
  const [rooms, setRooms] = useState<RoomRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/admin/rooms")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : (setError(null), setRooms(d.rooms))))
      .catch(() => setError("Failed to load"));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function closeRoom(code: string) {
    if (!confirm(`Force-close room ${code}? Everyone inside will be disconnected.`)) return;
    setClosing(code);
    try {
      await fetch(`/api/admin/rooms/${code}/close`, { method: "POST" });
      load();
    } finally {
      setClosing(null);
    }
  }

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!rooms) return <p className="text-sm text-muted">Loading…</p>;
  if (rooms.length === 0) return <p className="text-sm text-muted">No live rooms right now.</p>;

  return (
    <div className="rounded-xl border border-surface2 bg-surface overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] px-4 py-2.5 text-xs text-muted border-b border-surface2">
        <span>CODE</span>
        <span>STATUS</span>
        <span>PLAYERS</span>
        <span>CREATED</span>
        <span />
      </div>
      {rooms.map((r) => (
        <div key={r.code} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-center px-4 py-2.5 text-sm border-b border-surface2/60 last:border-0">
          <span className="font-game-mono">{r.code}</span>
          <span className={STATUS_COLOR[r.status] ?? "text-ink"}>{r.status}</span>
          <span className="text-muted">
            {r.connectedCount}/{r.playerCount} online · {r.playerCount}/{r.maxPlayers} max
          </span>
          <span className="text-muted">{timeAgo(r.createdAt)}</span>
          <button
            onClick={() => closeRoom(r.code)}
            disabled={closing === r.code}
            className="rounded-full border border-danger/60 px-3 py-1 text-xs text-danger hover:bg-danger/10 transition disabled:opacity-50"
          >
            {closing === r.code ? "…" : "Close"}
          </button>
        </div>
      ))}
    </div>
  );
}

function UsersTab() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback((query: string) => {
    fetch(`/api/admin/users?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : (setError(null), setUsers(d.users))))
      .catch(() => setError("Failed to load"));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(q), 250);
    return () => clearTimeout(t);
  }, [q, load]);

  async function toggleBan(u: UserRow) {
    setBusyId(u.id);
    try {
      await fetch(`/api/admin/users/${u.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !u.banned }),
      });
      load(q);
    } finally {
      setBusyId(null);
    }
  }

  async function togglePromote(u: UserRow) {
    setBusyId(u.id);
    try {
      await fetch(`/api/admin/users/${u.id}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !u.isAdmin }),
      });
      load(q);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search username or email…"
        className="w-full bg-surface2 rounded-full px-4 py-2.5 outline-none focus-visible:ring-1 focus-visible:ring-primary"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      {!error && !users && <p className="text-sm text-muted">Loading…</p>}
      {users && users.length === 0 && <p className="text-sm text-muted">No users found.</p>}
      {users && users.length > 0 && (
        <div className="rounded-xl border border-surface2 bg-surface overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1fr_1fr_auto] px-4 py-2.5 text-xs text-muted border-b border-surface2">
            <span>USER</span>
            <span>RECORD</span>
            <span>STATUS</span>
            <span />
          </div>
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-[1.5fr_1fr_1fr_auto] items-center px-4 py-2.5 text-sm border-b border-surface2/60 last:border-0">
              <div className="min-w-0">
                <p className="truncate">{u.username}</p>
                <p className="text-[11px] text-muted truncate">{u.email}</p>
              </div>
              <span className="text-muted">
                {u.wins}W / {u.games}G
              </span>
              <span className="flex gap-1.5">
                {u.isAdmin && <span className="text-[10px] text-accent border border-accent/50 rounded-full px-2 py-0.5">ADMIN</span>}
                {u.banned && <span className="text-[10px] text-danger border border-danger/50 rounded-full px-2 py-0.5">BANNED</span>}
              </span>
              <span className="flex gap-1.5 justify-end">
                <button
                  onClick={() => togglePromote(u)}
                  disabled={busyId === u.id}
                  className="rounded-full border border-secondary/50 px-2.5 py-1 text-[11px] text-secondary hover:bg-secondary/10 transition disabled:opacity-50"
                >
                  {u.isAdmin ? "Demote" : "Promote"}
                </button>
                <button
                  onClick={() => toggleBan(u)}
                  disabled={busyId === u.id}
                  className="rounded-full border border-danger/50 px-2.5 py-1 text-[11px] text-danger hover:bg-danger/10 transition disabled:opacity-50"
                >
                  {u.banned ? "Unban" : "Ban"}
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
