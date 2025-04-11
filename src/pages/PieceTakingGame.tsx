"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Paper, Container, IconButton } from "@mui/material"
import { ArrowUpward, ArrowDownward, ArrowBack, ArrowForward } from "@mui/icons-material"
import { Link } from "react-router-dom"

// AIの手の情報を定義
interface AIMove {
  color: "blue" | "yellow" | "red"
  count: number
}

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
  lastAIMove: AIMove | null
}

export default function PieceTakingGame() {
  // ゲームの初期状態
  const [gameState, setGameState] = useState<GameState>({
    bluePieces: 4,
    yellowPieces: 3,
    redPieces: 2,
    currentTurn: "player",
    selectedColor: "blue",
    selectedCount: 1,
    gameOver: false,
    winner: null,
    lastAIMove: null,
  })

  // 過去の状態を記録しておく history（プレイヤーの手とAIの手のペアで保存）
  const [history, setHistory] = useState<GameState[]>([])

  // 色の表示名マッピング（"blue"→"青色"、"yellow"→"黄色"、"red"→"赤色"）
  const colorNames: Record<"blue" | "yellow" | "red", string> = {
    blue: "青色",
    yellow: "黄色",
    red: "赤色",
  }

  // ゲーム状態を更新する際、現在の状態を history に積んでから更新する
  const updateGameState = (newState: GameState) => {
    setHistory((prev) => [...prev, gameState])
    setGameState(newState)
  }

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

  // stateから、駒の残りが1個以上ある色の配列を返す
  const getAvailableColorsFromState = (state: GameState): ("blue" | "yellow" | "red")[] => {
    const colors: ("blue" | "yellow" | "red")[] = []
    if (state.bluePieces > 0) colors.push("blue")
    if (state.yellowPieces > 0) colors.push("yellow")
    if (state.redPieces > 0) colors.push("red")
    return colors
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

  // プレイヤーの手を確定する
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

    // 最後の1個を取った方が負けルールの場合
    // 盤面が空になったら、プレイヤーが手を打ったのでAIの勝ちとする
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
      // プレイヤーが打ったので、前回のAIの手情報はクリア
      newState.lastAIMove = null
    }

    updateGameState(newState)
  }

  useEffect(() => {
    if (gameState.currentTurn === "ai" && !gameState.gameOver) {
      const aiTimer = setTimeout(() => {
        const newState = { ...gameState }
        const blue = newState.bluePieces
        const yellow = newState.yellowPieces
        const red = newState.redPieces

        // Nim の計算
        const nimSum = blue ^ yellow ^ red

        // まず、残っている色（駒が残っている色）の一覧を取得
        const available = getAvailableColorsFromState(newState)
        let moveFound = false

        // ①　残っている色が2種類の場合、かつどちらかの色が1個なら、もう片方の色をすべて取る
        if (available.length === 2) {
          for (const color of available) {
            if (newState[`${color}Pieces` as "bluePieces" | "yellowPieces" | "redPieces"] === 1) {
              // もう一方の色を取得
              const otherColor = available.find((c) => c !== color)!
              const pile = newState[`${otherColor}Pieces` as "bluePieces" | "yellowPieces" | "redPieces"]
              // すべて取る（その色の個数分 removal）
              if (otherColor === "blue") {
                newState.bluePieces = 0
              } else if (otherColor === "yellow") {
                newState.yellowPieces = 0
              } else if (otherColor === "red") {
                newState.redPieces = 0
              }
              newState.selectedColor = otherColor
              newState.lastAIMove = { color: otherColor, count: pile }
              moveFound = true
              break
            }
          }
        }
        // ②　残っている色が1種類の場合、その色が2個以上あるなら「1個残して」すべて取る
        else if (available.length === 1) {
          const onlyColor = available[0]
          const pile = newState[`${onlyColor}Pieces` as "bluePieces" | "yellowPieces" | "redPieces"]
          if (pile > 1) {
            const removal = pile - 1 // 1個残す
            if (onlyColor === "blue") {
              newState.bluePieces = 1
            } else if (onlyColor === "yellow") {
              newState.yellowPieces = 1
            } else if (onlyColor === "red") {
              newState.redPieces = 1
            }
            newState.selectedColor = onlyColor
            newState.lastAIMove = { color: onlyColor, count: removal }
            moveFound = true
          }
        }

        // ★ 新規追加 ★
        // ③ 全ての色が盤面に残っている場合、もし2色がすでに1個で残っており、
        //    残りの1色が 1 でない場合は、残りの色から必要な個数を取って 1 にすることで (1,1,1) にできる
        if (!moveFound && available.length === 3) {
          if (blue === 1 && yellow === 1 && red > 1) {
            const removal = red - 1
            newState.redPieces = 1
            newState.selectedColor = "red"
            newState.lastAIMove = { color: "red", count: removal }
            moveFound = true
          } else if (blue === 1 && red === 1 && yellow > 1) {
            const removal = yellow - 1
            newState.yellowPieces = 1
            newState.selectedColor = "yellow"
            newState.lastAIMove = { color: "yellow", count: removal }
            moveFound = true
          } else if (yellow === 1 && red === 1 && blue > 1) {
            const removal = blue - 1
            newState.bluePieces = 1
            newState.selectedColor = "blue"
            newState.lastAIMove = { color: "blue", count: removal }
            moveFound = true
          }
        }

        // もし上記特別な手で moveFound が成立していなければ、従来の戦略に従う
        if (!moveFound) {
          if (nimSum !== 0) {
            // Nim戦略：最適な手を探す
            for (const color of ["blue", "yellow", "red"] as ("blue" | "yellow" | "red")[]) {
              const pile = newState[`${color}Pieces` as "bluePieces" | "yellowPieces" | "redPieces"]
              const target = pile ^ nimSum
              if (target < pile) {
                const removal = pile - target
                if (color === "blue") {
                  newState.bluePieces = pile - removal
                } else if (color === "yellow") {
                  newState.yellowPieces = pile - removal
                } else if (color === "red") {
                  newState.redPieces = pile - removal
                }
                newState.selectedColor = color
                newState.lastAIMove = { color, count: removal }
                moveFound = true
                break
              }
            }
          }
          // nimSum が 0 か、最適な手が見つからなかった場合はランダムに手を決める（最大2個）
          if (!moveFound) {
            const availableRandom = getAvailableColorsFromState(newState)
            if (availableRandom.length > 0) {
              const randomColor = availableRandom[Math.floor(Math.random() * availableRandom.length)]
              const pile = newState[`${randomColor}Pieces` as "bluePieces" | "yellowPieces" | "redPieces"]
              const maxRemoval = Math.min(2, pile)
              const removal = Math.floor(Math.random() * maxRemoval) + 1
              if (randomColor === "blue") {
                newState.bluePieces = pile - removal
              } else if (randomColor === "yellow") {
                newState.yellowPieces = pile - removal
              } else if (randomColor === "red") {
                newState.redPieces = pile - removal
              }
              newState.selectedColor = randomColor
              newState.lastAIMove = { color: randomColor, count: removal }
            }
          }
        }

        // AI が手を打った後、盤面が空ならプレイヤーの勝ち（最後の1個を取った方が負け）
        if (newState.bluePieces + newState.yellowPieces + newState.redPieces === 0) {
          newState.gameOver = true
          newState.winner = "player"
        } else {
          const availableAfter = getAvailableColorsFromState(newState)
          if (!availableAfter.includes(newState.selectedColor)) {
            newState.selectedColor = availableAfter.length > 0 ? availableAfter[0] : newState.selectedColor
            newState.selectedCount = availableAfter.length > 0 ? 1 : 0
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
        updateGameState(newState)
      }, 500)
      return () => clearTimeout(aiTimer)
    }
  }, [gameState])

  // 1手戻る処理：プレイヤーの手を戻すため、直近の2手（AIの手とその前のプレイヤーの手）を取り除く
  const undoLastMove = () => {
    setHistory((prev) => {
      if (prev.length < 2) return prev
      const newHistory = [...prev]
      // まず直近のAIの手を取り除く
      newHistory.pop()
      // 次にプレイヤーの手を取り除き、その状態に戻す
      const lastState = newHistory.pop()
      if (lastState) {
        setGameState(lastState)
      }
      return newHistory
    })
  }

  // 駒を描画する関数（クリックでその色を選択、ただし駒が 0 個なら選択不可）
  const renderPieces = (color: string, count: number, gridArea: any, isSelected: boolean) => {
    const pieces = []

    const colorConfig = {
      blue: {
        main: "#1a237e",
        light: "#3949ab",
        highlight: "#bbdefb",
        shadow: "#0d47a1",
        textColor: "#fff",
      },
      yellow: {
        main: "#f57f17",
        light: "#ffb300",
        highlight: "#fff8e1",
        shadow: "#e65100",
        textColor: "#333",
      },
      red: {
        main: "#b71c1c",
        light: "#e53935",
        highlight: "#ffcdd2",
        shadow: "#7f0000",
        textColor: "#fff",
      },
    }[color as "blue" | "yellow" | "red"]

    const borderColor = isSelected ? "#4CAF50" : "#9E9E9E"
    const borderWidth = isSelected ? "3px" : "1px"
    const boxShadow = isSelected
      ? `0 0 10px rgba(76, 175, 80, 0.5), inset 0 0 5px rgba(76, 175, 80, 0.3)`
      : `0 2px 4px rgba(0, 0, 0, 0.1)`

    for (let i = 0; i < count && i < 9; i++) {
      pieces.push(
        <Box
          key={`${color}-${i}`}
          sx={{
            width: { xs: 20, sm: 24 },
            height: { xs: 20, sm: 24 },
            borderRadius: "50%",
            backgroundColor: colorConfig.main,
            boxShadow: `0 2px 4px rgba(0,0,0,0.3), inset 0 -2px 2px ${colorConfig.shadow}, inset 0 2px 2px ${colorConfig.light}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "2px",
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 4,
              left: 4,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, ${colorConfig.highlight}, transparent 70%)`,
            },
          }}
        />
      )
    }

    return (
      <Box
        onClick={() => {
          if (count > 0) {
            setGameState((prev) => ({
              ...prev,
              selectedColor: color as "blue" | "yellow" | "red",
              selectedCount: 1,
            }))
          }
        }}
        sx={{
          gridArea,
          position: "relative",
          height: { xs: 80, sm: 100 },
          border: `${borderWidth} solid ${borderColor}`,
          borderRadius: "6px",
          backgroundColor: isSelected ? "rgba(220, 237, 200, 0.3)" : "rgba(240, 240, 245, 0.2)",
          boxShadow,
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          overflow: "hidden",
          cursor: count > 0 ? "pointer" : "default",
          "&::before": isSelected
            ? {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, transparent, #4CAF50, transparent)",
              animation: "pulse 1.5s infinite",
            }
            : {},
          "@keyframes pulse": {
            "0%": { opacity: 0.6 },
            "50%": { opacity: 1 },
            "100%": { opacity: 0.6 },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            padding: "5px",
            flex: 1,
          }}
        >
          {pieces}
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: isSelected ? "rgba(76, 175, 80, 0.8)" : "rgba(158, 158, 158, 0.7)",
            padding: "2px 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "all 0.3s ease",
          }}
        >
          <Typography
            sx={{
              color: "#fff",
              fontWeight: "bold",
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              textShadow: "0 1px 1px rgba(0,0,0,0.3)",
            }}
          >
            {count}個
          </Typography>
        </Box>
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
        justifyContent: "flex-start",
        background: "linear-gradient(135deg, #e0f7fa 0%, #b3e5fc 50%, #bbdefb 100%)",
        p: 1,
        pt: 2,
      }}
    >
      <Container maxWidth="md" sx={{ display: "flex", flexDirection: "column", gap: 2, px: { xs: 1, sm: 2 } }}>
        {/* ゲームタイトルとルール説明を縦並びに */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* ゲームタイトル */}
          <Typography
            variant="h5"
            component="h1"
            sx={{
              color: "#1a237e",
              fontWeight: "bold",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            駒取りゲーム
          </Typography>

          {/* ゲームルール説明 - 高さを上げて2行に */}
          <Paper
            elevation={2}
            sx={{
              p: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              minHeight: "70px",
            }}
          >
            <Typography variant="body2" sx={{ color: "#333", lineHeight: 1.6, ml: { xs: 0, sm: 15 } }}>
              ・3色のコマから1色を選び、その色のコマを1個以上取る行為を交互に行います
              <br />
              ・最後の1個を取った方が負けです
            </Typography>
          </Paper>
        </Box>

        {/* ゲームボード */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            borderRadius: "8px",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
              gap: 2,
              mb: 1,
            }}
          >
            {renderPieces(
              "blue",
              gameState.bluePieces,
              { xs: "1 / 1 / 2 / 2", sm: "1 / 1 / 2 / 2" },
              gameState.selectedColor === "blue"
            )}
            {renderPieces(
              "yellow",
              gameState.yellowPieces,
              { xs: "2 / 1 / 3 / 2", sm: "1 / 2 / 2 / 3" },
              gameState.selectedColor === "yellow"
            )}
            {renderPieces(
              "red",
              gameState.redPieces,
              { xs: "3 / 1 / 4 / 2", sm: "1 / 3 / 2 / 4" },
              gameState.selectedColor === "red"
            )}
          </Box>

          {/* AIの手の情報表示 */}
          {gameState.lastAIMove && (
            <Box
              sx={{
                mt: 1,
                p: 1,
                backgroundColor: "rgba(66, 66, 66, 0.05)",
                borderRadius: "6px",
                textAlign: "center",
                border: "1px dashed rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#555",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor:
                      gameState.lastAIMove.color === "blue"
                        ? "#1a237e"
                        : gameState.lastAIMove.color === "yellow"
                          ? "#f57f17"
                          : "#b71c1c",
                    display: "inline-block",
                    mr: 0.5,
                  }}
                />
                AIの手: {colorNames[gameState.lastAIMove.color]}から {gameState.lastAIMove.count} 個取りました
              </Typography>
            </Box>
          )}
        </Paper>

        {/* コントロールパネル */}
        {!gameState.gameOver ? (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {gameState.currentTurn === "player" ? (
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  {/* 色選択 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1,
                      backgroundColor: "rgba(240, 240, 245, 0.5)",
                      borderRadius: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      onClick={selectPrevColor}
                      size="small"
                      disabled={getAvailableColorsFromState(gameState).length <= 1}
                      sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        p: 0.5,
                        "&.Mui-disabled .MuiSvgIcon-root": { color: "#bdbdbd" },
                      }}
                    >
                      <ArrowBack fontSize="small" sx={{ color: "#333" }} />
                    </IconButton>

                    <Box
                      sx={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        backgroundColor:
                          gameState.selectedColor === "blue"
                            ? "#1a237e"
                            : gameState.selectedColor === "yellow"
                              ? "#f57f17"
                              : "#b71c1c",
                        mx: 2,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        border: "1px solid rgba(255,255,255,0.8)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          top: 5,
                          left: 5,
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 70%)",
                        },
                      }}
                    />

                    <IconButton
                      onClick={selectNextColor}
                      size="small"
                      disabled={getAvailableColorsFromState(gameState).length <= 1}
                      sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        p: 0.5,
                        "&.Mui-disabled .MuiSvgIcon-root": { color: "#bdbdbd" },
                      }}
                    >
                      <ArrowForward fontSize="small" sx={{ color: "#333" }} />
                    </IconButton>
                  </Box>

                  {/* 数量選択 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1,
                      backgroundColor: "rgba(240, 240, 245, 0.5)",
                      borderRadius: "8px",
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      onClick={decreaseCount}
                      disabled={gameState.selectedCount <= 1}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        p: 0.5,
                        "&.Mui-disabled .MuiSvgIcon-root": { color: "#bdbdbd" },
                      }}
                    >
                      <ArrowDownward fontSize="small" sx={{ color: "#333" }} />
                    </IconButton>

                    <Typography
                      variant="body1"
                      sx={{
                        mx: 2,
                        color: "#333",
                        fontWeight: "medium",
                      }}
                    >
                      {gameState.selectedCount} 個
                    </Typography>

                    <IconButton
                      onClick={increaseCount}
                      disabled={gameState.selectedCount >= getMaxSelectableCount()}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        p: 0.5,
                        "&.Mui-disabled .MuiSvgIcon-root": { color: "#bdbdbd" },
                      }}
                    >
                      <ArrowUpward fontSize="small" sx={{ color: "#333" }} />
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    mt: 2,
                    flexDirection: { xs: "column", sm: "row" },
                    width: "100%",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={confirmPlayerMove}
                    sx={{
                      borderRadius: "20px",
                      px: 3,
                      py: 0.8,
                      backgroundColor: "#4caf50",
                      color: "#fff",
                      fontWeight: "bold",
                      boxShadow: "0 2px 5px rgba(76, 175, 80, 0.3)",
                      "&:hover": {
                        backgroundColor: "#388e3c",
                      },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    決定
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={undoLastMove}
                    sx={{
                      borderRadius: "20px",
                      px: 3,
                      py: 0.8,
                      color: "#555",
                      borderColor: "#ccc",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      "&:hover": {
                        backgroundColor: "rgba(240, 240, 240, 0.9)",
                        borderColor: "#999",
                      },
                      "&.Mui-disabled": {
                        opacity: 0.5,
                        color: "#999",
                      },
                      width: { xs: "100%", sm: "auto" },
                    }}
                    disabled={history.length < 2}
                  >
                    1手戻る
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 1 }}>
                <Typography variant="body1" sx={{ color: "#333", mb: 1 }}>
                  AIの番です...
                </Typography>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: "#f0f0f0",
                    margin: "0 auto",
                    position: "relative",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: "3px solid #3f51b5",
                      borderTopColor: "transparent",
                      animation: "spin 1s linear infinite",
                    },
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </Box>
            )}
          </Paper>
        ) : (
          <Paper
            elevation={3}
            sx={{
              p: 2,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                color: "#333",
                fontWeight: "bold",
              }}
            >
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
              {gameState.winner === "player" ? "あなたの勝ちです！" : "AIの勝ちです"}
            </Typography>

            <Button
              variant="contained"
              component={Link}
              to="/"
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
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
