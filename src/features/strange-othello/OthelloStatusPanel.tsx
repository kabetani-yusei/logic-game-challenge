import { Box, Paper, Stack, Typography } from "@mui/material"
import type { StrangeOthelloGameState } from "./types"

function PlayerScore({
  label,
  color,
  score,
  active,
  align,
}: {
  label: string
  color: "black" | "white"
  score: number
  active: boolean
  align: "left" | "right"
}) {
  return (
    <Stack
      direction={align === "left" ? "row" : "row-reverse"}
      spacing={1.5}
      sx={{
        alignItems: "center",
        flex: 1,
        p: 1.25,
        borderRadius: 3,
        border: "2px solid",
        borderColor: active ? "primary.main" : "transparent",
        bgcolor: active ? "action.selected" : "transparent",
        transition: "all 0.2s ease",
      }}
    >
      <Box
        aria-hidden
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          flexShrink: 0,
          background:
            color === "black"
              ? "radial-gradient(circle at 35% 30%, #4a4f63 0%, #16182a 60%, #07080f 100%)"
              : "radial-gradient(circle at 35% 30%, #ffffff 0%, #f1f1ee 55%, #cfcfc8 100%)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
        }}
      />
      <Box sx={{ textAlign: align, minWidth: 0 }}>
        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600, lineHeight: 1.3 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: "1.6rem", fontWeight: 800, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>
          {score}
        </Typography>
      </Box>
    </Stack>
  )
}

export default function OthelloStatusPanel({ gameState }: { gameState: StrangeOthelloGameState }) {
  const total = gameState.blackScore + gameState.whiteScore
  const blackRatio = total === 0 ? 50 : (gameState.blackScore / total) * 100
  const blackActive = !gameState.gameOver && gameState.currentTurn === "black"
  const whiteActive = !gameState.gameOver && gameState.currentTurn === "white"

  return (
    <Paper sx={{ p: { xs: 1.5, sm: 2 } }} aria-label={`石の数 黒 ${gameState.blackScore}、白 ${gameState.whiteScore}`}>
      <Stack direction="row" spacing={1.5}>
        <PlayerScore label="あなた（黒）" color="black" score={gameState.blackScore} active={blackActive} align="left" />
        <PlayerScore label="AI（白）" color="white" score={gameState.whiteScore} active={whiteActive} align="right" />
      </Stack>
      <Box
        aria-hidden
        sx={{
          mt: 1.5,
          height: 8,
          borderRadius: 999,
          overflow: "hidden",
          bgcolor: "#f1f1ee",
          display: "flex",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12)",
          outline: "1px solid",
          outlineColor: "divider",
        }}
      >
        <Box sx={{ width: `${blackRatio}%`, bgcolor: "#16182a", transition: "width 0.4s ease" }} />
      </Box>
    </Paper>
  )
}
