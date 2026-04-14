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

  // 駒の色設定
  const pieceColors = {
    blue: { main: "#3b5998", light: "#5b7dc0", shadow: "#2c4373" },
    yellow: { main: "#d4a017", light: "#e6b830", shadow: "#b8860b" },
    red: { main: "#c0392b", light: "#e05544", shadow: "#8b1a10" },
  }

  // 駒を描画する関数（クリックでその色を選択、ただし駒が 0 個なら選択不可）
  const renderPieces = (color: string, count: number, gridArea: any, isSelected: boolean) => {
    const pieces = []
    const config = pieceColors[color as "blue" | "yellow" | "red"]

    for (let i = 0; i < count && i < 9; i++) {
      pieces.push(
        <Box
          key={`${color}-${i}`}
          sx={{
            width: { xs: 22, sm: 26 },
            height: { xs: 22, sm: 26 },
            borderRadius: "50%",
            backgroundColor: config.main,
            boxShadow: `0 2px 4px rgba(0,0,0,0.2), inset 0 -2px 2px ${config.shadow}, inset 0 2px 2px ${config.light}`,
            margin: "2px",
          }}
        />,
      )
    }

    return (
      <Box
        onClick={() => {
          if (count > 0) {
            setGameState((prev) => {
              if (prev.selectedColor === color) {
                if (prev.selectedCount < count) {
                  return { ...prev, selectedCount: prev.selectedCount + 1 }
                } else {
                  return prev
                }
              } else {
                return {
                  ...prev,
                  selectedColor: color as "blue" | "yellow" | "red",
                  selectedCount: 1,
                }
              }
            })
          }
        }}
        sx={{
          gridArea,
          position: "relative",
          height: { xs: 80, sm: 100 },
          border: isSelected ? "2px solid #059669" : "1px solid",
          borderColor: isSelected ? "#059669" : "divider",
          borderRadius: 3,
          backgroundColor: isSelected ? "#ecfdf5" : "#fafaf9",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.2s ease",
          overflow: "hidden",
          cursor: count > 0 ? "pointer" : "default",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            padding: "6px",
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
            backgroundColor: isSelected ? "#059669" : "#9ca3af",
            padding: "2px 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "all 0.2s ease",
          }}
        >
          <Typography
            sx={{
              color: "#fff",
              fontWeight: 600,
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
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
            駒取りゲーム
          </Typography>

          <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7, ml: { xs: 0, sm: 15 } }}>
              ・3色のコマから1色を選び、その色のコマを1個以上取る行為を交互に行います
              <br />
              ・最後の1個を取った方が負けです
            </Typography>
          </Paper>
        </Box>

        {/* ゲームボード */}
        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
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
              gameState.selectedColor === "blue",
            )}
            {renderPieces(
              "yellow",
              gameState.yellowPieces,
              { xs: "2 / 1 / 3 / 2", sm: "1 / 2 / 2 / 3" },
              gameState.selectedColor === "yellow",
            )}
            {renderPieces(
              "red",
              gameState.redPieces,
              { xs: "3 / 1 / 4 / 2", sm: "1 / 3 / 2 / 4" },
              gameState.selectedColor === "red",
            )}
          </Box>

          {/* AIの手の情報表示 */}
          {gameState.lastAIMove && (
            <Box
              sx={{
                mt: 1.5,
                p: 1.5,
                backgroundColor: "#f9fafb",
                borderRadius: 2,
                textAlign: "center",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Box
                  component="span"
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: pieceColors[gameState.lastAIMove.color].main,
                    display: "inline-block",
                  }}
                />
                AIの手: {colorNames[gameState.lastAIMove.color]}から {gameState.lastAIMove.count} 個取りました
              </Typography>
            </Box>
          )}
        </Paper>

        {/* コントロールパネル */}
        {!gameState.gameOver ? (
          <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {gameState.currentTurn === "player" ? (
              <>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "100%" }}>
                  {/* 色選択 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1,
                      backgroundColor: "#f9fafb",
                      borderRadius: 2,
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      onClick={selectPrevColor}
                      size="small"
                      disabled={getAvailableColorsFromState(gameState).length <= 1}
                      sx={{ p: 0.5 }}
                    >
                      <ArrowBack fontSize="small" sx={{ color: "text.secondary" }} />
                    </IconButton>

                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        backgroundColor: pieceColors[gameState.selectedColor].main,
                        mx: 2.5,
                        boxShadow: `0 2px 6px ${pieceColors[gameState.selectedColor].shadow}40`,
                      }}
                    />

                    <IconButton
                      onClick={selectNextColor}
                      size="small"
                      disabled={getAvailableColorsFromState(gameState).length <= 1}
                      sx={{ p: 0.5 }}
                    >
                      <ArrowForward fontSize="small" sx={{ color: "text.secondary" }} />
                    </IconButton>
                  </Box>

                  {/* 数量選択 */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1,
                      backgroundColor: "#f9fafb",
                      borderRadius: 2,
                      justifyContent: "center",
                    }}
                  >
                    <IconButton
                      onClick={decreaseCount}
                      disabled={gameState.selectedCount <= 1}
                      size="small"
                      sx={{ p: 0.5 }}
                    >
                      <ArrowDownward fontSize="small" sx={{ color: "text.secondary" }} />
                    </IconButton>

                    <Typography
                      variant="body1"
                      sx={{ mx: 2.5, color: "text.primary", fontWeight: 500 }}
                    >
                      {gameState.selectedCount} 個
                    </Typography>

                    <IconButton
                      onClick={increaseCount}
                      disabled={gameState.selectedCount >= getMaxSelectableCount()}
                      size="small"
                      sx={{ p: 0.5 }}
                    >
                      <ArrowUpward fontSize="small" sx={{ color: "text.secondary" }} />
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    mt: 2.5,
                    flexDirection: { xs: "column", sm: "row" },
                    width: "100%",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={confirmPlayerMove}
                    sx={{
                      borderRadius: 10,
                      px: 3,
                      py: 1,
                      backgroundColor: "#059669",
                      color: "#fff",
                      fontWeight: 600,
                      "&:hover": { backgroundColor: "#047857" },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    決定
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={undoLastMove}
                    sx={{
                      borderRadius: 10,
                      px: 3,
                      py: 1,
                      color: "text.secondary",
                      borderColor: "divider",
                      "&:hover": { borderColor: "text.secondary" },
                      width: { xs: "100%", sm: "auto" },
                    }}
                    disabled={history.length < 2}
                  >
                    1手戻る
                  </Button>
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="body1" sx={{ color: "text.primary", mb: 1.5 }}>
                  AIの番です...
                </Typography>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
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
                      border: "3px solid #2d3142",
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
              {gameState.winner === "player" ? "あなたの勝ちです！" : "AIの勝ちです"}
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
                  setGameState({
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
                variant="contained"
                component={Link}
                to="/"
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
