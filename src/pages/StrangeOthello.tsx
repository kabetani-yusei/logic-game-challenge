"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Paper, Container } from "@mui/material"
import { Link } from "react-router-dom"

// ===========================================================
// ================   Types and Constants   ==================
// ===========================================================

// 各セルの状態：空、黒、白
type CellState = "empty" | "black" | "white"

// 盤面は CellState の2次元配列
type Board = CellState[][]

// 盤面上の位置（行と列）
type Position = { row: number; col: number }

interface OthelloSolutionTable {
  initialTurn: "black" | "white"
  rootValue: number
  whiteMoveTable: Record<string, [number, number]>
  visitedStateCount: number
  whiteStateCount: number
}

// ゲーム全体の状態
interface GameState {
  board: Board
  currentTurn: "black" | "white"
  blackScore: number
  whiteScore: number
  gameOver: boolean
  winner: "black" | "white" | "draw" | null
  validMoves: Position[]
}

// 駒をひっくり返す方向：上下左右および斜め
const DIRECTIONS = [
  { row: -1, col: 0 }, // 上
  { row: -1, col: 1 }, // 右上
  { row: 0, col: 1 }, // 右
  { row: 1, col: 1 }, // 右下
  { row: 1, col: 0 }, // 下
  { row: 1, col: -1 }, // 左下
  { row: 0, col: -1 }, // 左
  { row: -1, col: -1 }, // 左上
]

// ===========================================================
// ================      Main Othello      =================
// ===========================================================

