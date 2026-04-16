import { Box, Button, ButtonBase, Paper, Typography } from "@mui/material"
import type { ModMGameState } from "./types"

const CARD_SX = {
  width: { xs: 48, sm: 56 },
  height: { xs: 68, sm: 80 },
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: { xs: "1.1rem", sm: "1.3rem" },
  transition: "all 0.15s ease",
}

interface PlayerHandPanelProps {
  gameState: ModMGameState
  canUndo: boolean
  onCardSelect: (card: number) => void
  onUndo: () => void
}

export default function PlayerHandPanel({ gameState, canUndo, onCardSelect, onUndo }: PlayerHandPanelProps) {
  const disabled = gameState.currentTurn !== "player" || gameState.gameOver

  return (
    <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
      <Typography variant="body2" gutterBottom sx={{ color: "text.primary", fontWeight: 500 }}>
        あなたの手札
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center", mb: 2 }}>
        {gameState.playerCards.length > 0 ? (
          gameState.playerCards.map((card) => (
            <ButtonBase
              key={card}
              onClick={() => onCardSelect(card)}
              disabled={disabled}
              sx={{
                ...CARD_SX,
                backgroundColor: "#fff",
                border: "2px solid #3b82f6",
                color: "#1e40af",
                boxShadow: "0 2px 4px rgba(59,130,246,0.15)",
                ...(!disabled && {
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 6px 16px rgba(59,130,246,0.25)",
                    borderColor: "#2563eb",
                  },
                }),
                ...(disabled && {
                  opacity: 0.5,
                  cursor: "default",
                }),
              }}
            >
              {card}
            </ButtonBase>
          ))
        ) : (
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            手札がありません
          </Typography>
        )}
      </Box>
      <Button
        variant="outlined"
        onClick={onUndo}
        disabled={!canUndo}
        size="small"
        sx={{
          borderRadius: 10,
          px: 3,
          py: 0.5,
          color: "text.secondary",
          borderColor: "divider",
          fontSize: "0.85rem",
          "&:hover": { borderColor: "text.secondary" },
          width: { xs: "100%", sm: "auto" },
        }}
      >
        1手戻る
      </Button>
    </Paper>
  )
}
