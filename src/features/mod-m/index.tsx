import { Box, Paper, Stack, Typography } from "@mui/material"
import GameActions from "../../components/GameActions"
import GamePageLayout, { RuleList } from "../../components/GamePageLayout"
import ResultDialog from "../../components/ResultDialog"
import TurnStatus from "../../components/TurnStatus"
import { useResultDialog } from "../../hooks/useResultDialog"
import ModDial from "./ModDial"
import NumberCard from "./NumberCard"
import { useModMGame } from "./useModMGame"

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="overline"
      component="h2"
      sx={{ color: "text.secondary", fontWeight: 800, letterSpacing: "0.12em", display: "block", mb: 1 }}
    >
      {children}
    </Typography>
  )
}

export default function ModMGamePage() {
  const { gameState, canUndo, inProgress, handleCardSelect, handleUndo, handleRestart } = useModMGame()
  const playerWon = gameState.winner === "player"
  const resultDialog = useResultDialog(gameState, gameState.gameOver)
  const playerTurn = gameState.currentTurn === "player" && !gameState.gameOver
  const remainder = gameState.sum % gameState.m

  return (
    <GamePageLayout
      title="mod M ゲーム"
      subtitle="出典：AtCoder Regular Contest 185 A 問題"
      rules={
        <RuleList
          items={[
            `あなたと AI はそれぞれ 1〜${gameState.n} のカードを1枚ずつ持ち、交互に1枚ずつ場に出します（AI が先手）。`,
            `カードを出した直後に場の合計が ${gameState.m} の倍数になったら、そのカードを出した人の負けです。`,
            "両者がすべてのカードを出し切った場合は AI の勝ちです。",
          ]}
        />
      }
      status={
        gameState.gameOver ? (
          <TurnStatus kind="finished"
            outcome={gameState.winner === "player" ? "win" : "lose"} message={gameState.message} detail={gameState.lastMove} />
        ) : playerTurn ? (
          <TurnStatus kind="player" message="あなたの番です" detail={gameState.lastMove || "出すカードを選んでください"} />
        ) : (
          <TurnStatus kind="ai" message="AIが考えています…" detail={gameState.lastMove || undefined} />
        )
      }
      actions={<GameActions canUndo={canUndo} inProgress={inProgress} onUndo={handleUndo} onRestart={handleRestart} />}
    >
      <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
        <SectionLabel>AI の手札</SectionLabel>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, minHeight: 58 }} useFlexGap>
          {gameState.aiCards.length > 0 ? (
            gameState.aiCards.map((card) => <NumberCard key={card} value={card} owner="ai" size="small" ariaLabel={`AIの手札 ${card}`} />)
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary", alignSelf: "center" }}>
              手札がありません
            </Typography>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: { xs: 2, sm: 3 },
          }}
        >
          <ModDial modulus={gameState.m} remainder={remainder} sum={gameState.sum} />

          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <SectionLabel>場に出されたカード</SectionLabel>
            {gameState.playedCards.length > 0 ? (
              <Box
                component="ol"
                aria-label="場に出されたカード（出された順）"
                sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexWrap: "wrap", gap: 1 }}
              >
                {gameState.playedCards.map((card, index) => {
                  const owner = gameState.playedBy[index]
                  return (
                    <Box component="li" key={index}>
                      <NumberCard
                        value={card}
                        owner={owner}
                        size="small"
                        ariaLabel={`${index + 1}手目 ${owner === "ai" ? "AI" : "あなた"}が ${card}`}
                      />
                    </Box>
                  )
                })}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                まだカードが出されていません
              </Typography>
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 2, color: "text.secondary" }}>
              <Legend color="#f0643c" label="AI" />
              <Legend color="#4c6ef5" label="あなた" />
            </Stack>
          </Box>
        </Box>
      </Paper>

      <Paper
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderColor: playerTurn ? "primary.main" : "divider",
          borderWidth: playerTurn ? 2 : 1,
          transition: "border-color 0.2s ease",
        }}
      >
        <SectionLabel>あなたの手札</SectionLabel>
        <Stack direction="row" sx={{ flexWrap: "wrap", gap: { xs: 1.25, sm: 1.75 }, pt: 1 }} useFlexGap>
          {gameState.playerCards.length > 0 ? (
            gameState.playerCards.map((card) => {
              const losing = (gameState.sum + card) % gameState.m === 0
              return (
                <NumberCard
                  key={card}
                  value={card}
                  owner="player"
                  size="large"
                  onClick={() => handleCardSelect(card)}
                  disabled={!playerTurn}
                  danger={playerTurn && losing}
                  ariaLabel={`${card} を出す${losing ? `（合計が ${gameState.m} の倍数になり負けます）` : ""}`}
                />
              )
            })
          ) : (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              手札がありません
            </Typography>
          )}
        </Stack>
        {playerTurn && gameState.playerCards.some((card) => (gameState.sum + card) % gameState.m === 0) && (
          <Typography variant="caption" sx={{ color: "error.main", display: "block", mt: 1.5 }}>
            ⚠ が付いたカードを出すと合計が {gameState.m} の倍数になり、負けになります
          </Typography>
        )}
      </Paper>

      <ResultDialog
        open={resultDialog.open}
        outcome={playerWon ? "win" : "lose"}
        headline={playerWon ? "あなたの勝ちです！" : "AIの勝ちです"}
        detail={gameState.message}
        canUndo={canUndo}
        onUndo={handleUndo}
        onRestart={handleRestart}
        onClose={resultDialog.close}
      />
    </GamePageLayout>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
      <Box aria-hidden sx={{ width: 12, height: 12, borderRadius: "4px", border: `2px solid ${color}` }} />
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Stack>
  )
}
