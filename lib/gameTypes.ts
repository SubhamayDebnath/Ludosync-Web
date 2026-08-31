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
  red: "#FF6B6B",
  green: "#B8F34A",
  yellow: "#FFB454",
  blue: "#7FB8FF",
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
  lobbyEndAt: number | null;
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
