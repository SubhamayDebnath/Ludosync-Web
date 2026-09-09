"use client";

import { motion } from "framer-motion";
import { COLOR_HEX, COLOR_HEX_DARK, SAFE_SQUARES, type Color, type PlayerState } from "@/lib/gameTypes";
import { COMMON_PATH, HOME_COLUMNS, HOME_QUADRANT, YARD_SLOTS, cellForSteps } from "./boardGeometry";

const CELL = 40;
const SIZE = CELL * 15;
const COLORS: Color[] = ["red", "green", "yellow", "blue"];

function toXY([row, col]: [number, number]) {
  return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 };
}

interface Props {
  players: PlayerState[];
  currentColor: Color | null;
  selectablePieceIds: Set<string>;
  onSelectPiece: (pieceId: string) => void;
  lastMoveInfo?: { pieceId: string; captured?: unknown[] } | null;
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
    [-7, -7],
    [7, -7],
    [-7, 7],
    [7, 7],
  ];

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-auto select-none" role="img" aria-label="Ludo board">
      <defs>
        {COLORS.map((color) => (
          <radialGradient key={color} id={`piece-${color}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85} />
            <stop offset="35%" stopColor={COLOR_HEX[color]} />
            <stop offset="100%" stopColor={COLOR_HEX_DARK[color]} />
          </radialGradient>
        ))}
        <radialGradient id="center-glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#F2F4EC" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#F2F4EC" stopOpacity={0} />
        </radialGradient>
      </defs>

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
              opacity={0.16}
              stroke={COLOR_HEX[color]}
              strokeOpacity={0.7}
              strokeWidth={2}
              rx={6}
            />
            <rect
              x={(c + 1) * CELL}
              y={(r + 1) * CELL}
              width={(w - 2) * CELL}
              height={(h - 2) * CELL}
              fill="#1D221F"
              stroke={COLOR_HEX[color]}
              strokeWidth={2.5}
              rx={12}
            />
            {/* 4 subtle yard-slot wells so waiting pieces look "docked" rather than floating */}
            {YARD_SLOTS[color].map(([row, col], i) => {
              const { x, y } = toXY([row, col]);
              return <circle key={i} cx={x} cy={y} r={13} fill={COLOR_HEX[color]} opacity={0.14} />;
            })}
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
            fill={isSafe ? "#232A24" : idx % 2 === 0 ? "#1B211D" : "#181D19"}
            stroke="#33392f"
            strokeWidth={1}
          />
        );
      })}
      {COMMON_PATH.map(([row, col], idx) =>
        SAFE_SQUARES.includes(idx) ? (
          <g key={`star-${idx}`}>
            <circle cx={col * CELL + CELL / 2} cy={row * CELL + CELL / 2} r={15} fill="#B8F34A" opacity={0.12} />
            <text
              x={col * CELL + CELL / 2}
              y={row * CELL + CELL / 2 + 6}
              textAnchor="middle"
              fontSize={17}
              fill="#B8F34A"
              opacity={0.85}
            >
              ★
            </text>
          </g>
        ) : null,
      )}

      {/* Home columns — each color's private lane into the center */}
      {(Object.keys(HOME_COLUMNS) as Color[]).map((color) =>
        HOME_COLUMNS[color].map(([row, col], i) => {
          const isFinalCell = i === HOME_COLUMNS[color].length - 1;
          return (
            <g key={`${color}-home-${i}`}>
              <rect
                x={col * CELL + 1}
                y={row * CELL + 1}
                width={CELL - 2}
                height={CELL - 2}
                fill={COLOR_HEX[color]}
                opacity={isFinalCell ? 0.5 : 0.3}
                stroke={COLOR_HEX[color]}
                strokeOpacity={0.7}
                strokeWidth={isFinalCell ? 2 : 1}
                rx={4}
              />
              {isFinalCell && (
                <text
                  x={col * CELL + CELL / 2}
                  y={row * CELL + CELL / 2 + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fill="#0D0F0E"
                  opacity={0.5}
                >
                  🏠
                </text>
              )}
            </g>
          );
        }),
      )}

      {/* Center finish rosette — four glossy triangles meeting at a raised hub, not a flat cross */}
      <g>
        <polygon
          points={`${7 * CELL},${7 * CELL} ${8 * CELL},${7 * CELL} ${7.5 * CELL},${7.5 * CELL}`}
          fill={COLOR_HEX.green}
        />
        <polygon
          points={`${8 * CELL},${7 * CELL} ${8 * CELL},${8 * CELL} ${7.5 * CELL},${7.5 * CELL}`}
          fill={COLOR_HEX.yellow}
        />
        <polygon
          points={`${8 * CELL},${8 * CELL} ${7 * CELL},${8 * CELL} ${7.5 * CELL},${7.5 * CELL}`}
          fill={COLOR_HEX.blue}
        />
        <polygon
          points={`${7 * CELL},${8 * CELL} ${7 * CELL},${7 * CELL} ${7.5 * CELL},${7.5 * CELL}`}
          fill={COLOR_HEX.red}
        />
        <rect x={7 * CELL} y={7 * CELL} width={CELL} height={CELL} fill="none" stroke="#0D0F0E" strokeWidth={2} />
        <circle cx={7.5 * CELL} cy={7.5 * CELL} r={CELL * 0.34} fill="url(#center-glow)" />
        <circle cx={7.5 * CELL} cy={7.5 * CELL} r={CELL * 0.16} fill="#0D0F0E" stroke="#F2F4EC" strokeWidth={1.5} />
        <text x={7.5 * CELL} y={7.5 * CELL + 5} textAnchor="middle" fontSize={13}>
          🏁
        </text>
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
          const justCaptured = justMoved && (lastMoveInfo?.captured?.length ?? 0) > 0;

          const group = cellGroups.get(`${cell[0]},${cell[1]}`) ?? [];
          const isStacked = group.length > 1;
          const posInGroup = group.findIndex((g) => g.piece.id === piece.id);
          const [ox, oy] = isStacked ? CLUSTER_OFFSETS[posInGroup % CLUSTER_OFFSETS.length] : [0, 0];
          const hotkey = isSelectable ? ++hotkeyCounter : null;

          return (
            <motion.g
              key={piece.id}
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
              initial={false}
              animate={{ x: x + ox, y: y + oy }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              {isSelectable && (
                <motion.circle
                  r={15}
                  fill="none"
                  stroke="#B8F34A"
                  strokeWidth={2.5}
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                />
              )}
              {isStacked && group.length > 2 && posInGroup === 0 && (
                <circle r={17} fill="none" stroke="#F2F4EC" strokeOpacity={0.25} strokeWidth={1} strokeDasharray="2 2" />
              )}
              <motion.circle
                r={11}
                fill={`url(#piece-${player.color})`}
                stroke={isCurrentTurnColor ? "#F2F4EC" : "#0D0F0E"}
                strokeWidth={isCurrentTurnColor ? 2 : 1.5}
                animate={justCaptured ? { scale: [1, 1.5, 1] } : justMoved ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
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
            </motion.g>
          );
        });
      })}
    </svg>
  );
}
