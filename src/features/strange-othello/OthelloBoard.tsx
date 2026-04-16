import { Box, Paper, Typography } from "@mui/material"
import { isPlayableMove } from "./logic"
import type { StrangeOthelloGameState } from "./types"

interface OthelloBoardProps {
  gameState: StrangeOthelloGameState
  showEvaluation: boolean
  moveEvals: Map<string, number>
  onCellClick: (row: number, col: number) => void
}

export default function OthelloBoard({ gameState, showEvaluation, moveEvals, onCellClick }: OthelloBoardProps) {
  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        border: "1px solid",
        borderColor: "divider",
        width: { xs: "100%", sm: "320px" },
        mx: "auto",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {gameState.board.map((row, rowIndex) => (
          <Box key={`row-${rowIndex}`} sx={{ display: "flex", flexDirection: "row" }}>
            {row.map((cell, colIndex) => {
              const isValidMove =
                gameState.currentTurn === "black" && isPlayableMove(gameState.validMoves, rowIndex, colIndex)
              const moveEval = showEvaluation ? moveEvals.get(`${rowIndex},${colIndex}`) : undefined

              return (
                <Box
                  key={`cell-${rowIndex}-${colIndex}`}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                  sx={{
                    width: "16.666%",
                    paddingTop: "16.666%",
                    position: "relative",
                    backgroundColor: "#2d6a4f",
                    border: "1px solid #40916c",
                    cursor: isValidMove ? "pointer" : "default",
                    "&:hover": {
                      backgroundColor: isValidMove ? "#1b4332" : "#2d6a4f",
                    },
                    ...(isValidMove && !showEvaluation
                      ? {
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "30%",
                            height: "30%",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 255, 255, 0.25)",
                          },
                        }
                      : {}),
                  }}
                >
                  {cell !== "empty" && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "10%",
                        left: "10%",
                        width: "80%",
                        height: "80%",
                        borderRadius: "50%",
                        backgroundColor: cell === "black" ? "#1a1a2e" : "#f5f5f5",
                        border: cell === "white" ? "1.5px solid #d1d5db" : "none",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    />
                  )}
                  {showEvaluation && isValidMove && moveEval !== undefined && (
                    <Typography
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: moveEval > 0 ? "#a7f3d0" : moveEval < 0 ? "#fca5a5" : "#fde68a",
                        textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                        zIndex: 1,
                        lineHeight: 1,
                      }}
                    >
                      {moveEval > 0 ? `+${moveEval}` : moveEval}
                    </Typography>
                  )}
                </Box>
              )
            })}
          </Box>
        ))}
      </Box>
    </Paper>
  )
}
