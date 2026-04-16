import { Box, Paper, Typography } from "@mui/material"
import type { ModMGameState } from "./types"

export default function ModMStatusPanels({ gameState }: { gameState: ModMGameState }) {
  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
      <Paper
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500, textAlign: "center" }}>
          {gameState.message}
        </Typography>
        {gameState.lastMove && (
          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, textAlign: "center" }}>
            {gameState.lastMove}
          </Typography>
        )}
      </Paper>

      <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", flex: 1 }}>
        <Typography variant="body2" gutterBottom sx={{ color: "text.primary", fontWeight: 500, textAlign: "center" }}>
          AI の手札
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center" }}>
          {gameState.aiCards.length > 0 ? (
            gameState.aiCards.map((card) => (
              <Box
                key={card}
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 68, sm: 80 },
                  borderRadius: "8px",
                  backgroundColor: "#dc2626",
                  border: "2px solid #b91c1c",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.3rem" },
                  boxShadow: "0 2px 4px rgba(220,38,38,0.2)",
                }}
              >
                {card}
              </Box>
            ))
          ) : (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              手札がありません
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
