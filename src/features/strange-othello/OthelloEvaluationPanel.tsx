import { Box, Paper, Typography } from "@mui/material"
import { evalToBarPercent } from "./logic"

export default function OthelloEvaluationPanel({ currentEval }: { currentEval: number }) {
  return (
    <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
          評価値（黒視点）
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: currentEval > 0 ? "#1a1a2e" : currentEval < 0 ? "#dc2626" : "#d97706",
          }}
        >
          {currentEval > 0 ? `+${currentEval}` : currentEval}
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          height: 20,
          borderRadius: 2,
          overflow: "hidden",
          display: "flex",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: `${evalToBarPercent(currentEval)}%`,
            height: "100%",
            backgroundColor: "#1a1a2e",
            transition: "width 0.3s ease",
          }}
        />
        <Box
          sx={{
            flex: 1,
            height: "100%",
            backgroundColor: "#f5f5f5",
          }}
        />
      </Box>
    </Paper>
  )
}
