import { Box, Paper, Typography } from "@mui/material"
import { COLOR_NAMES, PIECE_COLORS, PIECE_COLOR_ORDER } from "./constants"
import { getPieceCount } from "./logic"
import type { PieceColor, PieceTakingGameState } from "./types"

interface PieceTakingBoardProps {
  gameState: PieceTakingGameState
  onPileSelect: (color: PieceColor) => void
}

function PiecePile({
  color,
  count,
  isSelected,
  onSelect,
}: {
  color: PieceColor
  count: number
  isSelected: boolean
  onSelect: (color: PieceColor) => void
}) {
  const palette = PIECE_COLORS[color]

  return (
    <Box
      onClick={() => onSelect(color)}
      sx={{
        position: "relative",
        minHeight: { xs: 80, sm: 100 },
        border: isSelected ? "2px solid #059669" : "1px solid",
        borderColor: isSelected ? "#059669" : "divider",
        borderRadius: 3,
        backgroundColor: isSelected ? "#ecfdf5" : "#fafaf9",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s ease",
        overflow: "hidden",
        cursor: count > 0 ? "pointer" : "default",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          padding: "6px",
          flex: 1,
          gap: 0.5,
        }}
      >
        {Array.from({ length: Math.min(count, 9) }, (_, index) => (
          <Box
            key={`${color}-${index}`}
            sx={{
              width: { xs: 22, sm: 26 },
              height: { xs: 22, sm: 26 },
              borderRadius: "50%",
              backgroundColor: palette.main,
              boxShadow: `0 2px 4px rgba(0,0,0,0.2), inset 0 -2px 2px ${palette.shadow}, inset 0 2px 2px ${palette.light}`,
            }}
          />
        ))}
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isSelected ? "#059669" : "#9ca3af",
          padding: "2px 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: { xs: "0.7rem", sm: "0.8rem" } }}>
          {COLOR_NAMES[color]} {count}個
        </Typography>
      </Box>
    </Box>
  )
}

export default function PieceTakingBoard({ gameState, onPileSelect }: PieceTakingBoardProps) {
  return (
    <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
          gap: 2,
          mb: 1,
        }}
      >
        {PIECE_COLOR_ORDER.map((color) => (
          <PiecePile
            key={color}
            color={color}
            count={getPieceCount(gameState, color)}
            isSelected={gameState.selectedColor === color}
            onSelect={onPileSelect}
          />
        ))}
      </Box>

      {gameState.lastAIMove && (
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            backgroundColor: "#f9fafb",
            borderRadius: 2,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Box
              component="span"
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: PIECE_COLORS[gameState.lastAIMove.color].main,
                display: "inline-block",
              }}
            />
            AIの手: {COLOR_NAMES[gameState.lastAIMove.color]}から {gameState.lastAIMove.count} 個取りました
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
