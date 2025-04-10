"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Paper, Container } from "@mui/material"
import { Link } from "react-router-dom"

// ゲームの状態を表す型
interface GameState {
  n: number             // カードの最大値 (固定: 5)
  m: number             // 割る数 (固定: 9)
  playerCards: number[] // プレイヤー（あなた）の手札
  aiCards: number[]     // AI の手札
  playedCards: number[] // 場に出されたカード
  sum: number           // 場に出されたカードの合計
  currentTurn: "player" | "ai" // 現在の手番
  gameOver: boolean     // ゲーム終了フラグ
  winner: "player" | "ai" | null // 勝者
  message: string       // 現在のターンメッセージやゲームのメッセージ
  lastMove: string      // 前回のカード出しの記録
}

export default function ModMGame() {
  // ゲームの初期状態（N=5, M=9 固定、プレイヤーは後手、AIから行動）
  const initializeGame = (): GameState => {
    const n = 5;
    const m = 9;
    const playerCards = Array.from({ length: n }, (_, i) => i + 1)
    const aiCards = Array.from({ length: n }, (_, i) => i + 1)

    return {
      n,
      m,
      playerCards,
      aiCards,
      playedCards: [],
      sum: 0,
      currentTurn: "ai", // AI が最初の手番
      gameOver: false,
      winner: null,
      message: "AIのターンです...",
      lastMove: ""
    }
  }

  // 現在のゲーム状態管理
  const [gameState, setGameState] = useState<GameState>(initializeGame())
  // 各ムーブの状態を記録する履歴状態
  const [history, setHistory] = useState<GameState[]>([])

  // カードを出した後の状態更新関数
  const playCard = (card: number, player: "player" | "ai") => {
    // 現在の状態を履歴に保存
    setHistory(prev => [...prev, gameState])

    const newState = { ...gameState }

    // 選んだカードを手札から削除
    if (player === "player") {
      newState.playerCards = newState.playerCards.filter(c => c !== card)
    } else {
      newState.aiCards = newState.aiCards.filter(c => c !== card)
    }

    // カードを場に追加し、合計を更新
    newState.playedCards = [...newState.playedCards, card]
    newState.sum += card

    // 前回の手の記録を更新する
    newState.lastMove =
      player === "player"
        ? `あなたは ${card} を出しました。`
        : `AIは ${card} を出しました。`

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
      newState.message =
        newState.currentTurn === "player"
          ? "あなたのターンです。"
          : "AIのターンです..."
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
        const newAiCards = aiCards.filter(c => c !== card)
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
        const newPlayerCards = playerCards.filter(c => c !== card)
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
        const safeMoves = gameState.aiCards.filter(card => (gameState.sum + card) % gameState.m !== 0)
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
        justifyContent: "center",
        background: "linear-gradient(to bottom, #e0e0e0, #b0c4de)",
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* ゲームルール説明 */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "rgba(230,230,250,0.9)",
            borderRadius: 4,
            mb: 3,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#333", textAlign: "center" }}>
            ゲームのルール
          </Typography>
          <Typography variant="body1" sx={{ color: "#333", textAlign: "left" }}>
            1. プレイヤーと AIが交互にカードを出します。（今回はプレイヤーは後手です。）<br />
            2. カードを出したときに、合計が9の倍数になったら、そのカードを出した人の負けです。<br />
            3. 両者がすべてのカードを出し切った場合は、AIの勝ちです。<br />
          </Typography>
        </Paper>

        {/* ゲーム情報の表示 */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "rgba(230,230,250,0.8)",
            borderRadius: 4,
            mb: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" sx={{ color: "#333" }}>
            {gameState.message}
          </Typography>
          {gameState.lastMove && (
            <Typography variant="body2" sx={{ color: "#666", mt: 1 }}>
              {gameState.lastMove}
            </Typography>
          )}
        </Paper>

        {/* AI の手札 */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "rgba(230,230,250,0.8)",
            borderRadius: 4,
            mb: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
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
              gameState.aiCards.map(card => (
                <Button
                  key={card}
                  variant="contained"
                  disabled
                  sx={{
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#d32f2f",
                    color: "#f0f0f0",
                    "&.Mui-disabled": { backgroundColor: "#d32f2f", color: "#f0f0f0" },
                  }}
                >
                  {card}
                </Button>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: "#555" }}>
                手札がありません
              </Typography>
            )}
          </Box>
        </Paper>

        {/* 場の合計 (9で割った余り) */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "rgba(230,230,250,0.8)",
            borderRadius: 4,
            mb: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
            場の合計 (9で割った余り)
          </Typography>
          <Typography variant="body1" sx={{ color: "#333" }}>
            {gameState.sum % gameState.m}
          </Typography>
        </Paper>

        {/* プレイヤー（あなた）の手札エリア（1手戻るボタンを下部に配置） */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "rgba(230,230,250,0.8)",
            borderRadius: 4,
            mb: 3,
            textAlign: "center",
            minHeight: "200px",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
            あなたの手札
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
              mb: 2,
            }}
          >
            {gameState.playerCards.length > 0 ? (
              gameState.playerCards.map(card => (
                <Button
                  key={card}
                  variant="contained"
                  onClick={() => handleCardSelect(card)}
                  disabled={gameState.currentTurn !== "player" || gameState.gameOver}
                  sx={{
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#3f51b5",
                    color: "#f0f0f0",
                    "&:hover": { backgroundColor: "#303f9f" },
                  }}
                >
                  {card}
                </Button>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: "#555" }}>
                手札がありません
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            onClick={handleUndo}
            disabled={history.length < 2}
            sx={{
              backgroundColor: "#1976d2",
              color: "#fff",
              "&:hover": { backgroundColor: "#115293" },
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
              p: 3,
              backgroundColor: "rgba(230,230,250,0.9)",
              borderRadius: 4,
              textAlign: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ color: "#333" }}>
              ゲーム終了
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
              {gameState.winner === "player" ? "あなたの勝ちです！" : "AI の勝ちです"}
            </Typography>
          </Paper>
        )}

        {/* タイトルへ戻るボタン */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            component={Link}
            to="/"
            variant="outlined"
            sx={{
              borderRadius: 20,
              backgroundColor: "#f5f5f5",
              color: "#333",
              border: "2px solid #ccc",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              px: 4,
              py: 1,
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            タイトルへ
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
