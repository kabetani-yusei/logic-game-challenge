import GameActions from "../../components/GameActions"
import GamePageLayout, { RuleList } from "../../components/GamePageLayout"
import ResultDialog from "../../components/ResultDialog"
import TurnStatus from "../../components/TurnStatus"
import { useResultDialog } from "../../hooks/useResultDialog"
import { COLOR_NAMES } from "./constants"
import PieceTakingBoard from "./PieceTakingBoard"
import { usePieceTakingGame } from "./usePieceTakingGame"

export default function PieceTakingGamePage() {
  const game = usePieceTakingGame()
  const { gameState } = game
  const playerWon = gameState.winner === "player"
  const resultDialog = useResultDialog(gameState, gameState.gameOver)
  const interactive = gameState.currentTurn === "player" && !gameState.gameOver

  const lastAIMoveText = gameState.lastAIMove
    ? `AIは${COLOR_NAMES[gameState.lastAIMove.color]}を ${gameState.lastAIMove.count} 個取りました`
    : undefined

  return (
    <GamePageLayout
      title="駒取りゲーム"
      subtitle="3色のコマを取り合う、シンプルで奥深い対戦ゲーム"
      rules={
        <RuleList
          items={[
            "あなたが先手です。3色の山から1色を選び、その色のコマを1個以上好きなだけ取ります。",
            "AIと交互にコマを取り、最後の1個を取った方が負けです。",
            "コマをタップすると、その数だけ選択できます。「取る」ボタンで確定します。",
          ]}
        />
      }
      status={
        gameState.gameOver ? (
          <TurnStatus
            kind="finished"
            outcome={playerWon ? "win" : "lose"}
            message={playerWon ? "あなたの勝ちです！" : "AIの勝ちです"}
            detail={playerWon ? "AIが最後の1個を取りました" : "あなたが最後の1個を取りました"}
          />
        ) : gameState.currentTurn === "player" ? (
          <TurnStatus kind="player" message="あなたの番です" detail={lastAIMoveText ?? "取るコマを選んでください"} />
        ) : (
          <TurnStatus kind="ai" message="AIが考えています…" />
        )
      }
      actions={
        <GameActions
          canUndo={game.canUndo}
          inProgress={game.inProgress}
          onUndo={game.handleUndo}
          onRestart={game.handleRestart}
        />
      }
    >
      <PieceTakingBoard
        gameState={gameState}
        interactive={interactive}
        maxSelectableCount={game.maxSelectableCount}
        onPileSelect={game.handlePileSelect}
        onPieceSelect={game.handlePieceSelect}
        onIncreaseCount={game.handleIncreaseCount}
        onDecreaseCount={game.handleDecreaseCount}
        onConfirmMove={game.handleConfirmMove}
      />

      <ResultDialog
        open={resultDialog.open}
        outcome={playerWon ? "win" : "lose"}
        headline={playerWon ? "あなたの勝ちです！" : "AIの勝ちです"}
        detail={playerWon ? "必勝法を見抜きましたね。お見事！" : "最後の1個を取らされてしまいました。必勝法を考えてみましょう。"}
        canUndo={game.canUndo}
        onUndo={game.handleUndo}
        onRestart={game.handleRestart}
        onClose={resultDialog.close}
      />
    </GamePageLayout>
  )
}