export default function Othello() {
  // -------------------------------------------------------------------
  // 初期配置（6x6）
  // ※ 外枠について
  //   ・上段：右端セル（col5）は white、それ以外は左方向に向かって black
  //   ・各行の右端セル（col5）は全て white
  // ※ 中央部分：Row2, Row3 の列2～3に斜めパターン（Row2: [white, black]、Row3: [black, white]）
  // -------------------------------------------------------------------
  const initialBoard: Board = [
    // Row 0: 上段 — col0～col4 が black、col5 が white
    ["black", "black", "black", "black", "black", "white"],
    // Row 1
    ["black", "empty", "empty", "empty", "empty", "white"],
    // Row 2
    ["black", "empty", "white", "black", "empty", "white"],
    // Row 3
    ["black", "empty", "black", "white", "empty", "white"],
    // Row 4
    ["black", "empty", "empty", "empty", "empty", "white"],
    // Row 5: 下段 — 左端は black、右側は white
    ["black", "white", "white", "white", "white", "white"],
  ]

  // -------------------------------------------------------------------
  // 初期状態の作成
  // -------------------------------------------------------------------
  const initialValidMoves = findValidMoves(initialBoard, "black")
  const initialGameState: GameState = {
    board: initialBoard,
    currentTurn: "black", // プレイヤー（黒）が先手
    blackScore: countPieces(initialBoard, "black"),
    whiteScore: countPieces(initialBoard, "white"),
    gameOver: false,
    winner: null,
    validMoves: initialValidMoves,
  }

  // -------------------------------------------------------------------
  // ゲーム状態と履歴の State
  // -------------------------------------------------------------------
  const [gameState, setGameState] = useState<GameState>(initialGameState)
  const [history, setHistory] = useState<GameState[]>([initialGameState])
  const [solutionTable, setSolutionTable] = useState<OthelloSolutionTable | null>(null)

  // -------------------------------------------------------------------
  // ゲーム状態の更新と履歴への追加を一括で行う関数
  // -------------------------------------------------------------------
  function updateGameState(newState: GameState) {
    setGameState(newState)
    setHistory((prevHistory) => [...prevHistory, newState])
  }

  useEffect(() => {
    let cancelled = false

    async function loadSolutionTable() {
      const response = await fetch("/strange-othello-table.json")
      const table = (await response.json()) as OthelloSolutionTable
      if (!cancelled) {
        setSolutionTable(table)
      }
    }

    loadSolutionTable().catch((error) => {
      console.error("Failed to load strange othello table", error)
    })

    return () => {
      cancelled = true
    }
  }, [])

  // ===========================================================
  // ================      Utility Functions     =============
  // ===========================================================

  // 指定した色の駒の数を数える
  function countPieces(board: Board, color: "black" | "white"): number {
    let count = 0
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === color) {
          count++
        }
      }
    }
    return count
  }

  function encodeBoard(board: Board): string {
    return board.flat().map((cell) => (cell === "empty" ? "." : cell === "black" ? "B" : "W")).join("")
  }

  // 指定した色の有効な手を探す
  function findValidMoves(board: Board, color: "black" | "white"): Position[] {
    const opponent = color === "black" ? "white" : "black"
    const validMoves: Position[] = []

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] !== "empty") continue

        for (const dir of DIRECTIONS) {
          let r = row + dir.row
          let c = col + dir.col
          let foundOpponent = false

          while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === opponent) {
            foundOpponent = true
            r += dir.row
            c += dir.col
          }

          if (foundOpponent && r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === color) {
            validMoves.push({ row, col })
            break
          }
        }
      }
    }

    return validMoves
  }

  // ひっくり返すべき駒の位置を計算
  function getFlippedPieces(board: Board, row: number, col: number, color: "black" | "white"): Position[] {
    const opponent = color === "black" ? "white" : "black"
    const flippedPieces: Position[] = []

    for (const dir of DIRECTIONS) {
      const piecesToFlip: Position[] = []
      let r = row + dir.row
      let c = col + dir.col

      while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === opponent) {
        piecesToFlip.push({ row: r, col: c })
        r += dir.row
        c += dir.col
      }

      if (
        piecesToFlip.length > 0 &&
        r >= 0 &&
        r < board.length &&
        c >= 0 &&
        c < board[0].length &&
        board[r][c] === color
      ) {
        flippedPieces.push(...piecesToFlip)
      }
    }

    return flippedPieces
  }

  // 駒を配置し盤面を更新
  function placePiece(board: Board, row: number, col: number, color: "black" | "white"): Board {
    const newBoard = board.map((r) => [...r])
    newBoard[row][col] = color

    const flippedPieces = getFlippedPieces(board, row, col, color)
    for (const piece of flippedPieces) {
      newBoard[piece.row][piece.col] = color
    }

    return newBoard
  }

  // -------------------------------------------------------------------
  // プレイヤー（黒）の操作
  // -------------------------------------------------------------------
  function handleBlackMove(row: number, col: number) {
    if (
      gameState.currentTurn !== "black" ||
      gameState.gameOver ||
      !gameState.validMoves.some((move) => move.row === row && move.col === col)
    ) {
      return
    }

    const newBoard = placePiece(gameState.board, row, col, "black")
    const whiteValidMoves = findValidMoves(newBoard, "white")
    // ← AIの有効手がない場合、黒の有効手を再計算する
    const nextValidMoves = whiteValidMoves.length > 0 ? whiteValidMoves : findValidMoves(newBoard, "black")

    updateGameState({
      board: newBoard,
      currentTurn: whiteValidMoves.length > 0 ? "white" : "black",
      blackScore: countPieces(newBoard, "black"),
      whiteScore: countPieces(newBoard, "white"),
      gameOver: whiteValidMoves.length === 0 && findValidMoves(newBoard, "black").length === 0,
      winner: null,
      validMoves: nextValidMoves,
    })
  }

  // -------------------------------------------------------------------
  // AI（白）の操作
  // -------------------------------------------------------------------
  useEffect(() => {
    if (gameState.currentTurn === "white" && !gameState.gameOver && solutionTable) {
      const aiTimer = setTimeout(() => {
        const encodedBoard = encodeBoard(gameState.board)
        const storedMove = solutionTable.whiteMoveTable[encodedBoard]
        const result = storedMove ? { move: { row: storedMove[0], col: storedMove[1] } } : { move: null }

        if (result.move) {
          const newBoard = placePiece(gameState.board, result.move.row, result.move.col, "white")
          const blackValidMoves = findValidMoves(newBoard, "black")
          const whiteValidMoves = findValidMoves(newBoard, "white")
          const nextTurn = blackValidMoves.length > 0 ? "black" : "white"
          const nextValidMoves = nextTurn === "black" ? blackValidMoves : whiteValidMoves
          const gameOver = blackValidMoves.length === 0 && whiteValidMoves.length === 0

          updateGameState({
            board: newBoard,
            currentTurn: nextTurn,
            blackScore: countPieces(newBoard, "black"),
            whiteScore: countPieces(newBoard, "white"),
            gameOver,
            winner: gameOver ? determineWinner(newBoard) : null,
            validMoves: nextValidMoves,
          })
        } else {
          const blackValidMoves = findValidMoves(gameState.board, "black")
          if (blackValidMoves.length === 0) {
            updateGameState({
              ...gameState,
              gameOver: true,
              winner: determineWinner(gameState.board),
            })
          } else {
            updateGameState({
              ...gameState,
              currentTurn: "black",
              validMoves: blackValidMoves,
            })
          }
        }
      }, 1000)

      return () => clearTimeout(aiTimer)
    }
  }, [gameState, solutionTable])

  // ゲーム終了時の勝者判定
  function determineWinner(board: Board): "black" | "white" | "draw" {
    const blackCount = countPieces(board, "black")
    const whiteCount = countPieces(board, "white")
    if (blackCount > whiteCount) return "black"
    if (whiteCount > blackCount) return "white"
    return "draw"
  }

  useEffect(() => {
    if (gameState.gameOver && !gameState.winner) {
      updateGameState({
        ...gameState,
        winner: determineWinner(gameState.board),
      })
    }
  }, [gameState])

  // ===========================================================
  // ================      Undo Move Function      ============
  // ===========================================================
  // Undo機能の修正
  function handleUndo() {
    // 初期状態＋2手（プレイヤーとAI）以上の場合にUndoを実施
    setHistory((prevHistory) => {
      if (prevHistory.length >= 3) {
        // 履歴の末尾2手分を取り除く
        const newHistory = prevHistory.slice(0, prevHistory.length - 2)
        // 直前の状態を取得しゲーム状態に反映
        const previousState = newHistory[newHistory.length - 1]
        setGameState(previousState)
        return newHistory
      }
      return prevHistory
    })
  }

  // ===========================================================
  // ================         Rendering UI         ============
  // ===========================================================
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
      <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", gap: 2.5, px: { xs: 1, sm: 2 } }}>
        {/* タイトルとルール */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{ color: "text.primary", textAlign: "center" }}
          >
            ストレンジオセロ
          </Typography>
          <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
              ・通常とは異なる初期盤面でのオセロです
            </Typography>
          </Paper>
        </Box>

        {/* ゲーム情報 */}
        <Paper sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
              {gameState.currentTurn === "black" ? "あなたの番（黒）" : "AIの番（白）..."}
            </Typography>
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              {/* 黒の得点 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "#1a1a2e",
                  }}
                />
                <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                  {gameState.blackScore}
                </Typography>
              </Box>
              {/* 白の得点 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "#f5f5f5",
                    border: "1.5px solid #d1d5db",
                  }}
                />
                <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                  {gameState.whiteScore}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* 盤面 */}
        <Paper
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            border: "1px solid",
            borderColor: "divider",
            width: { xs: "100%", sm: "320px" },
            mx: "auto",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {gameState.board.map((row, rowIndex) => (
              <Box key={`row-${rowIndex}`} sx={{ display: "flex", flexDirection: "row" }}>
                {row.map((cell, colIndex) => (
                  <Box
                    key={`cell-${rowIndex}-${colIndex}`}
                    onClick={() => handleBlackMove(rowIndex, colIndex)}
                    sx={{
                      width: "16.666%",
                      paddingTop: "16.666%",
                      position: "relative",
                      backgroundColor: "#2d6a4f",
                      border: "1px solid #40916c",
                      cursor:
                        gameState.currentTurn === "black" &&
                        gameState.validMoves.some((move) => move.row === rowIndex && move.col === colIndex)
                          ? "pointer"
                          : "default",
                      "&:hover": {
                        backgroundColor:
                          gameState.currentTurn === "black" &&
                          gameState.validMoves.some((move) => move.row === rowIndex && move.col === colIndex)
                            ? "#1b4332"
                            : "#2d6a4f",
                      },
                      ...(gameState.currentTurn === "black" &&
                      gameState.validMoves.some((move) => move.row === rowIndex && move.col === colIndex)
                        ? {
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              width: "30%",
                              height: "30%",
                              borderRadius: "50%",
                              backgroundColor: "rgba(255, 255, 255, 0.25)",
                            },
                          }
                        : {}),
                    }}
                  >
                    {cell !== "empty" && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: "10%",
                          left: "10%",
                          width: "80%",
                          height: "80%",
                          borderRadius: "50%",
                          backgroundColor: cell === "black" ? "#1a1a2e" : "#f5f5f5",
                          border: cell === "white" ? "1.5px solid #d1d5db" : "none",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Paper>

        {/* ゲーム中の場合：Undoボタンとタイトルへ戻るボタン */}
        {!gameState.gameOver && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1.5,
              flexDirection: { xs: "column", sm: "row" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={handleUndo}
              disabled={history.length < 3}
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
                color:
                  gameState.winner === "black" ? "#059669" : gameState.winner === "white" ? "#dc2626" : "#d97706",
                fontWeight: 600,
                mb: 2,
                p: 1.5,
                backgroundColor:
                  gameState.winner === "black"
                    ? "#ecfdf5"
                    : gameState.winner === "white"
                      ? "#fef2f2"
                      : "#fffbeb",
                borderRadius: 2,
                display: "inline-block",
              }}
            >
              {gameState.winner === "black"
                ? "プレイヤーの勝ちです！"
                : gameState.winner === "white"
                  ? "AIの勝ちです"
                  : "引き分けです"}
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
                  setGameState(initialGameState)
                  setHistory([initialGameState])
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
      </Container>
    </Box>
  )
}
