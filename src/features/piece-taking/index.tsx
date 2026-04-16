import { Box, Button, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import GamePageLayout from "../../components/GamePageLayout"
import ResultOverlay from "../../components/ResultOverlay"
import PieceTakingBoard from "./PieceTakingBoard"
import PieceTakingControls from "./PieceTakingControls"
import { usePieceTakingGame } from "./usePieceTakingGame"

export default function PieceTakingGamePage() {
  const {
    gameState,
    availableColors,
    maxSelectableCount,
    canUndo,
    handlePileSelect,
    handleNextColor,
    handlePrevColor,
    handleIncreaseCount,
    handleDecreaseCount,
    handleConfirmMove,
    handleUndo,
    handleRestart,
  } = usePieceTakingGame()

  return (
    <GamePageLayout
      title="駒取りゲーム"
      rules={
        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
          ・3色のコマから1色を選び、その色のコマを1個以上取る行為を交互に行います
          <br />
          ・最後の1個を取った方が負けです
        </Typography>
      }
    >
      <PieceTakingBoard gameState={gameState} onPileSelect={handlePileSelect} />

      <PieceTakingControls
        currentTurn={gameState.currentTurn}
        selectedColor={gameState.selectedColor}
        selectedCount={gameState.selectedCount}
        availableColorCount={availableColors.length}
        maxSelectableCount={maxSelectableCount}
        onNextColor={handleNextColor}
        onPrevColor={handlePrevColor}
        onIncreaseCount={handleIncreaseCount}
        onDecreaseCount={handleDecreaseCount}
        onConfirmMove={handleConfirmMove}
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
        playerWon={gameState.winner === "player"}
        resultLabel={gameState.winner === "player" ? "あなたの勝ちです！" : "AIの勝ちです"}
        onRestart={handleRestart}
      />
    </GamePageLayout>
  )
}
