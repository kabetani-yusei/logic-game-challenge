import { Box, Button, Typography } from "@mui/material"
import { Link } from "react-router-dom"
import GamePageLayout from "../../components/GamePageLayout"
import ResultOverlay from "../../components/ResultOverlay"
import ModMStatusPanels from "./ModMStatusPanels"
import PlayedCardsPanel from "./PlayedCardsPanel"
import PlayerHandPanel from "./PlayerHandPanel"
import { useModMGame } from "./useModMGame"

export default function ModMGamePage() {
  const { gameState, canUndo, handleCardSelect, handleUndo, handleRestart } = useModMGame()

  return (
    <GamePageLayout
      title="mod Mゲーム"
      rules={
        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7, ml: { xs: 0, sm: 15 } }}>
          1. プレイヤーと AIが交互にカードを出します。（今回はプレイヤーは後手です。）
          <br />
          2. カードを出したときに、合計が9の倍数になったら、そのカードを出した人の負けです。
          <br />
          3. 両者がすべてのカードを出し切った場合は、AIの勝ちです。
        </Typography>
      }
    >
      <ModMStatusPanels gameState={gameState} />
      <PlayedCardsPanel gameState={gameState} />
      <PlayerHandPanel gameState={gameState} canUndo={canUndo} onCardSelect={handleCardSelect} onUndo={handleUndo} />

      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
        resultLabel={gameState.winner === "player" ? "あなたの勝ちです！" : "AI の勝ちです"}
        onRestart={handleRestart}
      />
    </GamePageLayout>
  )
}
