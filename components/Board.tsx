"use client";

import { COLOR_HEX, SAFE_SQUARES, type Color, type PlayerState } from "@/lib/gameTypes";
import { COMMON_PATH, HOME_COLUMNS, HOME_QUADRANT, YARD_SLOTS, cellForSteps } from "./boardGeometry";

const CELL = 40;
const SIZE = CELL * 15;

function toXY([row, col]: [number, number]) {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

interface Props {
  players: PlayerState[];
  currentColor: Color | null;
  selectablePieceIds: Set<string>;
  onSelectPiece: (pieceId: string) => void;
  lastMoveInfo?: { pieceId: string } | null;
}

export function Board({ players, currentColor, selectablePieceIds, onSelectPiece, lastMoveInfo }: Props) {
  // Group pieces sharing a board cell so we can render a small offset cluster instead of full overlap.
  const cellGroups = new Map<string, { player: PlayerState; piece: PlayerState["pieces"][number] }[]>();
  for (const player of players) {
    for (let i = 0; i < player.pieces.length; i++) {
      const piece = player.pieces[i];
      const isYard = piece.steps === 0;
      const cell = isYard ? YARD_SLOTS[player.color][i] : cellForSteps(player.color, piece.steps);
      const key = `${cell[0]},${cell[1]}`;
      const list = cellGroups.get(key) ?? [];
      list.push({ player, piece });
      cellGroups.set(key, list);
    }
  }

  const CLUSTER_OFFSETS: [number, number][] = [
    [0, 0],
    [-8, -8],
    [8, -8],
    [-8, 8],
    [8, 8],
  ];

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto select-none" role="img" aria-label="Ludo board">
      <rect x={0} y={0} width={SIZE} height={SIZE} fill="#12151300" rx={8} />

      {/* Home yard quadrants */}
      {(Object.keys(HOME_QUADRANT) as Color[]).map((color) => {
        const [r, c, h, w] = HOME_QUADRANT[color];
        return (
          <g key={color}>
            <rect
              x={c * CELL}
              y={r * CELL}
              width={w * CELL}
              height={h * CELL}
              fill={COLOR_HEX[color]}
              opacity={0.1}
              stroke={COLOR_HEX[color]}
              strokeOpacity={0.55}
              strokeWidth={1.5}
              rx={4}
            />
            <rect
              x={(c + 1) * CELL}
              y={(r + 1) * CELL}
              width={(w - 2) * CELL}
              height={(h - 2) * CELL}
              fill="#1D221F"
              stroke={COLOR_HEX[color]}
              strokeWidth={2}
              rx={10}
            />
          </g>
        );
      })}

      {/* Common ring cells */}
      {COMMON_PATH.map(([row, col], idx) => {
        const isSafe = SAFE_SQUARES.includes(idx);
        return (
          <rect
            key={`ring-${idx}`}
            x={col * CELL}
            y={row * CELL}
            width={CELL}
            height={CELL}
            fill={isSafe ? "#1D221F" : "#171B18"}
            stroke="#33392f"
            strokeWidth={1}
          />
        );
      })}
      {COMMON_PATH.map(([row, col], idx) =>
        SAFE_SQUARES.includes(idx) ? (
          <text
            key={`star-${idx}`}
            x={col * CELL + CELL / 2}
            y={row * CELL + CELL / 2 + 5}
            textAnchor="middle"
            fontSize={16}
            fill="#B8F34A"
            opacity={0.65}
          >
            ★
          </text>
        ) : null,
      )}

      {/* Home columns — each color's private lane into the center */}
      {(Object.keys(HOME_COLUMNS) as Color[]).map((color) =>
        HOME_COLUMNS[color].map(([row, col], i) => (
          <rect
            key={`${color}-home-${i}`}
            x={col * CELL + 1}
            y={row * CELL + 1}
            width={CELL - 2}
            height={CELL - 2}
            fill={COLOR_HEX[color]}
            opacity={0.32}
            stroke={COLOR_HEX[color]}
            strokeOpacity={0.5}
            strokeWidth={1}
            rx={3}
          />
        )),
      )}

      {/* Center finish pinwheel */}
      <g>
        <polygon points={`${7*CELL},${7*CELL} ${8*CELL},${7*CELL} ${7.5*CELL},${7.5*CELL}`} fill={COLOR_HEX.green} opacity={0.85} />
        <polygon points={`${8*CELL},${7*CELL} ${8*CELL},${8*CELL} ${7.5*CELL},${7.5*CELL}`} fill={COLOR_HEX.yellow} opacity={0.85} />
        <polygon points={`${8*CELL},${8*CELL} ${7*CELL},${8*CELL} ${7.5*CELL},${7.5*CELL}`} fill={COLOR_HEX.blue} opacity={0.85} />
        <polygon points={`${7*CELL},${8*CELL} ${7*CELL},${7*CELL} ${7.5*CELL},${7.5*CELL}`} fill={COLOR_HEX.red} opacity={0.85} />
        <rect x={7*CELL} y={7*CELL} width={CELL} height={CELL} fill="none" stroke="#0D0F0E" strokeWidth={1.5} />
      </g>

      {/* Pieces — a running counter (not the piece's absolute index) assigns hotkeys 1-4,
          so the number shown on a piece always matches the keyboard digit that selects it. */}
      {players.map((player) => {
        let hotkeyCounter = 0;
        return player.pieces.map((piece, i) => {
          const isSelectable = selectablePieceIds.has(piece.id);
          const isYard = piece.steps === 0;
          const cell = isYard ? YARD_SLOTS[player.color][i] : cellForSteps(player.color, piece.steps);
          const { x, y } = toXY(cell);
          const isCurrentTurnColor = currentColor === player.color;
          const justMoved = lastMoveInfo?.pieceId === piece.id;

          const group = cellGroups.get(`${cell[0]},${cell[1]}`) ?? [];
          const isStacked = group.length > 1;
          const posInGroup = group.findIndex((g) => g.piece.id === piece.id);
          const [ox, oy] = isStacked ? CLUSTER_OFFSETS[posInGroup % CLUSTER_OFFSETS.length] : [0, 0];
          const hotkey = isSelectable ? ++hotkeyCounter : null;

          return (
            <g
              key={piece.id}
              transform={`translate(${x + ox}, ${y + oy})`}
              onClick={() => isSelectable && onSelectPiece(piece.id)}
              onKeyDown={(e) => {
                if (isSelectable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onSelectPiece(piece.id);
                }
              }}
              tabIndex={isSelectable ? 0 : undefined}
              className={isSelectable ? "cursor-pointer focus-visible:outline-none" : ""}
              role={isSelectable ? "button" : undefined}
              aria-label={isSelectable ? `Move ${player.color} piece (press ${hotkey})` : undefined}
            >
              {isSelectable && <circle r={14} fill="none" stroke="#B8F34A" strokeWidth={2.5} className="animate-pulse" />}
              {isStacked && group.length > 2 && posInGroup === 0 && (
                <circle r={16} fill="none" stroke="#F2F4EC" strokeOpacity={0.25} strokeWidth={1} strokeDasharray="2 2" />
              )}
              <circle
                r={10}
                fill={COLOR_HEX[player.color]}
                stroke={isCurrentTurnColor ? "#F2F4EC" : "#0D0F0E"}
                strokeWidth={isCurrentTurnColor ? 2 : 1.5}
                className={justMoved ? "animate-piece-move" : ""}
              />
              {piece.steps === 58 && (
                <text textAnchor="middle" y={4} fontSize={10} fill="#0D0F0E" fontWeight="bold">
                  ✓
                </text>
              )}
              {hotkey && (
                <>
                  <circle cx={9} cy={-9} r={7} fill="#0D0F0E" stroke="#B8F34A" strokeWidth={1} />
                  <text x={9} y={-6} textAnchor="middle" fontSize={9} fill="#B8F34A" fontWeight="bold">
                    {hotkey}
                  </text>
                </>
              )}
            </g>
          );
        });
      })}
    </svg>
  );
}
