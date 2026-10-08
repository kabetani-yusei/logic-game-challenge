import { Box, ButtonBase, Paper, Typography } from "@mui/material"
import { keyframes } from "@mui/material/styles"
import { isPlayableMove } from "./logic"
import type { CellState, Position, StrangeOthelloGameState } from "./types"

const COLUMN_LABELS = ["a", "b", "c", "d", "e", "f"]

const flip = keyframes`
  0% { transform: rotateY(90deg) scale(0.9); }
  100% { transform: rotateY(0deg) scale(1); }
`

const drop = keyframes`
  0% { transform: scale(1.35); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`

const CELL_NAMES: Record<CellState, string> = { empty: "空き", black: "黒", white: "白" }

function containsPosition(positions: Position[], row: number, col: number) {
  return positions.some((position) => position.row === row && position.col === col)
}

function Disc({ color, animation }: { color: "black" | "white"; animation: "flip" | "drop" | null }) {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: "11%",
        borderRadius: "50%",
        background:
          color === "black"
            ? "radial-gradient(circle at 35% 30%, #4a4f63 0%, #16182a 60%, #07080f 100%)"
            : "radial-gradient(circle at 35% 30%, #ffffff 0%, #f1f1ee 55%, #cfcfc8 100%)",
        boxShadow: "0 3px 5px rgba(0,0,0,0.35)",
        animation:
          animation === "flip"
            ? `${flip} 0.35s ease-out both`
            : animation === "drop"
              ? `${drop} 0.25s ease-out both`
              : "none",
      }}
    />
  )
}

interface OthelloBoardProps {
  gameState: StrangeOthelloGameState
  interactive: boolean
  showEvaluation: boolean
  moveEvals: Map<string, number>
  onCellClick: (row: number, col: number) => void
}

export default function OthelloBoard({ gameState, interactive, showEvaluation, moveEvals, onCellClick }: OthelloBoardProps) {
  const size = gameState.board.length

  return (
    <Paper
      sx={{
        p: { xs: 1.25, sm: 2 },
        mx: "auto",
        width: "100%",
        maxWidth: 480,
        bgcolor: "board.line",
        borderColor: "board.line",
        borderRadius: 5,
        boxShadow: "0 18px 40px rgba(16, 48, 32, 0.25)",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `18px repeat(${size}, 1fr)`,
          gridTemplateRows: `18px repeat(${size}, 1fr)`,
          gap: "3px",
        }}
      >
        <Box />
        {COLUMN_LABELS.slice(0, size).map((label) => (
          <Typography key={label} aria-hidden sx={coordinateSx}>
            {label}
          </Typography>
        ))}

        {gameState.board.map((row, rowIndex) => [
          <Typography key={`label-${rowIndex}`} aria-hidden sx={coordinateSx}>
            {rowIndex + 1}
          </Typography>,
          ...row.map((cell, colIndex) => {
            const playable = interactive && isPlayableMove(gameState.validMoves, rowIndex, colIndex)
            const isLastMove = gameState.lastMove?.row === rowIndex && gameState.lastMove?.col === colIndex
            const wasFlipped = containsPosition(gameState.flipped, rowIndex, colIndex)
            const moveEval = showEvaluation && playable ? moveEvals.get(`${rowIndex},${colIndex}`) : undefined
            const coordinate = `${COLUMN_LABELS[colIndex]}${rowIndex + 1}`
            const label = playable
              ? `${coordinate} に置く${moveEval !== undefined ? `（評価値 ${moveEval}）` : ""}`
              : `${coordinate} ${CELL_NAMES[cell]}${isLastMove ? "（直前の手）" : ""}`

            return (
              <ButtonBase
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onCellClick(rowIndex, colIndex)}
                disabled={!playable}
                aria-label={label}
                sx={{
                  position: "relative",
                  aspectRatio: "1 / 1",
                  borderRadius: "6px",
                  bgcolor: "board.felt",
                  transition: "background-color 0.15s ease",
                  "&.Mui-disabled": { pointerEvents: "none" },
                  "&:hover": { bgcolor: "board.feltHover" },
                  "&.Mui-focusVisible": { outline: "3px solid #ffd43b", outlineOffset: -3, zIndex: 1 },
                  "&:hover .ghost": { opacity: 0.45 },
                }}
              >
                {cell !== "empty" && (
                  <Disc
                    key={`${cell}-${wasFlipped ? "flipped" : isLastMove ? "placed" : "static"}`}
                    color={cell}
                    animation={wasFlipped ? "flip" : isLastMove ? "drop" : null}
                  />
                )}

                {isLastMove && (
                  <Box
                    aria-hidden
                    sx={{
                      position: "absolute",
                      width: "16%",
                      height: "16%",
                      borderRadius: "50%",
                      bgcolor: "#ff6b4a",
                      boxShadow: "0 0 0 2px rgba(255,255,255,0.7)",
                      zIndex: 1,
                    }}
                  />
                )}

                {playable && moveEval === undefined && (
                  <>
                    <Box
                      aria-hidden
                      sx={{ position: "absolute", width: "26%", height: "26%", borderRadius: "50%", bgcolor: "board.hint" }}
                    />
                    <Box
                      aria-hidden
                      className="ghost"
                      sx={{
                        position: "absolute",
                        inset: "11%",
                        borderRadius: "50%",
                        bgcolor: "#16182a",
                        opacity: 0,
                        transition: "opacity 0.15s ease",
                      }}
                    />
                  </>
                )}

                {moveEval !== undefined && (
                  <Box
                    aria-hidden
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 999,
                      fontSize: { xs: "0.7rem", sm: "0.8rem" },
                      fontWeight: 800,
                      fontVariantNumeric: "tabular-nums",
                      bgcolor: "rgba(0,0,0,0.55)",
                      color: moveEval > 0 ? "#8ce99a" : moveEval < 0 ? "#ffa8a8" : "#ffe066",
                    }}
                  >
                    {moveEval > 0 ? `+${moveEval}` : moveEval}
                  </Box>
                )}
              </ButtonBase>
            )
          }),
        ])}
      </Box>
    </Paper>
  )
}

const coordinateSx = {
  color: "rgba(255,255,255,0.6)",
  fontSize: "0.7rem",
  fontWeight: 700,
  display: "grid",
  placeItems: "center",
  textTransform: "uppercase",
  userSelect: "none",
} as const
