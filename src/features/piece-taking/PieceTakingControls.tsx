import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward } from "@mui/icons-material"
import { Box, Button, IconButton, Paper, Typography } from "@mui/material"
import { PIECE_COLORS } from "./constants"
import type { PieceColor, PieceTakingTurn } from "./types"

interface PieceTakingControlsProps {
  currentTurn: PieceTakingTurn
  selectedColor: PieceColor
  selectedCount: number
  availableColorCount: number
  maxSelectableCount: number
  onNextColor: () => void
  onPrevColor: () => void
  onIncreaseCount: () => void
  onDecreaseCount: () => void
  onConfirmMove: () => void
}

export default function PieceTakingControls({
  currentTurn,
  selectedColor,
  selectedCount,
  availableColorCount,
  maxSelectableCount,
  onNextColor,
  onPrevColor,
  onIncreaseCount,
  onDecreaseCount,
  onConfirmMove,
}: PieceTakingControlsProps) {
  if (currentTurn === "ai") {
    return (
      <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ textAlign: "center", py: 2 }}>
          <Typography variant="body1" sx={{ color: "text.primary", mb: 1.5 }}>
            AIの番です...
          </Typography>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              margin: "0 auto",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "3px solid #2d3142",
                borderTopColor: "transparent",
                animation: "spin 1s linear infinite",
              },
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
        </Box>
      </Paper>
    )
  }

  return (
    <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1,
            backgroundColor: "#f9fafb",
            borderRadius: 2,
            justifyContent: "center",
          }}
        >
          <IconButton onClick={onPrevColor} size="small" disabled={availableColorCount <= 1} sx={{ p: 0.5 }}>
            <ArrowBack fontSize="small" sx={{ color: "text.secondary" }} />
          </IconButton>

          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: PIECE_COLORS[selectedColor].main,
              mx: 2.5,
              boxShadow: `0 2px 6px ${PIECE_COLORS[selectedColor].shadow}40`,
            }}
          />

          <IconButton onClick={onNextColor} size="small" disabled={availableColorCount <= 1} sx={{ p: 0.5 }}>
            <ArrowForward fontSize="small" sx={{ color: "text.secondary" }} />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            p: 1,
            backgroundColor: "#f9fafb",
            borderRadius: 2,
            justifyContent: "center",
          }}
        >
          <IconButton onClick={onDecreaseCount} disabled={selectedCount <= 1} size="small" sx={{ p: 0.5 }}>
            <ArrowDownward fontSize="small" sx={{ color: "text.secondary" }} />
          </IconButton>

          <Typography variant="body1" sx={{ mx: 2.5, color: "text.primary", fontWeight: 500 }}>
            {selectedCount} 個
          </Typography>

          <IconButton onClick={onIncreaseCount} disabled={selectedCount >= maxSelectableCount} size="small" sx={{ p: 0.5 }}>
            <ArrowUpward fontSize="small" sx={{ color: "text.secondary" }} />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2.5,
          width: "100%",
        }}
      >
        <Button
          variant="contained"
          onClick={onConfirmMove}
          sx={{
            borderRadius: 10,
            px: 3,
            py: 1,
            backgroundColor: "#059669",
            color: "#fff",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#047857" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          決定
        </Button>
      </Box>
    </Paper>
  )
}
