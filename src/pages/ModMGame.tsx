"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Paper, Container } from "@mui/material"
import { Link } from "react-router-dom"

// ゲームの状態を表す型
interface GameState {
  n: number             // カードの最大値
  m: number             // 割る数
  playerCards: number[] // プレイヤー（Alice）の手札
  aiCards: number[]     // AI の手札
  playedCards: number[] // 場に出されたカード
  sum: number           // 場に出されたカードの合計
  currentTurn: "player" | "ai" // 現在の手番
  gameOver: boolean     // ゲーム終了フラグ
  winner: "player" | "ai" | null // 勝者
  message: string       // ゲームメッセージ
}

export default function ModMGame() {
  // ゲームの初期状態を設定する関数（デフォルトは N=5, M=7）
  const initializeGame = (n = 5, m = 7): GameState => {
    const playerCards = Array.from({ length: n }, (_, i) => i + 1)
    const aiCards = Array.from({ length: n }, (_, i) => i + 1)

    return {
      n,
      m,
      playerCards,
      aiCards,
      playedCards: [],
      sum: 0,
      currentTurn: "player",
      gameOver: false,
      winner: null,
      message: "あなたのターンです。カードを選んでください。"
    }
  }

  // ゲームの状態管理
  const [gameState, setGameState] = useState<GameState>(initializeGame())

  // カードをプレイした後の状態更新関数
  const playCard = (card: number, player: "player" | "ai") => {
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

    // 直後に、場の合計が M で割り切れる場合は直前にカードを出した人の負け
    if (newState.sum % newState.m === 0) {
      newState.gameOver = true
      newState.winner = player === "player" ? "ai" : "player"
      newState.message =
        newState.winner === "player"
          ? "あなたの勝ちです！合計が" + newState.m + "の倍数になりました。"
          : "AIの勝ちです。合計が" + newState.m + "の倍数になりました。"
    }
    // 両者がすべてのカードを出し切った場合は、問題文ルールによりプレイヤー の勝ち
    else if (newState.playerCards.length === 0 && newState.aiCards.length === 0) {
      newState.gameOver = true
      newState.winner = "player"
      newState.message = "すべてのカードを出し切りました。あなたの勝ちです！"
    }
    // ゲーム続行の場合
    else {
      newState.currentTurn = player === "player" ? "ai" : "player"
      newState.message = newState.currentTurn === "player" ? "あなたのターンです。" : "AIのターンです..."
    }

    setGameState(newState)
  }

  // プレイヤー（Alice）がカードを選んだときの処理
  const handleCardSelect = (card: number) => {
    if (gameState.currentTurn !== "player" || gameState.gameOver) return
    playCard(card, "player")
  }

  // minimax アルゴリズム（現状の盤面評価）  
  // ※各再帰呼び出しでは、即座に負ける（合計が M で割り切れる）手は大きなペナルティとして扱います。
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
      // すべてのカードを出し切った場合は（最終的に）プレイヤー の勝ちとして評価
      return { score: 1 }
    }

    const currentCards = isMaximizing ? aiCards : playerCards

    if (currentCards.length === 0) {
      // 手札がない場合、相手のターンへ
      return minimax(playerCards, aiCards, sum, !isMaximizing, depth + 1, alpha, beta)
    }

    if (isMaximizing) {
      let maxScore = Number.NEGATIVE_INFINITY
      let bestCard: number | undefined
      for (const card of aiCards) {
        const newSum = sum + card
        // もしこのカードで即座に負けるなら強いペナルティを与える
        if (newSum % gameState.m === 0) {
          return { score: -10 + depth, card }
        }
        // 新たな状態を作る
        const newAiCards = aiCards.filter(c => c !== card)
        const result = minimax(playerCards, newAiCards, newSum, false, depth + 1, alpha, beta)
        if (result.score > maxScore) {
          maxScore = result.score
          bestCard = card
        }
        alpha = Math.max(alpha, maxScore)
        if (beta <= alpha) break
      }
      return { score: maxScore, card: bestCard }
    } else {
      let minScore = Number.POSITIVE_INFINITY
      let bestCard: number | undefined
      for (const card of playerCards) {
        const newSum = sum + card
        if (newSum % gameState.m === 0) {
          return { score: 10 - depth, card }
        }
        const newPlayerCards = playerCards.filter(c => c !== card)
        const result = minimax(newPlayerCards, aiCards, newSum, true, depth + 1, alpha, beta)
        if (result.score < minScore) {
          minScore = result.score
          bestCard = card
        }
        beta = Math.min(beta, minScore)
        if (beta <= alpha) break
      }
      return { score: minScore, card: bestCard }
    }
  }

  // AIのターンの処理  
  // ※そのターンで、まず即座に負けとならない（安全な）カードがあれば、その中から minimax により最善手を探します。  
  //    安全な手が存在しない場合は、ランダムにカードを選びます。
  useEffect(() => {
    if (gameState.currentTurn === "ai" && !gameState.gameOver) {
      const aiTimer = setTimeout(() => {
        // 安全な手：このターンで出して、場の合計が M で割り切れないカード
        const safeMoves = gameState.aiCards.filter(card => (gameState.sum + card) % gameState.m !== 0)
        let chosenCard: number | undefined

        if (safeMoves.length > 0) {
          // 安全な手があれば、その中から minimax で最善手を求める
          const result = minimax(gameState.playerCards, safeMoves, gameState.sum, true)
          chosenCard = result.card
          // minimax が undefined を返した場合はランダム選択
          if (chosenCard === undefined) {
            chosenCard = safeMoves[Math.floor(Math.random() * safeMoves.length)]
          }
        } else {
          // すべてのカードが即座に負けにつながる場合は、ランダムに選択
          chosenCard = gameState.aiCards[Math.floor(Math.random() * gameState.aiCards.length)]
        }

        if (chosenCard !== undefined) {
          playCard(chosenCard, "ai")
        }
      }, 1000) // AI の思考時間として 1 秒
      return () => clearTimeout(aiTimer)
    }
  }, [gameState])

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
            textAlign: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
            ゲームのルール
          </Typography>
          <Typography variant="body1" sx={{ color: "#333" }}>
            1. プレイヤーと AIが交互にカードを出します。<br />
            2. カードの合計が M の倍数になった時点で、そのターンでカードを出した人が負けです。<br />
            3. すべてのカードを出し切った場合は、プレイヤー の勝ちです。<br />
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
          <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
            現在のターン
          </Typography>
          <Typography variant="body1" sx={{ color: "#333" }}>
            {gameState.message}
          </Typography>
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
                    // disabled状態でも同じスタイルになるように設定
                    "&.Mui-disabled": {
                      backgroundColor: "#d32f2f",
                      color: "#f0f0f0",
                    },
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


        {/* 場の合計 (Mで割った余り) */}
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
            場の合計 (Mで割った余り)
          </Typography>
          <Typography variant="body1" sx={{ color: "#333" }}>
            {gameState.sum % gameState.m}
          </Typography>
        </Paper>

        {/* プレイヤー（あなた）の手札 */}
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
            あなたの手札
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
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
