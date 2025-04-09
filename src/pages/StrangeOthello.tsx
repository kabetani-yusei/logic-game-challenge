"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, Paper, Container } from "@mui/material"
import { Link } from "react-router-dom"

// ボードの状態を表す型
type CellState = "empty" | "player" | "ai"
type Board = CellState[][]
type Position = { row: number; col: number }

// ゲームの状態を表す型
interface GameState {
  board: Board
  currentTurn: "player" | "ai"
  playerScore: number
  aiScore: number
  gameOver: boolean
  winner: "player" | "ai" | "draw" | null
  validMoves: Position[]
}

// 方向を表す定数
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

export default function StrangeOthello() {
  // 初期ボードの状態（6x6）
  const initialBoard: Board = [
    ["player", "empty", "empty", "empty", "empty", "empty"],
    ["player", "empty", "empty", "empty", "empty", "empty"],
    ["player", "empty", "player", "empty", "empty", "empty"],
    ["player", "empty", "empty", "player", "empty", "empty"],
    ["player", "empty", "empty", "empty", "empty", "empty"],
    ["player", "ai", "ai", "ai", "ai", "ai"],
  ]

  // ゲームの初期状態
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialValidMoves = findValidMoves(initialBoard, "player")
    return {
      board: initialBoard,
      currentTurn: "player",
      playerScore: countPieces(initialBoard, "player"),
      aiScore: countPieces(initialBoard, "ai"),
      gameOver: false,
      winner: null,
      validMoves: initialValidMoves,
    }
  })

  // 駒の数を数える関数
  function countPieces(board: Board, player: "player" | "ai"): number {
    let count = 0
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] === player) {
          count++
        }
      }
    }
    return count
  }

  // 有効な手を見つける関数
  function findValidMoves(board: Board, player: "player" | "ai"): Position[] {
    const opponent = player === "player" ? "ai" : "player"
    const validMoves: Position[] = []

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        if (board[row][col] !== "empty") continue

        // 各方向をチェック
        for (const dir of DIRECTIONS) {
          let r = row + dir.row
          let c = col + dir.col
          let foundOpponent = false

          // ボード上にあり、相手の駒があるか確認
          while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === opponent) {
            foundOpponent = true
            r += dir.row
            c += dir.col
          }

          // 相手の駒を挟んで自分の駒があるか確認
          if (foundOpponent && r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === player) {
            validMoves.push({ row, col })
            break // この位置は有効なので、他の方向をチェックする必要はない
          }
        }
      }
    }

    return validMoves
  }

  // 駒を置いた時に裏返る駒を計算する関数
  function getFlippedPieces(board: Board, row: number, col: number, player: "player" | "ai"): Position[] {
    const opponent = player === "player" ? "ai" : "player"
    const flippedPieces: Position[] = []

    // 各方向をチェック
    for (const dir of DIRECTIONS) {
      const piecesToFlip: Position[] = []
      let r = row + dir.row
      let c = col + dir.col

      // ボード上にあり、相手の駒があるか確認
      while (r >= 0 && r < board.length && c >= 0 && c < board[0].length && board[r][c] === opponent) {
        piecesToFlip.push({ row: r, col: c })
        r += dir.row
        c += dir.col
      }

      // 相手の駒を挟んで自分の駒があるか確認
      if (
        piecesToFlip.length > 0 &&
        r >= 0 &&
        r < board.length &&
        c >= 0 &&
        c < board[0].length &&
        board[r][c] === player
      ) {
        flippedPieces.push(...piecesToFlip)
      }
    }

    return flippedPieces
  }

  // 駒を置く関数
  function placePiece(board: Board, row: number, col: number, player: "player" | "ai"): Board {
    const newBoard = board.map((r) => [...r])
    newBoard[row][col] = player

    // 裏返る駒を計算
    const flippedPieces = getFlippedPieces(board, row, col, player)

    // 駒を裏返す
    for (const piece of flippedPieces) {
      newBoard[piece.row][piece.col] = player
    }

    return newBoard
  }

  // プレイヤーの手を処理する関数
  function handlePlayerMove(row: number, col: number) {
    if (
      gameState.currentTurn !== "player" ||
      gameState.gameOver ||
      !gameState.validMoves.some((move) => move.row === row && move.col === col)
    ) {
      return
    }

    // 新しいボードを作成
    const newBoard = placePiece(gameState.board, row, col, "player")

    // AIの有効な手を計算
    const aiValidMoves = findValidMoves(newBoard, "ai")

    // ゲーム状態を更新
    setGameState({
      board: newBoard,
      currentTurn: aiValidMoves.length > 0 ? "ai" : "player",
      playerScore: countPieces(newBoard, "player"),
      aiScore: countPieces(newBoard, "ai"),
      gameOver: aiValidMoves.length === 0 && findValidMoves(newBoard, "player").length === 0,
      winner: null,
      validMoves: aiValidMoves,
    })
  }

  // ミニマックスアルゴリズム（アルファベータ枝刈り）
  function minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: boolean,
  ): { score: number; move: Position | null } {
    const player = maximizingPlayer ? "ai" : "player"
    const validMoves = findValidMoves(board, player)

    // 終了条件
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
        const newBoard = placePiece(board, move.row, move.col, "ai")
        const evalResult = minimax(newBoard, depth - 1, alpha, beta, false)
        if (evalResult.score > maxEval) {
          maxEval = evalResult.score
          bestMove = move
        }
        alpha = Math.max(alpha, evalResult.score)
        if (beta <= alpha) break // アルファベータ枝刈り
      }
      return { score: maxEval, move: bestMove }
    } else {
      let minEval = Number.POSITIVE_INFINITY
      for (const move of validMoves) {
        const newBoard = placePiece(board, move.row, move.col, "player")
        const evalResult = minimax(newBoard, depth - 1, alpha, beta, true)
        if (evalResult.score < minEval) {
          minEval = evalResult.score
          bestMove = move
        }
        beta = Math.min(beta, evalResult.score)
        if (beta <= alpha) break // アルファベータ枝刈り
      }
      return { score: minEval, move: bestMove }
    }
  }

  // ボードの評価関数
  function evaluateBoard(board: Board): number {
    const playerCount = countPieces(board, "player")
    const aiCount = countPieces(board, "ai")

    // 駒の数の差
    const pieceDifference = aiCount - playerCount

    // 角の評価（角は重要）
    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: 5 },
      { row: 5, col: 0 },
      { row: 5, col: 5 },
    ]

    let cornerScore = 0
    for (const corner of corners) {
      if (board[corner.row][corner.col] === "ai") {
        cornerScore += 10
      } else if (board[corner.row][corner.col] === "player") {
        cornerScore -= 10
      }
    }

    // 辺の評価（辺も重要だが角ほどではない）
    const edges = [
      ...Array(6)
        .fill(0)
        .map((_, i) => ({ row: 0, col: i })), // 上辺
      ...Array(6)
        .fill(0)
        .map((_, i) => ({ row: 5, col: i })), // 下辺
      ...Array(4)
        .fill(0)
        .map((_, i) => ({ row: i + 1, col: 0 })), // 左辺
      ...Array(4)
        .fill(0)
        .map((_, i) => ({ row: i + 1, col: 5 })), // 右辺
    ]

    let edgeScore = 0
    for (const edge of edges) {
      if (board[edge.row][edge.col] === "ai") {
        edgeScore += 2
      } else if (board[edge.row][edge.col] === "player") {
        edgeScore -= 2
      }
    }

    // 移動可能性（選択肢が多いほど良い）
    const aiMobility = findValidMoves(board, "ai").length
    const playerMobility = findValidMoves(board, "player").length
    const mobilityScore = aiMobility - playerMobility

    // 総合評価
    return pieceDifference * 3 + cornerScore + edgeScore + mobilityScore * 2
  }

  // AIの手を処理する関数
  useEffect(() => {
    if (gameState.currentTurn === "ai" && !gameState.gameOver) {
      const aiTimer = setTimeout(() => {
        // AIの手を計算（ミニマックスアルゴリズム）
        const depth = 4 // 探索の深さ（調整可能）
        const result = minimax(gameState.board, depth, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, true)

        if (result.move) {
          // 新しいボードを作成
          const newBoard = placePiece(gameState.board, result.move.row, result.move.col, "ai")

          // プレイヤーの有効な手を計算
          const playerValidMoves = findValidMoves(newBoard, "player")

          // ゲーム状態を更新
          setGameState((prevState) => ({
            board: newBoard,
            currentTurn: playerValidMoves.length > 0 ? "player" : "ai",
            playerScore: countPieces(newBoard, "player"),
            aiScore: countPieces(newBoard, "ai"),
            gameOver: playerValidMoves.length === 0 && findValidMoves(newBoard, "ai").length === 0,
            winner:
              playerValidMoves.length === 0 && findValidMoves(newBoard, "ai").length === 0
                ? determineWinner(newBoard)
                : null,
            validMoves: playerValidMoves,
          }))
        } else {
          // AIが打てる手がない場合
          const playerValidMoves = findValidMoves(gameState.board, "player")
          if (playerValidMoves.length === 0) {
            // プレイヤーも打てる手がない場合、ゲーム終了
            setGameState((prevState) => ({
              ...prevState,
              gameOver: true,
              winner: determineWinner(prevState.board),
            }))
          } else {
            // プレイヤーに手番を戻す
            setGameState((prevState) => ({
              ...prevState,
              currentTurn: "player",
              validMoves: playerValidMoves,
            }))
          }
        }
      }, 1000) // AIの思考時間

      return () => clearTimeout(aiTimer)
    }
  }, [gameState])

  // ゲーム終了時に勝者を決定する関数
  function determineWinner(board: Board): "player" | "ai" | "draw" {
    const playerCount = countPieces(board, "player")
    const aiCount = countPieces(board, "ai")

    if (playerCount > aiCount) return "player"
    if (aiCount > playerCount) return "ai"
    return "draw"
  }

  // ゲーム終了時の処理
  useEffect(() => {
    if (gameState.gameOver && !gameState.winner) {
      setGameState((prevState) => ({
        ...prevState,
        winner: determineWinner(prevState.board),
      }))
    }
  }, [gameState.gameOver, gameState.winner])

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
            挟んだ駒は自分の色にできます。最終的な数が多い方が勝ちです。
          </Typography>
        </Paper>

        {/* ヘッダー部分 */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#3f51b5", // プレイヤーの色（青）
                }}
              />
              <Typography variant="h6" sx={{ color: "#333" }}>
                {gameState.playerScore}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#f5f5f5", // AIの色（白）
                  border: "1px solid #ccc",
                }}
              />
              <Typography variant="h6" sx={{ color: "#333" }}>
                {gameState.aiScore}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ゲームボード - Gridを使わずにflexboxで実装 */}
        <Paper
          elevation={3}
          sx={{
            p: 2,
            backgroundColor: "#add8e6", // 薄い青色の背景
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {gameState.board.map((row, rowIndex) => (
              <Box
                key={`row-${rowIndex}`}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {row.map((cell, colIndex) => (
                  <Box
                    key={`cell-${rowIndex}-${colIndex}`}
                    onClick={() => handlePlayerMove(rowIndex, colIndex)}
                    sx={{
                      width: "16.666%", // 6x6のボードなので各セルは幅の1/6
                      paddingTop: "16.666%", // アスペクト比を1:1に保つ
                      position: "relative",
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #ccc",
                      cursor: gameState.validMoves.some((move) => move.row === rowIndex && move.col === colIndex)
                        ? "pointer"
                        : "default",
                      "&:hover": {
                        backgroundColor: gameState.validMoves.some(
                          (move) => move.row === rowIndex && move.col === colIndex,
                        )
                          ? "#e0e0e0"
                          : "#f5f5f5",
                      },
                      // 有効な手の場合、薄い色で表示
                      ...(gameState.currentTurn === "player" &&
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
                              backgroundColor: "rgba(63, 81, 181, 0.3)", // 薄い青色
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
                          backgroundColor: cell === "player" ? "#3f51b5" : "#f5f5f5", // プレイヤーは青、AIは白
                          border: cell === "ai" ? "1px solid #ccc" : "none",
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

        {/* ゲーム情報 */}
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
          {gameState.gameOver ? (
            <>
              <Typography variant="h5" gutterBottom sx={{ color: "#333" }}>
                ゲーム終了
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ color: "#333" }}>
                {gameState.winner === "player"
                  ? "あなたの勝ちです！"
                  : gameState.winner === "ai"
                    ? "AIの勝ちです"
                    : "引き分けです"}
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/"
                sx={{
                  mt: 2,
                  backgroundColor: "#3f51b5",
                  color: "#f0f0f0",
                  "&:hover": {
                    backgroundColor: "#303f9f",
                  },
                }}
              >
                タイトルに戻る
              </Button>
            </>
          ) : (
            <Typography variant="h6" sx={{ color: "#333" }}>
              {gameState.currentTurn === "player" ? "あなたの番です" : "AIの番です..."}
            </Typography>
          )}
        </Paper>

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
