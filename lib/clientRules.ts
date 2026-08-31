import type { PlayerState } from "./gameTypes";
import { FINISH_STEP } from "./gameTypes";

/** Mirrors engine/src/game/rules.ts legalMovesForPlayer, but this is UI-only: the engine always re-validates. */
export function legalPieceIdsForUi(player: PlayerState, dice: number | null): Set<string> {
  const ids = new Set<string>();
  if (dice === null) return ids;
  for (const piece of player.pieces) {
    if (piece.steps === FINISH_STEP) continue;
    if (piece.steps === 0) {
      if (dice === 6) ids.add(piece.id);
      continue;
    }
    if (piece.steps + dice <= FINISH_STEP) ids.add(piece.id);
  }
  return ids;
}
