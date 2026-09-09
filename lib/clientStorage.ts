import { randomGuestName } from "./randomName";

const TOKEN_PREFIX = "ludo:playerToken:";
const SOUND_KEY = "ludo:soundEnabled";

export function savePlayerToken(roomCode: string, playerToken: string) {
  try {
    sessionStorage.setItem(TOKEN_PREFIX + roomCode, playerToken);
  } catch {
    // storage unavailable (e.g. private mode) — reconnect will just create a fresh seat
  }
}

export function getPlayerToken(roomCode: string): string | null {
  try {
    return sessionStorage.getItem(TOKEN_PREFIX + roomCode);
  } catch {
    return null;
  }
}

export function getSoundPreference(): boolean {
  try {
    const v = localStorage.getItem(SOUND_KEY);
    return v === null ? true : v === "1";
  } catch {
    return true;
  }
}

export function setSoundPreference(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, enabled ? "1" : "0");
  } catch {
    // ignore
  }
}

/** Returns the guest's remembered display name, assigning and persisting a fun random
 * one (e.g. "Sizzling Cobra 42") the very first time — so nobody ever has to pick a name. */
export function getOrCreateDisplayName(): string {
  try {
    const existing = localStorage.getItem("ludo:displayName");
    if (existing) return existing;
    const generated = randomGuestName();
    localStorage.setItem("ludo:displayName", generated);
    return generated;
  } catch {
    return randomGuestName();
  }
}

export function saveDisplayName(name: string) {
  try {
    localStorage.setItem("ludo:displayName", name);
  } catch {
    // ignore
  }
}
