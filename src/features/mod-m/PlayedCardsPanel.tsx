import { Box, Paper, Typography } from "@mui/material"
import type { ModMGameState } from "./types"

export default function PlayedCardsPanel({ gameState }: { gameState: ModMGameState }) {
  return (
    <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
      <Typography variant="body2" gutterBottom sx={{ color: "text.primary", fontWeight: 500, textAlign: "center" }}>
        場に出されたカード
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            justifyContent: "center",
            flex: 3,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {gameState.playedCards.length > 0 ? (
            gameState.playedCards.map((card, index) => {
              const isAI = gameState.playedBy[index] === "ai"

              return (
                <Box
                  key={`played-${index}`}
                  sx={{
                    width: { xs: 40, sm: 46 },
                    height: { xs: 56, sm: 64 },
                    borderRadius: "6px",
                    backgroundColor: isAI ? "#fef2f2" : "#eff6ff",
                    border: `2px solid ${isAI ? "#f87171" : "#60a5fa"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: isAI ? "#b91c1c" : "#1e40af",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  {card}
                </Box>
              )
            })
          ) : (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              まだカードが出されていません
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            borderLeft: { xs: "none", sm: "1px dashed" },
            borderTop: { xs: "1px dashed", sm: "none" },
            borderColor: "divider",
            pl: { xs: 0, sm: 2 },
            pt: { xs: 2, sm: 0 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
            合計: {gameState.sum}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
            9で割った余り
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "#059669",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.2rem",
            }}
          >
            {gameState.sum % gameState.m}
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
