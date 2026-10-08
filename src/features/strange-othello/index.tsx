import { Alert, Button } from "@mui/material"
import GameActions from "../../components/GameActions"
import GamePageLayout, { RuleList } from "../../components/GamePageLayout"
import ResultDialog, { type GameOutcome } from "../../components/ResultDialog"
import TurnStatus from "../../components/TurnStatus"
import { useResultDialog } from "../../hooks/useResultDialog"
import OthelloBoard from "./OthelloBoard"
import OthelloEvaluationPanel from "./OthelloEvaluationPanel"
import OthelloStatusPanel from "./OthelloStatusPanel"
import type { StrangeOthelloGameState } from "./types"
import { useStrangeOthelloGame } from "./useStrangeOthelloGame"

const COLUMN_LABELS = ["a", "b", "c", "d", "e", "f"]

function getOutcome(winner: StrangeOthelloGameState["winner"]): GameOutcome {
  if (winner === "black") return "win"
  if (winner === "white") return "lose"
  return "draw"
}

const HEADLINES: Record<GameOutcome, string> = {
  win: "あなたの勝ちです！",
  lose: "AIの勝ちです",
  draw: "引き分けです",
}

function describeLastMove(gameState: StrangeOthelloGameState) {
  const parts: string[] = []

  if (gameState.lastMove) {
    const who = gameState.lastMove.color === "black" ? "あなた" : "AI"
    const coordinate = `${COLUMN_LABELS[gameState.lastMove.col]}${gameState.lastMove.row + 1}`
    parts.push(`${who}が ${coordinate} に置き、${gameState.flipped.length} 枚返しました`)
  }

  if (gameState.passed === "black") parts.push("あなたは置ける場所がないためパスになりました")
  if (gameState.passed === "white") parts.push("AIは置ける場所がないためパスしました")

  return parts.join("。") || undefined
}

export default function StrangeOthelloPage() {
  const game = useStrangeOthelloGame()
  const { gameState } = game
  const outcome = getOutcome(gameState.winner)
  const resultDialog = useResultDialog(gameState, gameState.gameOver)
  const playerTurn = gameState.currentTurn === "black" && !gameState.gameOver
  const lastMoveText = describeLastMove(gameState)
  const scoreText = `黒 ${gameState.blackScore} − 白 ${gameState.whiteScore}`

  return (
    <GamePageLayout
      title="ストレンジオセロ"
      subtitle="通常とは異なる初期盤面から始まる 6×6 のオセロ"
      maxWidth="sm"
      onTitleClick={game.handleTitleClick}
      rules={
        <RuleList
          items={[
            "あなたは黒（先手）、AI は白です。通常のオセロと同じく、相手の石を挟むと自分の色に返せます。",
            "置ける場所がない場合は自動的にパスになり、両者とも置けなくなったら終了です。",
            "最終的に石の数が多い方の勝ちです。盤面の点は置ける場所を示します。",
          ]}
        />
      }
      status={
        gameState.gameOver ? (
          <TurnStatus kind="finished"
            outcome={outcome} message={HEADLINES[outcome]} detail={scoreText} />
        ) : playerTurn ? (
          <TurnStatus kind="player" message="あなたの番です（黒）" detail={lastMoveText ?? "点のあるマスに石を置けます"} />
        ) : (
          <TurnStatus
            kind="ai"
            message={game.solutionStatus === "ready" ? "AIが考えています…" : "AIを準備しています…"}
            detail={lastMoveText}
          />
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
      {game.solutionStatus === "error" && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={game.retrySolution}>
              再試行
            </Button>
          }
        >
          AI のデータを読み込めませんでした。通信環境を確認して再試行してください。
        </Alert>
      )}

      <OthelloStatusPanel gameState={gameState} />

      {game.showEvaluation && <OthelloEvaluationPanel status={game.evaluationStatus} currentEval={game.currentEval} />}

      <OthelloBoard
        gameState={gameState}
        interactive={playerTurn}
        showEvaluation={game.showEvaluation}
        moveEvals={game.moveEvals}
        onCellClick={game.handleBlackMove}
      />

      <ResultDialog
        open={resultDialog.open}
        outcome={outcome}
        headline={HEADLINES[outcome]}
        detail={`最終スコア：${scoreText}`}
        canUndo={game.canUndo}
        onUndo={game.handleUndo}
        onRestart={game.handleRestart}
        onClose={resultDialog.close}
      />
    </GamePageLayout>
  )
}
