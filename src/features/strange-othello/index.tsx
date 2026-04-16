import { Box, Button, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import GamePageLayout from "../../components/GamePageLayout"
import ResultOverlay from "../../components/ResultOverlay"
import OthelloBoard from "./OthelloBoard"
import OthelloEvaluationPanel from "./OthelloEvaluationPanel"
import OthelloStatusPanel from "./OthelloStatusPanel"
import { useStrangeOthelloGame } from "./useStrangeOthelloGame"

function getOthelloResultLabel(winner: "black" | "white" | "draw" | null) {
  if (winner === "black") return "プレイヤーの勝ちです！"
  if (winner === "white") return "AIの勝ちです"
  return "引き分けです"
}

export default function StrangeOthelloPage() {
  const {
    gameState,
    showEvaluation,
    currentEval,
    moveEvals,
    canUndo,
    handleTitleClick,
    handleBlackMove,
    handleUndo,
    handleRestart,
  } = useStrangeOthelloGame()

  const resultLabel = getOthelloResultLabel(gameState.winner)

  return (
    <GamePageLayout
      title="ストレンジオセロ"
      maxWidth="sm"
      onTitleClick={handleTitleClick}
      rules={
        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
          ・通常とは異なる初期盤面でのオセロです
        </Typography>
      }
    >
      <OthelloStatusPanel gameState={gameState} />

      {showEvaluation && currentEval !== null && <OthelloEvaluationPanel currentEval={currentEval} />}

      <OthelloBoard
        gameState={gameState}
        showEvaluation={showEvaluation}
        moveEvals={moveEvals}
        onCellClick={handleBlackMove}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1.5,
          flexDirection: { xs: "column", sm: "row" },
          width: { xs: "100%", sm: "auto" },
        }}
      >
        <Button
          variant="outlined"
          size="small"
          onClick={handleUndo}
          disabled={!canUndo}
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
        <Button
          component={Link}
          to="/"
          onClick={handleRestart}
          variant="outlined"
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
          タイトルへ
        </Button>
      </Box>

      <ResultOverlay
        open={gameState.gameOver}
        playerWon={gameState.winner === "black"}
        resultLabel={resultLabel}
        onRestart={handleRestart}
      />
    </GamePageLayout>
  )
}
