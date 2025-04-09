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

  // 指定した色の残り個数を返すヘルパー関数
  const getCountForColor = (color: "blue" | "yellow" | "red") => {
    switch (color) {
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

  // 現在の色に対する選択可能な駒の数を取得
  const getMaxSelectableCount = () => {
    return getCountForColor(gameState.selectedColor)
  }

  // stateから、駒の残りが1個以上ある色の配列を返す（AI用にも利用）
  const getAvailableColorsFromState = (state: GameState): ("blue" | "yellow" | "red")[] => {
    const colors: ("blue" | "yellow" | "red")[] = []
    if (state.bluePieces > 0) colors.push("blue")
    if (state.yellowPieces > 0) colors.push("yellow")
    if (state.redPieces > 0) colors.push("red")
    return colors
  }

  // 利用可能な色（駒の残りが1個以上あるもの）の配列を取得（プレイヤー用）
  const getAvailableColors = (): ("blue" | "yellow" | "red")[] => {
    return getAvailableColorsFromState(gameState)
  }

  // 次の利用可能な色に切り替える
  const selectNextColor = () => {
    const colors: ("blue" | "yellow" | "red")[] = ["blue", "yellow", "red"]
    let index = colors.indexOf(gameState.selectedColor)
    let newColor = gameState.selectedColor
    // 色の数だけループして、個数が0でない色を探す
    for (let i = 0; i < colors.length; i++) {
      index = (index + 1) % colors.length
      if (getCountForColor(colors[index]) > 0) {
        newColor = colors[index]
        break
      }
    }
    setGameState({
      ...gameState,
      selectedColor: newColor,
      selectedCount: getCountForColor(newColor) > 0 ? 1 : 0,
    })
  }

  // 前の利用可能な色に切り替える
  const selectPrevColor = () => {
    const colors: ("blue" | "yellow" | "red")[] = ["blue", "yellow", "red"]
    let index = colors.indexOf(gameState.selectedColor)
    let newColor = gameState.selectedColor
    for (let i = 0; i < colors.length; i++) {
      index = (index - 1 + colors.length) % colors.length
      if (getCountForColor(colors[index]) > 0) {
        newColor = colors[index]
        break
      }
    }
    setGameState({
      ...gameState,
      selectedColor: newColor,
      selectedCount: getCountForColor(newColor) > 0 ? 1 : 0,
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

  // プレイヤーの手を確定する関数（変更箇所のみ抜粋）
  const confirmPlayerMove = () => {
    const newState = { ...gameState }

    switch (gameState.selectedColor) {
      case "blue":
        newState.bluePieces = Math.max(newState.bluePieces - gameState.selectedCount, 0)
        break
      case "yellow":
        newState.yellowPieces = Math.max(newState.yellowPieces - gameState.selectedCount, 0)
        break
      case "red":
        newState.redPieces = Math.max(newState.redPieces - gameState.selectedCount, 0)
        break
    }
    newState.currentTurn = "ai"

    // 盤面が空になった場合、プレイヤーが最後の駒を取ったので負け（AIの勝ち）
    if (newState.bluePieces + newState.yellowPieces + newState.redPieces === 0) {
      newState.gameOver = true
      newState.winner = "ai"
    } else {
      // 現在の選択色が使えなくなっていたら、有効な色に切り替え
      const available = getAvailableColorsFromState(newState)
      if (!available.includes(newState.selectedColor)) {
        newState.selectedColor = available.length > 0 ? available[0] : newState.selectedColor
        newState.selectedCount = available.length > 0 ? 1 : 0
      } else {
        const currentMax =
          newState.selectedColor === "blue"
            ? newState.bluePieces
            : newState.selectedColor === "yellow"
              ? newState.yellowPieces
              : newState.redPieces
        newState.selectedCount = Math.min(newState.selectedCount, currentMax)
      }
    }

    setGameState(newState)
  }


  // AIの手番処理（変更箇所のみ抜粋）
  useEffect(() => {
    if (gameState.currentTurn === "ai" && !gameState.gameOver) {
      const aiTimer = setTimeout(() => {
        const newState = { ...gameState }

        // 残っている駒がある最初の色から1個取る
        if (newState.bluePieces > 0) {
          newState.bluePieces = Math.max(newState.bluePieces - 1, 0)
          newState.selectedColor = "blue"
        } else if (newState.yellowPieces > 0) {
          newState.yellowPieces = Math.max(newState.yellowPieces - 1, 0)
          newState.selectedColor = "yellow"
        } else if (newState.redPieces > 0) {
          newState.redPieces = Math.max(newState.redPieces - 1, 0)
          newState.selectedColor = "red"
        }

        // 盤面が空の場合、AIが最後の駒を取ったので負け（プレイヤーの勝ち）
        if (newState.bluePieces + newState.yellowPieces + newState.redPieces === 0) {
          newState.gameOver = true
          newState.winner = "player"
        } else {
          // AIの手番で駒を取った後、現在の選択色が使えなくなっていたら自動で切り替え
          const available = getAvailableColorsFromState(newState)
          if (!available.includes(newState.selectedColor)) {
            newState.selectedColor = available.length > 0 ? available[0] : newState.selectedColor
            newState.selectedCount = available.length > 0 ? 1 : 0
          } else {
            const currentMax =
              newState.selectedColor === "blue"
                ? newState.bluePieces
                : newState.selectedColor === "yellow"
                  ? newState.yellowPieces
                  : newState.redPieces
            newState.selectedCount = Math.min(newState.selectedCount, currentMax)
          }
        }

        newState.currentTurn = "player"
        setGameState(newState)
      }, 1000)

      return () => clearTimeout(aiTimer)
    }
  }, [gameState])


  // 駒を描画する関数
  const renderPieces = (color: string, count: number, gridArea: string, isSelected: boolean) => {
    const pieces = []
    const pieceColor = color === "blue" ? "#3f51b5" : color === "yellow" ? "#f9a825" : "#f44336"
    const borderColor = isSelected ? "#4CAF50" : "#9E9E9E"
    const borderWidth = isSelected ? "3px" : "2px"

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

                  <IconButton onClick={increaseCount} color="primary" disabled={gameState.selectedCount >= getMaxSelectableCount()}>
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
