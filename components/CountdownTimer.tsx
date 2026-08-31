"use client";

import { useEffect, useState } from "react";

interface Props {
  endAt: number; // ms epoch, server-issued
  serverNowAtReceipt: number; // ms epoch, server clock at the moment endAt was received
  receivedAtLocal: number; // performance.now()-style local timestamp when it was received
  className?: string;
}

/** Renders MM:SS counting down to `endAt`, computed from server time so device clock skew never matters. */
export function CountdownTimer({ endAt, serverNowAtReceipt, receivedAtLocal, className }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const localElapsed = now - receivedAtLocal;
  const estimatedServerNow = serverNowAtReceipt + localElapsed;
  const remainingMs = Math.max(0, endAt - estimatedServerNow);
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");

  return (
    <span className={`${className ?? ""} font-game-mono`} aria-live="polite">
      {mm}:{ss}
    </span>
  );
}
