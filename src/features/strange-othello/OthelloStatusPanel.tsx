import { Box, Paper, Typography } from "@mui/material"
import type { StrangeOthelloGameState } from "./types"

export default function OthelloStatusPanel({ gameState }: { gameState: StrangeOthelloGameState }) {
  return (
    <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
          {gameState.currentTurn === "black" ? "あなたの番（黒）" : "AIの番（白）..."}
        </Typography>
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "#1a1a2e",
              }}
            />
            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
              {gameState.blackScore}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                backgroundColor: "#f5f5f5",
                border: "1.5px solid #d1d5db",
              }}
            />
            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
              {gameState.whiteScore}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
}
