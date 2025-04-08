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
  const renderPieces = (color: string, count: number, gridArea: string) => {
    const pieces = []
    const pieceColor = color === "blue" ? "#3f51b5" : color === "yellow" ? "#f9a825" : "#f44336"
    const borderColor = color === "blue" ? "#4CAF50" : color === "yellow" ? "#9E9E9E" : "#9E9E9E"

    // 駒の配置パターン（簡易的な実装）
    const positions = [
      { x: 20, y: 20 },
      { x: 60, y: 20 },
      { x: 100, y: 20 },
      { x: 20, y: 60 },
      { x: 60, y: 60 },
      { x: 100, y: 60 },
      { x: 20, y: 100 },
      { x: 60, y: 100 },
      { x: 100, y: 100 },
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
            transform: "perspective(100px) rotateX(30deg)",
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
        />,
      )
    }

    return (
      <Box
        sx={{
          gridArea,
          position: "relative",
          height: 150,
          border: `2px solid ${borderColor}`,
          backgroundColor: "rgba(200, 200, 220, 0.2)",
        }}
      >
        {pieces}
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
        {/* ヘッダー部分 */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Button
            component={Link}
            to="/"
            variant="outlined"
            sx={{
              borderRadius: 20,
              backgroundColor: "white",
              color: "black",
              border: "2px solid #ccc",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              "&:hover": {
                backgroundColor: "#f5f5f5",
              },
            }}
          >
            タイトルへ
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Paper
              elevation={3}
              sx={{
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#3f51b5",
                color: "white",
                fontWeight: "bold",
                fontSize: 24,
              }}
            >
              {gameState.bluePieces}
            </Paper>

            <Paper
              elevation={3}
              sx={{
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9a825",
                color: "white",
                fontWeight: "bold",
                fontSize: 24,
              }}
            >
              {gameState.yellowPieces}
            </Paper>

            <Paper
              elevation={3}
              sx={{
                width: 50,
                height: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f44336",
                color: "white",
                fontWeight: "bold",
                fontSize: 24,
              }}
            >
              {gameState.redPieces}
            </Paper>
          </Box>
        </Box>

        {/* ゲームボード */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
            mb: 3,
            height: 150,
            backgroundColor: "#f5f5f5",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          {renderPieces("blue", gameState.bluePieces, "1 / 1 / 2 / 2")}
          {renderPieces("yellow", gameState.yellowPieces, "1 / 2 / 2 / 3")}
          {renderPieces("red", gameState.redPieces, "1 / 3 / 2 / 4")}
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

                  <Typography variant="h6" sx={{ mx: 2 }}>
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
                    backgroundColor: "white",
                    color: "black",
                    border: "2px solid #ccc",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                >
                  決定
                </Button>
              </>
            ) : (
              <Typography variant="h6">AIの番です...</Typography>
            )}
          </Paper>
        ) : (
          <Paper
            elevation={3}
            sx={{
              p: 3,
              backgroundColor: "rgba(230, 230, 250, 0.8)",
              borderRadius: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="h5" gutterBottom>
              ゲーム終了
            </Typography>
            <Typography variant="h6" gutterBottom>
              {gameState.winner === "player" ? "あなたの勝ちです！" : "AIの勝ちです"}
            </Typography>
            <Button variant="contained" component={Link} to="/" sx={{ mt: 2 }}>
              タイトルに戻る
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  )
}
