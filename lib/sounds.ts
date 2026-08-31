"use client";

import { getSoundPreference } from "./clientStorage";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

function beep(freq: number, durationMs: number, type: OscillatorType = "square", gain = 0.06) {
  if (!getSoundPreference()) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});

  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  osc.connect(g).connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  g.gain.setValueAtTime(gain, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000);
}

export const sounds = {
  dice: () => beep(320, 120, "square", 0.05),
  move: () => beep(520, 80, "triangle", 0.05),
  capture: () => {
    beep(200, 90, "sawtooth", 0.07);
    setTimeout(() => beep(140, 140, "sawtooth", 0.06), 90);
  },
  win: () => {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 160, "square", 0.06), i * 110));
  },
};
