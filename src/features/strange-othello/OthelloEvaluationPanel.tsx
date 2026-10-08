import { Alert, Box, LinearProgress, Paper, Stack, Typography } from "@mui/material"
import InsightsRounded from "@mui/icons-material/InsightsRounded"
import { evalToBarPercent } from "./logic"
import type { TableStatus } from "./useStrangeOthelloTables"

interface OthelloEvaluationPanelProps {
  status: TableStatus
  currentEval: number | null
}

export default function OthelloEvaluationPanel({ status, currentEval }: OthelloEvaluationPanelProps) {
  return (
    <Paper sx={{ p: 2, borderStyle: "dashed" }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 1.25 }}>
        <InsightsRounded fontSize="small" sx={{ color: "primary.main" }} aria-hidden />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          評価値（黒視点・最善手順での最終石差）
        </Typography>
        {currentEval !== null && (
          <Typography
            sx={{
              ml: "auto !important",
              fontWeight: 800,
              fontVariantNumeric: "tabular-nums",
              color: currentEval > 0 ? "success.main" : currentEval < 0 ? "error.main" : "warning.main",
            }}
          >
            {currentEval > 0 ? `+${currentEval}` : currentEval}
          </Typography>
        )}
      </Stack>

      {status === "loading" && <LinearProgress aria-label="評価値データを読み込み中" />}
      {status === "error" && <Alert severity="warning">評価値データを読み込めませんでした。</Alert>}
      {status === "ready" && currentEval !== null && (
        <Box
          role="meter"
          aria-valuemin={-36}
          aria-valuemax={36}
          aria-valuenow={currentEval}
          aria-label="評価値"
          sx={{ height: 14, borderRadius: 999, overflow: "hidden", display: "flex", bgcolor: "#f1f1ee", border: "1px solid", borderColor: "divider" }}
        >
          <Box sx={{ width: `${evalToBarPercent(currentEval)}%`, bgcolor: "#16182a", transition: "width 0.3s ease" }} />
        </Box>
      )}
    </Paper>
  )
}
