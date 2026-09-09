export type Color = "red" | "green" | "yellow" | "blue";

export const START_OFFSET: Record<Color, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export const SAFE_SQUARES = [0, 8, 13, 21, 26, 34, 39, 47];
export const FINISH_STEP = 58;

export const COLOR_HEX: Record<Color, string> = {
  red: "#FF4D5E",
  green: "#22C55E",
  yellow: "#FFD53E",
  blue: "#3FA9F5",
};

/** Deeper shade of each color, used for strokes/gradients so pieces read as glossy, not flat. */
export const COLOR_HEX_DARK: Record<Color, string> = {
  red: "#B8222F",
  green: "#0F7A3B",
  yellow: "#D69C00",
  blue: "#1667B5",
};

export interface Piece {
  id: string;
  color: Color;
  steps: number;
}

export interface PlayerState {
  id: string;
  color: Color;
  name: string;
  isGuest: boolean;
  userId: string | null;
  connected: boolean;
  pieces: Piece[];
  finished: boolean;
  /** True once this seat has been permanently removed (quit, or never reconnected in time). */
  left: boolean;
}

export type RoomStatus = "CREATING" | "READY" | "LOBBY" | "STARTING" | "PLAYING" | "FINISHED" | "EXPIRED";

export interface GameState {
  status: RoomStatus;
  players: PlayerState[];
  turnIndex: number;
  currentDice: number | null;
  diceRolledThisTurn: boolean;
  consecutiveSixes: number;
  winnerId: string | null;
  version: number;
  /** Non-null while paused waiting for a disconnected player to reconnect — nobody can roll. */
  waitingForPlayerId: string | null;
}

export interface LobbyPlayer {
  id: string;
  name: string;
  isGuest: boolean;
  connected: boolean;
  isCreator: boolean;
}

export interface LobbyState {
  code: string;
  status: RoomStatus;
  maxPlayers: number;
  lobbyStartAt: number | null;
  /** When an un-started room auto-closes if the host hasn't hit Start by then. */
  autoCloseAt: number | null;
  serverTime: number;
  players: LobbyPlayer[];
}

export function globalSquare(color: Color, steps: number): number {
  const offset = START_OFFSET[color];
  return (offset + (steps - 1)) % 52;
}

export function isOnCommonTrack(steps: number): boolean {
  return steps >= 1 && steps <= 52;
}
