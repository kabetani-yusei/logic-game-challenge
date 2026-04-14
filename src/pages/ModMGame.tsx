"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Paper, Container } from "@mui/material"
import { Link } from "react-router-dom"

// ゲームの状態を表す型
interface GameState {
  n: number // カードの最大値 (固定: 5)
  m: number // 割る数 (固定: 9)
  playerCards: number[] // プレイヤー（あなた）の手札
  aiCards: number[] // AI の手札
  playedCards: number[] // 場に出されたカード
  playedBy: ("player" | "ai")[] // 各カードを出したプレイヤー
  sum: number // 場に出されたカードの合計
  currentTurn: "player" | "ai" // 現在の手番
  gameOver: boolean // ゲーム終了フラグ
  winner: "player" | "ai" | null // 勝者
  message: string // 現在のターンメッセージやゲームのメッセージ
  lastMove: string // 前回のカード出しの記録
}

export default function ModMGame() {
  // ゲームの初期状態（N=5, M=9 固定、プレイヤーは後手、AIから行動）
  const initializeGame = (): GameState => {
    const n = 5
    const m = 9
    const playerCards = Array.from({ length: n }, (_, i) => i + 1)
    const aiCards = Array.from({ length: n }, (_, i) => i + 1)

    return {
      n,
      m,
      playerCards,
      aiCards,
      playedCards: [],
      playedBy: [],
      sum: 0,
      currentTurn: "ai", // AI が最初の手番
      gameOver: false,
      winner: null,
      message: "AIのターンです...",
      lastMove: "",
    }
  }

  // 現在のゲーム状態管理
  const [gameState, setGameState] = useState<GameState>(initializeGame())
  // 各ムーブの状態を記録する履歴状態
  const [history, setHistory] = useState<GameState[]>([])

  // カードを出した後の状態更新関数
  const playCard = (card: number, player: "player" | "ai") => {
    // 現在の状態を履歴に保存
    setHistory((prev) => [...prev, gameState])

    const newState = { ...gameState }

    // 選んだカードを手札から削除
    if (player === "player") {
      newState.playerCards = newState.playerCards.filter((c) => c !== card)
    } else {
      newState.aiCards = newState.aiCards.filter((c) => c !== card)
    }

    // カードを場に追加し、合計を更新
    newState.playedCards = [...newState.playedCards, card]
    newState.playedBy = [...newState.playedBy, player]
    newState.sum += card

    // 前回の手の記録を更新する
    newState.lastMove = player === "player" ? `あなたは ${card} を出しました。` : `AIは ${card} を出しました。`

    // カードを出した時に合計が9の倍数になったら、出した側の負け
    if (newState.sum % newState.m === 0) {
      newState.gameOver = true
      newState.winner = player === "player" ? "ai" : "player"
      newState.message =
        newState.winner === "player"
          ? "あなたの勝ちです！合計が" + newState.m + "の倍数になりました。"
          : "AIの勝ちです。合計が" + newState.m + "の倍数になりました。"
    }
    // 両者がすべてのカードを出し切った場合はルールによりAIの勝ち
    else if (newState.playerCards.length === 0 && newState.aiCards.length === 0) {
      newState.gameOver = true
      newState.winner = "ai"
      newState.message = "すべてのカードを出し切りました。AIの勝ちです！"
    }
    // ゲーム続行の場合
    else {
      newState.currentTurn = player === "player" ? "ai" : "player"
      newState.message = newState.currentTurn === "player" ? "あなたのターンです。" : "AIのターンです..."
    }

    setGameState(newState)
  }

  // プレイヤーがカードを選択したときの処理
  const handleCardSelect = (card: number) => {
    if (gameState.currentTurn !== "player" || gameState.gameOver) return
    playCard(card, "player")
  }

  // minimax アルゴリズム
  const minimax = (
    playerCards: number[],
    aiCards: number[],
    sum: number,
    isMaximizing: boolean,
    depth = 0,
    alpha = Number.NEGATIVE_INFINITY,
    beta = Number.POSITIVE_INFINITY,
  ): { score: number; card?: number } => {
    if (playerCards.length === 0 && aiCards.length === 0) {
      return { score: -1 }
    }

    const currentCards = isMaximizing ? aiCards : playerCards

    if (currentCards.length === 0) {
      return minimax(playerCards, aiCards, sum, !isMaximizing, depth + 1, alpha, beta)
    }

    if (isMaximizing) {
      let maxScore = Number.NEGATIVE_INFINITY
      let bestCard: number | undefined
      for (const card of aiCards) {
        const newSum = sum + card
        if (newSum % gameState.m === 0) continue
        const newAiCards = aiCards.filter((c) => c !== card)
        const result = minimax(playerCards, newAiCards, newSum, false, depth + 1, alpha, beta)
        if (result.score > maxScore) {
          maxScore = result.score
          bestCard = card
        }
        alpha = Math.max(alpha, maxScore)
        if (beta <= alpha) break
      }
      if (bestCard === undefined) {
        bestCard = aiCards[Math.floor(Math.random() * aiCards.length)]
        maxScore = -10 + depth
      }
      return { score: maxScore, card: bestCard }
    } else {
      let minScore = Number.POSITIVE_INFINITY
      let bestCard: number | undefined
      for (const card of playerCards) {
        const newSum = sum + card
        if (newSum % gameState.m === 0) continue
        const newPlayerCards = playerCards.filter((c) => c !== card)
        const result = minimax(newPlayerCards, aiCards, newSum, true, depth + 1, alpha, beta)
        if (result.score < minScore) {
          minScore = result.score
          bestCard = card
        }
        beta = Math.min(beta, minScore)
        if (beta <= alpha) break
      }
      if (bestCard === undefined) {
        bestCard = playerCards[Math.floor(Math.random() * playerCards.length)]
        minScore = 10 - depth
      }
      return { score: minScore, card: bestCard }
    }
  }

  // AIのターンの処理
  useEffect(() => {
    if (gameState.currentTurn === "ai" && !gameState.gameOver) {
      const aiTimer = setTimeout(() => {
        const safeMoves = gameState.aiCards.filter((card) => (gameState.sum + card) % gameState.m !== 0)
        let chosenCard: number | undefined

        if (safeMoves.length > 0) {
          const result = minimax(gameState.playerCards, safeMoves, gameState.sum, true)
          chosenCard = result.card
          if (chosenCard === undefined) {
            chosenCard = safeMoves[Math.floor(Math.random() * safeMoves.length)]
          }
        } else {
          chosenCard = gameState.aiCards[Math.floor(Math.random() * gameState.aiCards.length)]
        }

        if (chosenCard !== undefined) {
          playCard(chosenCard, "ai")
        }
      }, 1000)
      return () => clearTimeout(aiTimer)
    }
  }, [gameState])

  // 1手戻るボタンのハンドラー
  const handleUndo = () => {
    if (history.length >= 2) {
      const previousState = history[history.length - 2]
      setHistory(history.slice(0, history.length - 2))
      setGameState(previousState)
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        bgcolor: "background.default",
        p: { xs: 1.5, sm: 3 },
        pt: { xs: 3, sm: 4 },
      }}
    >
      <Container maxWidth="md" sx={{ display: "flex", flexDirection: "column", gap: 2.5, px: { xs: 1, sm: 2 } }}>
        {/* ゲームタイトルとルール説明 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ color: "text.primary", textAlign: "center" }}
          >
            mod Mゲーム
          </Typography>

          <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", lineHeight: 1.7, ml: { xs: 0, sm: 15 } }}
            >
              1. プレイヤーと AIが交互にカードを出します。（今回はプレイヤーは後手です。）
              <br />
              2. カードを出したときに、合計が9の倍数になったら、そのカードを出した人の負けです。
              <br />
              3. 両者がすべてのカードを出し切った場合は、AIの勝ちです。
            </Typography>
          </Paper>
        </Box>

        {/* ゲーム情報とAIの手札 */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <Paper
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500, textAlign: "center" }}>
              {gameState.message}
            </Typography>
            {gameState.lastMove && (
              <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, textAlign: "center" }}>
                {gameState.lastMove}
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", flex: 1 }}>
            <Typography variant="body2" gutterBottom sx={{ color: "text.primary", fontWeight: 500, textAlign: "center" }}>
              AI の手札
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
              {gameState.aiCards.length > 0 ? (
                gameState.aiCards.map((card) => (
                  <Box
                    key={card}
                    sx={{
                      minWidth: { xs: 32, sm: 36 },
                      height: { xs: 32, sm: 36 },
                      borderRadius: "50%",
                      backgroundColor: "#dc2626",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    }}
                  >
                    {card}
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  手札がありません
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* 場に出されたカードと合計 */}
        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" gutterBottom sx={{ color: "text.primary", fontWeight: 500, textAlign: "center" }}>
            場に出されたカード
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 2, sm: 0 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: "center",
                flex: 3,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {gameState.playedCards.length > 0 ? (
                gameState.playedCards.map((card, index) => (
                  <Box
                    key={`played-${index}`}
                    sx={{
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                      borderRadius: 1.5,
                      backgroundColor: gameState.playedBy[index] === "ai" ? "#fee2e2" : "#dbeafe",
                      border: `1px solid ${gameState.playedBy[index] === "ai" ? "#fca5a5" : "#93c5fd"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      color: "#2d3142",
                      fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    }}
                  >
                    {card}
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  まだカードが出されていません
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                borderLeft: { xs: "none", sm: "1px dashed" },
                borderTop: { xs: "1px dashed", sm: "none" },
                borderColor: "divider",
                pl: { xs: 0, sm: 2 },
                pt: { xs: 2, sm: 0 },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
                合計: {gameState.sum}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5 }}>
                9で割った余り
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  backgroundColor: "#059669",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                }}
              >
                {gameState.sum % gameState.m}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* プレイヤーの手札エリア */}
        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
          <Typography variant="body2" gutterBottom sx={{ color: "text.primary", fontWeight: 500 }}>
            あなたの手札
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", mb: 2 }}>
            {gameState.playerCards.length > 0 ? (
              gameState.playerCards.map((card) => (
                <Button
                  key={card}
                  variant="contained"
                  onClick={() => handleCardSelect(card)}
                  disabled={gameState.currentTurn !== "player" || gameState.gameOver}
                  size="small"
                  sx={{
                    minWidth: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    borderRadius: 2,
                    backgroundColor: "#2d3142",
                    color: "#fff",
                    fontWeight: 600,
                    transition: "all 0.15s ease",
                    "&:hover": {
                      backgroundColor: "#4f5d75",
                      transform: "translateY(-2px)",
                    },
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                  }}
                >
                  {card}
                </Button>
              ))
            ) : (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                手札がありません
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            onClick={handleUndo}
            disabled={history.length < 2}
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
            1手戻る
          </Button>
        </Paper>

        {/* ゲーム終了時の結果表示 */}
        {gameState.gameOver && (
          <Paper sx={{ p: 3, border: "1px solid", borderColor: "divider", textAlign: "center" }}>
            <Typography variant="h6" gutterBottom sx={{ color: "text.primary" }}>
              ゲーム終了
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              sx={{
                color: gameState.winner === "player" ? "#059669" : "#dc2626",
                fontWeight: 600,
                mb: 2,
                p: 1.5,
                backgroundColor: gameState.winner === "player" ? "#ecfdf5" : "#fef2f2",
                borderRadius: 2,
                display: "inline-block",
              }}
            >
              {gameState.winner === "player" ? "あなたの勝ちです！" : "AI の勝ちです"}
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                mt: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Button
                variant="contained"
                onClick={() => {
                  setGameState(initializeGame())
                  setHistory([])
                }}
                size="small"
                sx={{
                  borderRadius: 10,
                  px: 3,
                  py: 1,
                  backgroundColor: "#059669",
                  color: "#fff",
                  fontWeight: 600,
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": { backgroundColor: "#047857" },
                }}
              >
                やり直す
              </Button>

              <Button
                component={Link}
                to="/"
                variant="contained"
                size="small"
                sx={{
                  borderRadius: 10,
                  px: 3,
                  py: 1,
                  backgroundColor: "#2d3142",
                  color: "#fff",
                  fontWeight: 600,
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": { backgroundColor: "#4f5d75" },
                }}
              >
                タイトルに戻る
              </Button>
            </Box>
          </Paper>
        )}

        {/* タイトルへ戻るボタン */}
        {!gameState.gameOver && (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Button
              component={Link}
              to="/"
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
        )}
      </Container>
    </Box>
  )
}
