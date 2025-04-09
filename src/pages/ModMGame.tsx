"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Paper, Container, Chip } from "@mui/material"
import { Link } from "react-router-dom"

// ゲームの状態を表す型
interface GameState {
  n: number // カードの最大値
  m: number // 割る数
  playerCards: number[] // プレイヤーの手札
  aiCards: number[] // AIの手札
  playedCards: number[] // 場に出されたカード
  sum: number // 場に出されたカードの合計
  currentTurn: "player" | "ai" // 現在の手番
  gameOver: boolean // ゲーム終了フラグ
  winner: "player" | "ai" | null // 勝者
  message: string // ゲームメッセージ
}

export default function ModMGame() {
  // ゲームの初期状態を設定する関数
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
      currentTurn: "player" as const,
      gameOver: false,
      winner: null,
      message: "あなたのターンです。カードを選んでください。",
    }
  }

  // ゲームの状態
  const [gameState, setGameState] = useState<GameState>(initializeGame())

  // カードをプレイする関数
  const playCard = (card: number, player: "player" | "ai") => {
    // 現在の状態をコピー
    const newState = { ...gameState }

    // カードを手札から削除
    if (player === "player") {
      newState.playerCards = newState.playerCards.filter((c) => c !== card)
    } else {
      newState.aiCards = newState.aiCards.filter((c) => c !== card)
    }

    // カードを場に追加
    newState.playedCards = [...newState.playedCards, card]
    newState.sum += card

    // 勝敗判定
    if (newState.sum % newState.m === 0) {
      newState.gameOver = true
      newState.winner = player === "player" ? "ai" : "player"
      newState.message =
        newState.winner === "player"
          ? "あなたの勝ちです！合計が" + newState.m + "の倍数になりました。"
          : "AIの勝ちです。合計が" + newState.m + "の倍数になりました。"
    } else if (newState.playerCards.length === 0 && newState.aiCards.length === 0) {
      // すべてのカードを出し切った場合
      newState.gameOver = true
      newState.winner = "player" // ルールによりAlice（プレイヤー）の勝ち
      newState.message = "すべてのカードを出し切りました。あなたの勝ちです！"
    } else {
      // ゲーム続行
      newState.currentTurn = player === "player" ? "ai" : "player"
      newState.message = newState.currentTurn === "player" ? "あなたのターンです。" : "AIのターンです..."
    }

    setGameState(newState)
  }

  // プレイヤーがカードを選択する関数
  const handleCardSelect = (card: number) => {
    if (gameState.currentTurn !== "player" || gameState.gameOver) return
    playCard(card, "player")
  }

  // ミニマックスアルゴリズムでAIの最適な手を計算
  const minimax = (
    playerCards: number[],
    aiCards: number[],
    sum: number,
    isMaximizing: boolean,
    depth = 0,
    alpha = Number.NEGATIVE_INFINITY,
    beta: number = Number.POSITIVE_INFINITY,
  ): { score: number; card?: number } => {
    // 終了条件
    if (playerCards.length === 0 && aiCards.length === 0) {
      return { score: 1 } // すべてのカードを出し切った場合はAlice（プレイヤー）の勝ち
    }

    const currentCards = isMaximizing ? aiCards : playerCards

    if (currentCards.length === 0) {
      // 手札がない場合は相手のターンに移る
      return minimax(playerCards, aiCards, sum, !isMaximizing, depth + 1, alpha, beta)
    }

    if (isMaximizing) {
      // AIのターン（最大化プレイヤー）
      let maxScore = Number.NEGATIVE_INFINITY
      let bestCard

      for (const card of aiCards) {
        const newSum = sum + card

        // 合計がMで割り切れる場合、AIの負け
        if (newSum % gameState.m === 0) {
          return { score: -10 + depth, card } // 早く負けるほど良い（深さを考慮）
        }

        // 新しい状態を作成
        const newAiCards = aiCards.filter((c) => c !== card)
        const result = minimax(playerCards, newAiCards, newSum, false, depth + 1, alpha, beta)

        if (result.score > maxScore) {
          maxScore = result.score
          bestCard = card
        }

        alpha = Math.max(alpha, maxScore)
        if (beta <= alpha) break // アルファベータ枝刈り
      }

      return { score: maxScore, card: bestCard }
    } else {
      // プレイヤーのターン（最小化プレイヤー）
      let minScore = Number.POSITIVE_INFINITY
      let bestCard

      for (const card of playerCards) {
        const newSum = sum + card

        // 合計がMで割り切れる場合、プレイヤーの負け
        if (newSum % gameState.m === 0) {
          return { score: 10 - depth, card } // 早く勝つほど良い（深さを考慮）
        }

        // 新しい状態を作成
        const newPlayerCards = playerCards.filter((c) => c !== card)
        const result = minimax(newPlayerCards, aiCards, newSum, true, depth + 1, alpha, beta)

        if (result.score < minScore) {
          minScore = result.score
          bestCard = card
        }

        beta = Math.min(beta, minScore)
        if (beta <= alpha) break // アルファベータ枝刈り
      }

      return { score: minScore, card: bestCard }
    }
  }

  // AIのターンを処理
  useEffect(() => {
    if (gameState.currentTurn === "ai" && !gameState.gameOver) {
      const aiTimer = setTimeout(() => {
        // AIの最適な手を計算
        const result = minimax(gameState.playerCards, gameState.aiCards, gameState.sum, true)

        if (result.card !== undefined) {
          playCard(result.card, "ai")
        }
      }, 1000) // AIの思考時間

      return () => clearTimeout(aiTimer)
    }
  }, [gameState])

  // ゲームをリセットする関数
  const resetGame = () => {
    setGameState(initializeGame())
  }

  // 難易度を変更する関数（N, Mの値を変更）
  const changeGameSettings = (n: number, m: number) => {
    setGameState(initializeGame(n, m))
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
            backgroundColor: "rgba(230, 230, 250, 0.9)",
            borderRadius: 4,
            textAlign: "center",
            mb: 3,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
            ゲームのルール
          </Typography>
          <Typography variant="body1" sx={{ color: "#333" }}>
            カードが場に出た直後に、今まで場に出たカードに書かれている数の総和が M
            で割り切れる状態になったら、直前にカードを出した人の負け、そうでない人の勝ちとなります。
            上の条件を満たすことなく両者が持っているカードを全て出し切った場合は 後手の勝ちとなります。
          </Typography>
        </Paper>

        {/* ヘッダー部分 */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ color: "#333" }}>
            mod {gameState.m} ゲーム
          </Typography>
        </Box>

        {/* ゲーム情報 */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "rgba(230, 230, 250, 0.8)",
            borderRadius: 4,
            mb: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="body1" gutterBottom sx={{ color: "#333" }}>
            現在の合計: {gameState.sum}
          </Typography>
          <Typography variant="body2" sx={{ color: "#555" }} gutterBottom>
            {gameState.sum} ÷ {gameState.m} = {Math.floor(gameState.sum / gameState.m)} 余り{" "}
            {gameState.sum % gameState.m}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: "#333" }}>
            {gameState.message}
          </Typography>
        </Paper>

        {/* 場に出されたカード */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: 4,
            mb: 3,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
            場に出されたカード
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
              minHeight: "50px",
            }}
          >
            {gameState.playedCards.length > 0 ? (
              gameState.playedCards.map((card, index) => (
                <Chip
                  key={index}
                  label={card}
                  color="primary"
                  sx={{ fontSize: "1rem", height: "36px", width: "36px" }}
                />
              ))
            ) : (
              <Typography variant="body2" sx={{ color: "#555" }}>
                まだカードが出されていません
              </Typography>
            )}
          </Box>
        </Paper>

        {/* プレイヤーの手札 */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "rgba(230, 230, 250, 0.8)",
            borderRadius: 4,
            mb: 3,
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
              gameState.playerCards.map((card) => (
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
                    "&:hover": {
                      backgroundColor: "#303f9f",
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

        {/* AIの手札（数のみ表示） */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "rgba(230, 230, 250, 0.8)",
            borderRadius: 4,
            mb: 3,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
            AIの手札
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
              Array.from({ length: gameState.aiCards.length }).map((_, index) => (
                <Button
                  key={index}
                  variant="contained"
                  disabled
                  sx={{
                    minWidth: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#f44336",
                    color: "#f0f0f0",
                  }}
                >
                  ?
                </Button>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: "#555" }}>
                手札がありません
              </Typography>
            )}
          </Box>
        </Paper>

        {/* ゲーム終了時の表示 */}
        {gameState.gameOver && (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: "rgba(230, 230, 250, 0.9)",
              borderRadius: 4,
              textAlign: "center",
              mb: 3,
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ color: "#333" }}>
              ゲーム終了
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
              {gameState.winner === "player" ? "あなたの勝ちです！" : "AIの勝ちです"}
            </Typography>
            <Button
              variant="contained"
              onClick={resetGame}
              sx={{
                mt: 2,
                mr: 1,
                backgroundColor: "#3f51b5",
                color: "#f0f0f0",
                "&:hover": {
                  backgroundColor: "#303f9f",
                },
              }}
            >
              もう一度プレイ
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to="/"
              sx={{
                mt: 2,
                color: "#333",
              }}
            >
              タイトルに戻る
            </Button>
          </Paper>
        )}

        {/* 難易度設定 */}
        {!gameState.gameOver && gameState.playedCards.length === 0 && (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: "rgba(230, 230, 250, 0.8)",
              borderRadius: 4,
              textAlign: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
              難易度設定
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
              <Button variant="outlined" onClick={() => changeGameSettings(3, 5)} sx={{ mb: 1, color: "#333" }}>
                簡単 (N=3, M=5)
              </Button>
              <Button variant="outlined" onClick={() => changeGameSettings(5, 7)} sx={{ mb: 1, color: "#333" }}>
                普通 (N=5, M=7)
              </Button>
              <Button variant="outlined" onClick={() => changeGameSettings(7, 11)} sx={{ mb: 1, color: "#333" }}>
                難しい (N=7, M=11)
              </Button>
            </Box>
          </Paper>
        )}

        {/* タイトルへボタン - 下部に移動 */}
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
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            タイトルへ
          </Button>
        </Box>
      </Container>
    </Box>
  )
}
