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

  // -------------------------------------------------------------------
  // ゲーム状態の更新と履歴への追加を一括で行う関数
  // -------------------------------------------------------------------
  function updateGameState(newState: GameState) {
    setGameState(newState)
    setHistory((prevHistory) => [...prevHistory, newState])
  }

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
    if (gameState.currentTurn === "white" && !gameState.gameOver) {
      const aiTimer = setTimeout(() => {
        const depth = 4
        const result = minimax(gameState.board, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true)

        if (result.move) {
          const newBoard = placePiece(gameState.board, result.move.row, result.move.col, "white")
          const blackValidMoves = findValidMoves(newBoard, "black")

          updateGameState({
            board: newBoard,
            currentTurn: blackValidMoves.length > 0 ? "black" : "white",
            blackScore: countPieces(newBoard, "black"),
            whiteScore: countPieces(newBoard, "white"),
            gameOver: blackValidMoves.length === 0 && findValidMoves(newBoard, "white").length === 0,
            winner:
              blackValidMoves.length === 0 && findValidMoves(newBoard, "white").length === 0
                ? determineWinner(newBoard)
                : null,
            validMoves: blackValidMoves,
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
  }, [gameState])

  // ミニマックスアルゴリズム（α-β枝刈り付き）
  function minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean,
  ): { score: number; move: Position | null } {
    const color = maximizingPlayer ? "white" : "black"
    const validMoves = findValidMoves(board, color)

    if (depth === 0 || validMoves.length === 0) {
      return {
        score: evaluateBoard(board),
        move: null,
      }
    }

    let bestMove: Position | null = null

    if (maximizingPlayer) {
      let maxEval = Number.NEGATIVE_INFINITY
      for (const move of validMoves) {
        const newBoard = placePiece(board, move.row, move.col, "white")
        const evalResult = minimax(newBoard, depth - 1, alpha, beta, false)
        if (evalResult.score > maxEval) {
          maxEval = evalResult.score
          bestMove = move
        }
        alpha = Math.max(alpha, evalResult.score)
        if (beta <= alpha) break
      }
      return { score: maxEval, move: bestMove }
    } else {
      let minEval = Number.POSITIVE_INFINITY
      for (const move of validMoves) {
        const newBoard = placePiece(board, move.row, move.col, "black")
        const evalResult = minimax(newBoard, depth - 1, alpha, beta, true)
        if (evalResult.score < minEval) {
          minEval = evalResult.score
          bestMove = move
        }
        beta = Math.min(beta, evalResult.score)
        if (beta <= alpha) break
      }
      return { score: minEval, move: bestMove }
    }
  }

  // 盤面の評価関数（もともとは白側有利なら正なので、黒側有利に表示するため最終的に表示時に符号反転します）
  function evaluateBoard(board: Board): number {
    const blackCount = countPieces(board, "black")
    const whiteCount = countPieces(board, "white")
    const pieceDifference = whiteCount - blackCount

    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: 5 },
      { row: 5, col: 0 },
      { row: 5, col: 5 },
    ]
    let cornerScore = 0
    for (const corner of corners) {
      if (board[corner.row][corner.col] === "white") {
        cornerScore += 10
      } else if (board[corner.row][corner.col] === "black") {
        cornerScore -= 10
      }
    }

    const edges = [
      ...Array(6)
        .fill(0)
        .map((_, i) => ({ row: 0, col: i })),
      ...Array(6)
        .fill(0)
        .map((_, i) => ({ row: 5, col: i })),
      ...Array(4)
        .fill(0)
        .map((_, i) => ({ row: i + 1, col: 0 })),
      ...Array(4)
        .fill(0)
        .map((_, i) => ({ row: i + 1, col: 5 })),
    ]
    let edgeScore = 0
    for (const edge of edges) {
      if (board[edge.row][edge.col] === "white") {
        edgeScore += 2
      } else if (board[edge.row][edge.col] === "black") {
        edgeScore -= 2
      }
    }

    const whiteMobility = findValidMoves(board, "white").length
    const blackMobility = findValidMoves(board, "black").length
    const mobilityScore = whiteMobility - blackMobility

    return pieceDifference * 3 + cornerScore + edgeScore + mobilityScore * 2
  }

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
  // ================   各有効手のMinimax評価の計算   ============
  // ===========================================================
  // 現在の盤面から、指定セルに黒を置いた場合の最終的な局面評価（黒側視点）を計算する関数
  function getMinimaxEvaluationForMove(row: number, col: number): number {
    // 黒がそのセルに置いた場合の新たな盤面を作成
    const newBoard = placePiece(gameState.board, row, col, "black")
    // 次は白の手番になるため、maximizingPlayer は true
    const result = minimax(newBoard, 4, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true)
    // evaluateBoard は白有利が正なので、黒側視点にするには符号を反転
    const moveScore = -result.score
    return moveScore
  }

  // 各有効手についての評価をひとまとめに計算（再描画のたびに計算されます）
  const validMoveEvaluations: { [key: string]: number } = {}
  gameState.validMoves.forEach((move) => {
    validMoveEvaluations[`${move.row}-${move.col}`] = getMinimaxEvaluationForMove(move.row, move.col)
  })

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
        background: "linear-gradient(135deg, #e0e0e0 0%, #b0c4de 50%, #d1c4e9 100%)",
        p: 1,
        pt: 2,
      }}
    >
      <Container maxWidth="sm" sx={{ display: "flex", flexDirection: "column", gap: 2, px: { xs: 1, sm: 2 } }}>
        {/* タイトルとルール */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              color: "#303f9f",
              fontWeight: "bold",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            ストレンジオセロ
          </Typography>
          <Paper
            elevation={2}
            sx={{
              p: 1.5,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
            }}
          >
            <Typography variant="body2" sx={{ color: "#333", lineHeight: 1.4 }}>
              ・通常とは異なる初期盤面でのオセロです
            </Typography>
          </Paper>
        </Box>

        {/* ゲーム情報 */}
        <Paper
          elevation={3}
          sx={{
            p: 1.5,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "8px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Typography variant="body2" sx={{ color: "#333", fontWeight: "medium" }}>
              {gameState.currentTurn === "black" ? "あなたの番（黒）" : "AIの番（白）..."}
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {/* 黒の得点 */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: "#000000",
                  }}
                />
                <Typography variant="body2" sx={{ color: "#333" }}>
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
                    backgroundColor: "#ffffff",
                    border: "1px solid #999",
                  }}
                />
                <Typography variant="body2" sx={{ color: "#333" }}>
                  {gameState.whiteScore}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* 盤面（固定幅 300px） */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 1, sm: 2 },
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            borderRadius: "8px",
            width: { xs: "100%", sm: "300px" },
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
                      backgroundColor: "#c8e6c9",
                      border: "1px solid #81c784",
                      cursor:
                        gameState.currentTurn === "black" &&
                        gameState.validMoves.some((move) => move.row === rowIndex && move.col === colIndex)
                          ? "pointer"
                          : "default",
                      "&:hover": {
                        backgroundColor:
                          gameState.currentTurn === "black" &&
                          gameState.validMoves.some((move) => move.row === rowIndex && move.col === colIndex)
                            ? "#a5d6a7"
                            : "#c8e6c9",
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
                              backgroundColor: "rgba(0, 128, 0, 0.3)",
                            },
                          }
                        : {}),
                    }}
                  >
                    {/* もしセルに駒があるなら描画 */}
                    {cell !== "empty" && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: "10%",
                          left: "10%",
                          width: "80%",
                          height: "80%",
                          borderRadius: "50%",
                          backgroundColor: cell === "black" ? "#000000" : "#ffffff",
                          border: cell === "white" ? "1px solid #333" : "none",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      />
                    )}
                    {/* 該当セルが有効手なら、Minimax評価（黒視点）を上書き表示 */}
                    {validMoveEvaluations[`${rowIndex}-${colIndex}`] !== undefined && (
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          pointerEvents: "none",
                          fontWeight: "bold",
                          color: validMoveEvaluations[`${rowIndex}-${colIndex}`] >= 0 ? "green" : "red",
                          textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                        }}
                      >
                        {validMoveEvaluations[`${rowIndex}-${colIndex}`] >= 0
                          ? `＋${validMoveEvaluations[`${rowIndex}-${colIndex}`]}`
                          : validMoveEvaluations[`${rowIndex}-${colIndex}`]}
                      </Typography>
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
              gap: 1,
              flexDirection: { xs: "column", sm: "row" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={handleUndo}
              disabled={history.length < 3} // 履歴が足りない場合は無効化
              sx={{
                borderRadius: "20px",
                px: 3,
                py: 0.5,
                color: "#555",
                borderColor: "#ccc",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                fontSize: "0.8rem",
                width: { xs: "100%", sm: "auto" },
                "&.Mui-disabled": {
                  opacity: 0.5,
                  color: "#999",
                },
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
                color: gameState.winner === "black" ? "#4caf50" : gameState.winner === "white" ? "#f44336" : "#ff9800",
                fontWeight: "medium",
                mb: 2,
                p: 1,
                backgroundColor:
                  gameState.winner === "black"
                    ? "rgba(76, 175, 80, 0.1)"
                    : gameState.winner === "white"
                    ? "rgba(244, 67, 54, 0.1)"
                    : "rgba(255, 152, 0, 0.1)",
                borderRadius: "6px",
                display: "inline-block",
              }}
            >
              {gameState.winner === "black"
                ? "プレイヤーの勝ちです！"
                : gameState.winner === "white"
                ? "AIの勝ちです"
                : "引き分けです"}
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
      </Container>
    </Box>
  )
}
