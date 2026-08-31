import type { Color } from "@/lib/gameTypes";

export type Cell = [row: number, col: number];

/** The shared 52-square ring, in step order starting at red's entry square (global square 0). */
export const COMMON_PATH: Cell[] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
  [0, 7],
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14],
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7],
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  [7, 0],
  [6, 0],
];

/** Each color's private 6-cell home column, leading from the ring into the center. */
export const HOME_COLUMNS: Record<Color, Cell[]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

export const CENTER: Cell = [7, 7];

/** 4 waiting slots inside each color's yard quadrant. */
export const YARD_SLOTS: Record<Color, Cell[]> = {
  red: [[1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]],
  green: [[1.5, 10.5], [1.5, 12.5], [3.5, 10.5], [3.5, 12.5]],
  yellow: [[10.5, 10.5], [10.5, 12.5], [12.5, 10.5], [12.5, 12.5]],
  blue: [[10.5, 1.5], [10.5, 3.5], [12.5, 1.5], [12.5, 3.5]],
};

export const HOME_QUADRANT: Record<Color, [number, number, number, number]> = {
  red: [0, 0, 6, 6],
  green: [0, 9, 6, 6],
  yellow: [9, 9, 6, 6],
  blue: [9, 0, 6, 6],
};

/** Resolves a piece's board cell (in fractional grid units) for rendering. Yard/finished pieces don't use this directly. */
export function cellForSteps(color: Color, steps: number): Cell {
  if (steps >= 1 && steps <= 52) return COMMON_PATH[(START_INDEX[color] + steps - 1) % 52];
  if (steps >= 53 && steps <= 58) return HOME_COLUMNS[color][steps - 53];
  return CENTER;
}

const START_INDEX: Record<Color, number> = { red: 0, green: 13, yellow: 26, blue: 39 };
