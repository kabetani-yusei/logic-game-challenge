"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Paper, Container, IconButton } from "@mui/material"
import { ArrowUpward, ArrowDownward, ArrowBack, ArrowForward } from "@mui/icons-material"
import { Link } from "react-router-dom"

// ゲームの状態を定義
interface GameState {
  bluePieces: number
  yellowPieces: number
  redPieces: number
  currentTurn: "player" | "ai"
  selectedColor: "blue" | "yellow" | "red"
  selectedCount: number
  gameOver: boolean
  winner: "player" | "ai" | null
}

export default function PieceTakingGame() {
  // ゲームの初期状態
  const [gameState, setGameState] = useState<GameState>({
    bluePieces: 7,
    yellowPieces: 6,
    redPieces: 2,
    currentTurn: "player",
    selectedColor: "blue",
    selectedCount: 1,
    gameOver: false,
    winner: null,
  })

  // 選択された色に基づいて、選択可能な駒の数を取得
  const getMaxSelectableCount = () => {
    switch (gameState.selectedColor) {
      case "blue":
        return gameState.bluePieces
      case "yellow":
        return gameState.yellowPieces
      case "red":
        return gameState.redPieces
      default:
        return 0
    }
  }

  // 色を選択する関数
  const selectNextColor = () => {
    const colors: ("blue" | "yellow" | "red")[] = ["blue", "yellow", "red"]
    const currentIndex = colors.indexOf(gameState.selectedColor)
    const nextIndex = (currentIndex + 1) % colors.length
    setGameState({
      ...gameState,
      selectedColor: colors[nextIndex],
      selectedCount: Math.min(1, getMaxSelectableCount()),
    })
  }

  const selectPrevColor = () => {
    const colors: ("blue" | "yellow" | "red")[] = ["blue", "yellow", "red"]
    const currentIndex = colors.indexOf(gameState.selectedColor)
    const nextIndex = (currentIndex - 1 + colors.length) % colors.length
    setGameState({
      ...gameState,
      selectedColor: colors[nextIndex],
      selectedCount: Math.min(1, getMaxSelectableCount()),
    })
  }

  // 選択する駒の数を増やす
  const increaseCount = () => {
    const maxCount = getMaxSelectableCount()
    if (gameState.selectedCount < maxCount) {
      setGameState({
        ...gameState,
        selectedCount: gameState.selectedCount + 1,
      })
    }
  }

  // 選択する駒の数を減らす
  const decreaseCount = () => {
    if (gameState.selectedCount > 1) {
      setGameState({
        ...gameState,
        selectedCount: gameState.selectedCount - 1,
      })
    }
  }

  // プレイヤーの手を確定する
  const confirmPlayerMove = () => {
    // 選択された色と数に基づいて駒を取る
    const newState = { ...gameState }

    switch (gameState.selectedColor) {
      case "blue":
        newState.bluePieces -= gameState.selectedCount
        break
      case "yellow":
        newState.yellowPieces -= gameState.selectedCount
        break
      case "red":
        newState.redPieces -= gameState.selectedCount
        break
    }

    // ターンを切り替える
    newState.currentTurn = "ai"

    // ゲーム終了判定
    if (newState.bluePieces + newState.yellowPieces + newState.redPieces === 0) {
      newState.gameOver = true
      newState.winner = "player"
    }

    setGameState(newState)
  }

  // AIの手番を処理
  useEffect(() => {
    if (gameState.currentTurn === "ai" && !gameState.gameOver) {
      // 少し遅延を入れてAIの思考時間を演出
      const aiTimer = setTimeout(() => {
        // 簡単なAIロジック：残っている駒がある色から1つ取る
        const newState = { ...gameState }

        if (newState.bluePieces > 0) {
          newState.bluePieces -= 1
          newState.selectedColor = "blue"
        } else if (newState.yellowPieces > 0) {
          newState.yellowPieces -= 1
          newState.selectedColor = "yellow"
        } else if (newState.redPieces > 0) {
          newState.redPieces -= 1
          newState.selectedColor = "red"
        }

        // ターンを切り替える
        newState.currentTurn = "player"
        newState.selectedCount = 1

        // ゲーム終了判定
        if (newState.bluePieces + newState.yellowPieces + newState.redPieces === 0) {
          newState.gameOver = true
          newState.winner = "ai"
        }

        setGameState(newState)
      }, 1000)

      return () => clearTimeout(aiTimer)
    }
  }, [gameState])

  // 駒を描画する関数
  // 変更点: 各駒内から「駒」と表示するTypography要素を削除
  const renderPieces = (color: string, count: number, gridArea: string, isSelected: boolean) => {
    const pieces = []
    const pieceColor = color === "blue" ? "#3f51b5" : color === "yellow" ? "#f9a825" : "#f44336"
    // 選択されている色の場合は緑色の枠、そうでない場合はグレーの枠
    const borderColor = isSelected ? "#4CAF50" : "#9E9E9E"
    const borderWidth = isSelected ? "3px" : "2px"

    // 駒の配置パターン（改良版）
    const positions = [
      { x: 15, y: 15 },
      { x: 55, y: 15 },
      { x: 95, y: 15 },
      { x: 15, y: 55 },
      { x: 55, y: 55 },
      { x: 95, y: 55 },
      { x: 15, y: 95 },
      { x: 55, y: 95 },
      { x: 95, y: 95 },
    ]

    for (let i = 0; i < count && i < positions.length; i++) {
      pieces.push(
        <Box
          key={`${color}-${i}`}
          sx={{
            position: "absolute",
            left: positions[i].x,
            top: positions[i].y,
            width: 30,
            height: 30,
            borderRadius: "50%",
            backgroundColor: pieceColor,
            boxShadow: "0 3px 5px rgba(0,0,0,0.3)",
            border: "2px solid rgba(0,0,0,0.2)",
            transform: "perspective(100px) rotateX(30deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 5,
              left: 5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.3)",
            },
          }}
        />
      )
    }

    return (
      <Box
        sx={{
          gridArea,
          position: "relative",
          height: 150,
          border: `${borderWidth} solid ${borderColor}`,
          backgroundColor: "rgba(200, 200, 220, 0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ position: "relative", width: "100%", height: "100%" }}>{pieces}</Box>
        <Typography
          sx={{
            position: "absolute",
            bottom: -30,
            color: "#333",
            fontWeight: "bold",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            px: 2,
            borderRadius: 1,
          }}
        >
          {count}個
        </Typography>
      </Box>
    )
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
      <Container maxWidth="md">
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
            3色のコマから1色を選び、その色のコマを1個以上取る行為を交互に行います。<br />
            最後の1個を取った方が負けです。
          </Typography>

        </Paper>

        {/* ゲームボード */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
            mb: 5,
            height: 150,
            backgroundColor: "#f5f5f5",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          {renderPieces("blue", gameState.bluePieces, "1 / 1 / 2 / 2", gameState.selectedColor === "blue")}
          {renderPieces("yellow", gameState.yellowPieces, "1 / 2 / 2 / 3", gameState.selectedColor === "yellow")}
          {renderPieces("red", gameState.redPieces, "1 / 3 / 2 / 4", gameState.selectedColor === "red")}
        </Box>

        {/* コントロールパネル */}
        {!gameState.gameOver ? (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: "rgba(230, 230, 250, 0.8)",
              borderRadius: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mb: 3,
            }}
          >
            {gameState.currentTurn === "player" ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <IconButton onClick={selectPrevColor} color="primary">
                    <ArrowBack />
                  </IconButton>

                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor:
                        gameState.selectedColor === "blue"
                          ? "#3f51b5"
                          : gameState.selectedColor === "yellow"
                            ? "#f9a825"
                            : "#f44336",
                      mx: 2,
                    }}
                  />

                  <IconButton onClick={selectNextColor} color="primary">
                    <ArrowForward />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <IconButton onClick={decreaseCount} color="primary" disabled={gameState.selectedCount <= 1}>
                    <ArrowDownward />
                  </IconButton>

                  <Typography variant="h6" sx={{ mx: 2, color: "#333" }}>
                    から {gameState.selectedCount} 本取る
                  </Typography>

                  <IconButton
                    onClick={increaseCount}
                    color="primary"
                    disabled={gameState.selectedCount >= getMaxSelectableCount()}
                  >
                    <ArrowUpward />
                  </IconButton>
                </Box>

                <Button
                  variant="contained"
                  onClick={confirmPlayerMove}
                  sx={{
                    borderRadius: 20,
                    px: 4,
                    backgroundColor: "#3f51b5",
                    color: "#f0f0f0",
                    border: "2px solid #ccc",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    "&:hover": {
                      backgroundColor: "#303f9f",
                    },
                  }}
                >
                  決定
                </Button>
              </>
            ) : (
              <Typography variant="h6" sx={{ color: "#333" }}>
                AIの番です...
              </Typography>
            )}
          </Paper>
        ) : (
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
            <Typography variant="h5" gutterBottom sx={{ color: "#333" }}>
              ゲーム終了
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
              {gameState.winner === "player" ? "あなたの勝ちです！" : "AIの勝ちです"}
            </Typography>
          </Paper>
        )}

        {/* 下部のタイトルへボタン */}
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
