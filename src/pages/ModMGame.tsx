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
        background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #b9f6ca 100%)",
        p: 1,
        pt: 2,
      }}
    >
      <Container maxWidth="md" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* ゲームタイトルとルール説明を縦並びに */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* ゲームタイトル */}
          <Typography
            variant="h5"
            component="h1"
            sx={{
              color: "#2e7d32",
              fontWeight: "bold",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            mod Mゲーム
          </Typography>

          {/* ゲームルール説明 */}
          <Paper
            elevation={2}
            sx={{
              p: 1.5,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
            }}
          >
            <Typography variant="body2" sx={{ color: "#333", lineHeight: 1.4 }}>
              1. プレイヤーと AIが交互にカードを出します。（今回はプレイヤーは後手です。）
              <br />
              2. カードを出したときに、合計が9の倍数になったら、そのカードを出した人の負けです。
              <br />
              3. 両者がすべてのカードを出し切った場合は、AIの勝ちです。
            </Typography>
          </Paper>
        </Box>

        {/* ゲーム情報とAIの手札を横並びに */}
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          {/* ゲーム情報の表示 */}
          <Paper
            elevation={3}
            sx={{
              p: 1.5,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: "#333", fontWeight: "medium", textAlign: "center" }}>
              {gameState.message}
            </Typography>
            {gameState.lastMove && (
              <Typography variant="caption" sx={{ color: "#666", mt: 0.5, textAlign: "center" }}>
                {gameState.lastMove}
              </Typography>
            )}
          </Paper>

          {/* AI の手札 */}
          <Paper
            elevation={3}
            sx={{
              p: 1.5,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              flex: 1,
            }}
          >
            <Typography variant="body2" gutterBottom sx={{ color: "#333", fontWeight: "medium", textAlign: "center" }}>
              AI の手札
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: "center",
              }}
            >
              {gameState.aiCards.length > 0 ? (
                gameState.aiCards.map((card) => (
                  <Button
                    key={card}
                    variant="contained"
                    disabled
                    size="small"
                    sx={{
                      minWidth: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#d32f2f",
                      color: "#f0f0f0",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      "&.Mui-disabled": {
                        backgroundColor: "#d32f2f",
                        color: "#f0f0f0",
                        opacity: 0.9,
                      },
                    }}
                  >
                    {card}
                  </Button>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: "#555" }}>
                  手札がありません
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* 場に出されたカードと合計を同一のBoxに配置 */}
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "8px",
          }}
        >
          <Typography variant="body2" gutterBottom sx={{ color: "#333", fontWeight: "medium", textAlign: "center" }}>
            場に出されたカード
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* 場に出されたカード */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: "center",
                flex: 3,
              }}
            >
              {gameState.playedCards.length > 0 ? (
                gameState.playedCards.map((card, index) => (
                  <Box
                    key={`played-${index}`}
                    sx={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "4px",
                      backgroundColor: gameState.playedBy[index] === "ai" ? "#ffcdd2" : "#bbdefb", // AIは赤色、プレイヤーは青色
                      border: `1px solid ${gameState.playedBy[index] === "ai" ? "#ef9a9a" : "#90caf9"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      color: "#333",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    {card}
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: "#555" }}>
                  まだカードが出されていません
                </Typography>
              )}
            </Box>

            {/* 合計と余り */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                borderLeft: "1px dashed #ccc",
                pl: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: "#555", mb: 0.5 }}>
                合計: {gameState.sum}
              </Typography>
              <Typography variant="caption" sx={{ color: "#555", mb: 0.5 }}>
                9で割った余り
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  boxShadow: "0 2px 8px rgba(76, 175, 80, 0.4)",
                }}
              >
                {gameState.sum % gameState.m}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* プレイヤー（あなた）の手札エリア */}
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" gutterBottom sx={{ color: "#333", fontWeight: "medium" }}>
            あなたの手札
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
              mb: 1.5,
            }}
          >
            {gameState.playerCards.length > 0 ? (
              gameState.playerCards.map((card) => (
                <Button
                  key={card}
                  variant="contained"
                  onClick={() => handleCardSelect(card)}
                  disabled={gameState.currentTurn !== "player" || gameState.gameOver}
                  size="small"
                  sx={{
                    minWidth: "36px",
                    height: "36px",
                    borderRadius: "6px",
                    backgroundColor: "#3f51b5",
                    color: "#f0f0f0",
                    fontWeight: "bold",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "#303f9f",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  {card}
                </Button>
              ))
            ) : (
              <Typography variant="caption" sx={{ color: "#555" }}>
                手札がありません
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            onClick={handleUndo}
            disabled={history.length < 2}
            size="small"
            sx={{
              backgroundColor: "#78909c",
              color: "#fff",
              borderRadius: "20px",
              px: 2,
              py: 0.5,
              fontSize: "0.8rem",
              "&:hover": { backgroundColor: "#546e7a" },
              "&.Mui-disabled": {
                backgroundColor: "#cfd8dc",
                color: "#90a4ae",
              },
            }}
          >
            1手戻る
          </Button>
        </Paper>

        {/* ゲーム終了時の結果表示 */}
        {gameState.gameOver && (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: "#333", fontWeight: "bold" }}>
              ゲーム終了
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              sx={{
                color: gameState.winner === "player" ? "#4caf50" : "#f44336",
                fontWeight: "medium",
                mb: 2,
                p: 1,
                backgroundColor: gameState.winner === "player" ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
                borderRadius: "6px",
                display: "inline-block",
              }}
            >
              {gameState.winner === "player" ? "あなたの勝ちです！" : "AI の勝ちです"}
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              size="small"
              sx={{
                borderRadius: "20px",
                px: 3,
                py: 0.8,
                backgroundColor: "#3f51b5",
                color: "#fff",
                fontWeight: "bold",
                boxShadow: "0 2px 5px rgba(63, 81, 181, 0.3)",
              }}
            >
              タイトルに戻る
            </Button>
          </Paper>
        )}

        {/* タイトルへ戻るボタン */}
        {!gameState.gameOver && (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              component={Link}
              to="/"
              variant="outlined"
              size="small"
              sx={{
                borderRadius: "20px",
                px: 3,
                py: 0.5,
                color: "#555",
                borderColor: "#ccc",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.8rem",
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
