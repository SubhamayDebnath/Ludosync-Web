"use client";

export type EngineMessage = { type: string; [key: string]: unknown };

export type ConnectionPhase =
  | "idle"
  | "connecting" // attempting the WebSocket handshake (engine may be cold-starting)
  | "waking" // still retrying after the first attempt failed/timed out
  | "ready" // WebSocket open AND engine:ready received
  | "failed"; // gave up after the overall timeout

interface Options {
  wsUrl: string;
  connectTimeoutMs?: number; // per-attempt timeout (spec section 9: default 10s)
  overallTimeoutMs?: number; // give up after this long (spec section 9: default ~60s)
  retryDelayMs?: number;
  onPhaseChange?: (phase: ConnectionPhase) => void;
  onMessage?: (msg: EngineMessage) => void;
}

/**
 * Wraps the raw WebSocket connection to the engine and enforces the required
 * readiness handshake: an HTTP 200 from /health is NEVER sufficient. Only after
 * the socket is open AND an `engine:ready` message has been received does this
 * client consider the engine usable, and only then should callers send
 * `room:create` / `room:join`.
 */
export class EngineSocket {
  private ws: WebSocket | null = null;
  private phase: ConnectionPhase = "idle";
  private overallDeadline = 0;
  private attemptTimer: ReturnType<typeof setTimeout> | null = null;
  private overallTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByUser = false;

  constructor(private opts: Options) {}

  private setPhase(phase: ConnectionPhase) {
    this.phase = phase;
    this.opts.onPhaseChange?.(phase);
  }

  getPhase(): ConnectionPhase {
    return this.phase;
  }

  /** Starts (or restarts) the connect-with-retry sequence. Resolves once engine:ready is received. */
  connect(): Promise<void> {
    this.closedByUser = false;
    const overallTimeoutMs = this.opts.overallTimeoutMs ?? 60_000;
    this.overallDeadline = Date.now() + overallTimeoutMs;

    return new Promise((resolve, reject) => {
      this.overallTimer = setTimeout(() => {
        if (this.phase !== "ready") {
          this.teardown();
          this.setPhase("failed");
          reject(new Error("timeout"));
        }
      }, overallTimeoutMs);

      this.attempt(resolve, reject, true);
    });
  }

  private attempt(resolve: () => void, reject: (e: Error) => void, isFirst: boolean) {
    if (this.closedByUser) return;
    if (Date.now() >= this.overallDeadline) return; // overall timer will fire the rejection

    this.setPhase(isFirst ? "connecting" : "waking");

    const connectTimeoutMs = this.opts.connectTimeoutMs ?? 10_000;
    const retryDelayMs = this.opts.retryDelayMs ?? 2_000;

    let settled = false;
    const socket = new WebSocket(this.opts.wsUrl);
    this.ws = socket;

    this.attemptTimer = setTimeout(() => {
      if (settled) return;
      settled = true;
      socket.close();
      this.scheduleRetry(resolve, reject, retryDelayMs);
    }, connectTimeoutMs);

    socket.addEventListener("message", (event) => {
      let msg: EngineMessage | null = null;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!msg) return;

      // The realtime readiness handshake: this is the ONLY signal that flips us to "ready".
      if (msg.type === "engine:ready" && this.phase !== "ready") {
        settled = true;
        if (this.attemptTimer) clearTimeout(this.attemptTimer);
        if (this.overallTimer) clearTimeout(this.overallTimer);
        this.setPhase("ready");
        resolve();
      }

      this.opts.onMessage?.(msg);
    });

    socket.addEventListener("error", () => {
      if (settled) return;
      settled = true;
      if (this.attemptTimer) clearTimeout(this.attemptTimer);
      this.scheduleRetry(resolve, reject, retryDelayMs);
    });

    socket.addEventListener("close", () => {
      if (this.phase === "ready" && !this.closedByUser) {
        // Unexpected drop after we were ready; surface via onMessage so callers can show a reconnect UI.
        this.opts.onMessage?.({ type: "__socket_closed" });
      }
    });
  }

  private scheduleRetry(resolve: () => void, reject: (e: Error) => void, delayMs: number) {
    if (this.closedByUser) return;
    if (Date.now() >= this.overallDeadline) return;
    setTimeout(() => this.attempt(resolve, reject, false), delayMs);
  }

  send(msg: EngineMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  close() {
    this.closedByUser = true;
    if (this.attemptTimer) clearTimeout(this.attemptTimer);
    if (this.overallTimer) clearTimeout(this.overallTimer);
    this.teardown();
  }

  private teardown() {
    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      try {
        this.ws.close();
      } catch {
        // ignore
      }
      this.ws = null;
    }
  }
}
