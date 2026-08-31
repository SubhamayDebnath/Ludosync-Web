"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar";

export interface ChatMsg {
  id: string;
  playerId: string;
  name: string;
  text: string;
  ts: number;
}

export function ChatPanel({
  messages,
  onSend,
  selfPlayerId,
}: {
  messages: ChatMsg[];
  onSend: (text: string) => void;
  selfPlayerId: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend(text.slice(0, 150));
    setDraft("");
  }

  return (
    <div className="border border-surface2 rounded-lg bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-muted"
        aria-expanded={open}
      >
        <span>💬 CHAT {messages.length > 0 ? `(${messages.length})` : ""}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="border-t border-surface2">
          <div ref={listRef} className="max-h-48 overflow-y-auto px-3 py-3 space-y-2 text-sm">
            {messages.length === 0 && <p className="text-muted text-xs text-center py-2">No messages yet — say hi 👋</p>}
            {messages.map((m) => {
              const isSelf = m.playerId === selfPlayerId;
              return (
                <div key={m.id} className={`flex items-end gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar seed={m.playerId} size="sm" />
                  <div className={`flex flex-col ${isSelf ? "items-end" : "items-start"} max-w-[75%]`}>
                    {!isSelf && <span className="text-[10px] text-muted px-1 mb-0.5">{m.name}</span>}
                    <span
                      className={`rounded-2xl px-3 py-1.5 text-sm break-words ${
                        isSelf ? "bg-primary text-background rounded-br-sm" : "bg-surface2 text-ink rounded-bl-sm"
                      }`}
                    >
                      {m.text}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={submit} className="flex gap-2 border-t border-surface2 p-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 150))}
              maxLength={150}
              placeholder="Say something…"
              className="flex-1 bg-surface2 rounded-full px-3 py-1.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-primary"
              aria-label="Chat message"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-primary text-background text-sm font-semibold disabled:opacity-40"
              disabled={!draft.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
