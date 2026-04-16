import { DIRECTIONS, INITIAL_BOARD } from "./constants"
import type { Board, EvalTable, Position, StrangeOthelloGameState, StrangeOthelloSession } from "./types"

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

function isValidPosition(board: Board, row: number, col: number) {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length
}

function isSamePosition(left: Position, right: Position) {
  return left.row === right.row && left.col === right.col
}

function buildGameState(
  board: Board,
  currentTurn: "black" | "white",
  validMoves: Position[],
  gameOver = false,
  winner: "black" | "white" | "draw" | null = null,
): StrangeOthelloGameState {
  return {
    board,
    currentTurn,
    blackScore: countPieces(board, "black"),
    whiteScore: countPieces(board, "white"),
    gameOver,
    winner,
    validMoves,
  }
}

export function createInitialStrangeOthelloState(): StrangeOthelloGameState {
  const board = cloneBoard(INITIAL_BOARD)
  return buildGameState(board, "black", findValidMoves(board, "black"))
}

export function createInitialStrangeOthelloSession(): StrangeOthelloSession {
  return {
    gameState: createInitialStrangeOthelloState(),
    history: [],
    showEvaluation: false,
  }
}

export function countPieces(board: Board, color: "black" | "white") {
  let count = 0

  for (const row of board) {
    for (const cell of row) {
      if (cell === color) {
        count += 1
      }
    }
  }

  return count
}

export function encodeBoard(board: Board) {
  return board.flat().map((cell) => (cell === "empty" ? "." : cell === "black" ? "B" : "W")).join("")
}

export function findValidMoves(board: Board, color: "black" | "white"): Position[] {
  const opponent = color === "black" ? "white" : "black"
  const validMoves: Position[] = []

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col] !== "empty") {
        continue
      }

      for (const direction of DIRECTIONS) {
        let currentRow = row + direction.row
        let currentCol = col + direction.col
        let foundOpponent = false

        while (isValidPosition(board, currentRow, currentCol) && board[currentRow][currentCol] === opponent) {
          foundOpponent = true
          currentRow += direction.row
          currentCol += direction.col
        }

        if (foundOpponent && isValidPosition(board, currentRow, currentCol) && board[currentRow][currentCol] === color) {
          validMoves.push({ row, col })
          break
        }
      }
    }
  }

  return validMoves
}

export function getFlippedPieces(board: Board, row: number, col: number, color: "black" | "white") {
  const opponent = color === "black" ? "white" : "black"
  const flippedPieces: Position[] = []

  for (const direction of DIRECTIONS) {
    const piecesToFlip: Position[] = []
    let currentRow = row + direction.row
    let currentCol = col + direction.col

    while (isValidPosition(board, currentRow, currentCol) && board[currentRow][currentCol] === opponent) {
      piecesToFlip.push({ row: currentRow, col: currentCol })
      currentRow += direction.row
      currentCol += direction.col
    }

    if (
      piecesToFlip.length > 0 &&
      isValidPosition(board, currentRow, currentCol) &&
      board[currentRow][currentCol] === color
    ) {
      flippedPieces.push(...piecesToFlip)
    }
  }

  return flippedPieces
}

export function placePiece(board: Board, row: number, col: number, color: "black" | "white") {
  const nextBoard = cloneBoard(board)
  nextBoard[row][col] = color

  for (const piece of getFlippedPieces(board, row, col, color)) {
    nextBoard[piece.row][piece.col] = color
  }

  return nextBoard
}

export function determineWinner(board: Board): "black" | "white" | "draw" {
  const blackCount = countPieces(board, "black")
  const whiteCount = countPieces(board, "white")

  if (blackCount > whiteCount) {
    return "black"
  }

  if (whiteCount > blackCount) {
    return "white"
  }

  return "draw"
}

export function applyBlackMove(state: StrangeOthelloGameState, row: number, col: number): StrangeOthelloGameState | null {
  if (
    state.currentTurn !== "black" ||
    state.gameOver ||
    !state.validMoves.some((move) => move.row === row && move.col === col)
  ) {
    return null
  }

  const nextBoard = placePiece(state.board, row, col, "black")
  const whiteValidMoves = findValidMoves(nextBoard, "white")
  const blackValidMoves = whiteValidMoves.length > 0 ? [] : findValidMoves(nextBoard, "black")
  const gameOver = whiteValidMoves.length === 0 && blackValidMoves.length === 0
  const currentTurn = whiteValidMoves.length > 0 ? "white" : "black"
  const validMoves = currentTurn === "white" ? whiteValidMoves : blackValidMoves

  return buildGameState(nextBoard, currentTurn, validMoves, gameOver, gameOver ? determineWinner(nextBoard) : null)
}

export function applyWhiteMove(
  state: StrangeOthelloGameState,
  move: Position | null,
): StrangeOthelloGameState | null {
  if (state.currentTurn !== "white" || state.gameOver) {
    return null
  }

  if (!move) {
    const blackValidMoves = findValidMoves(state.board, "black")

    return buildGameState(
      state.board,
      blackValidMoves.length > 0 ? "black" : "white",
      blackValidMoves,
      blackValidMoves.length === 0,
      blackValidMoves.length === 0 ? determineWinner(state.board) : null,
    )
  }

  const nextBoard = placePiece(state.board, move.row, move.col, "white")
  const blackValidMoves = findValidMoves(nextBoard, "black")
  const whiteValidMoves = findValidMoves(nextBoard, "white")
  const gameOver = blackValidMoves.length === 0 && whiteValidMoves.length === 0
  const currentTurn = blackValidMoves.length > 0 ? "black" : "white"
  const validMoves = currentTurn === "black" ? blackValidMoves : whiteValidMoves

  return buildGameState(nextBoard, currentTurn, validMoves, gameOver, gameOver ? determineWinner(nextBoard) : null)
}

export function getCurrentEval(board: Board, evalTable: EvalTable | null) {
  if (!evalTable) {
    return null
  }

  const value = evalTable.evalTable[encodeBoard(board)]
  return value !== undefined ? value : null
}

export function getMoveEvals(gameState: StrangeOthelloGameState, evalTable: EvalTable | null) {
  const result = new Map<string, number>()

  if (!evalTable) {
    return result
  }

  for (const move of gameState.validMoves) {
    const nextBoard = placePiece(gameState.board, move.row, move.col, gameState.currentTurn)
    const value = evalTable.evalTable[encodeBoard(nextBoard)]

    if (value !== undefined) {
      result.set(`${move.row},${move.col}`, value)
    }
  }

  return result
}

export function evalToBarPercent(evalValue: number) {
  const maxEval = 36
  const clamped = Math.max(-maxEval, Math.min(maxEval, evalValue))
  return ((clamped + maxEval) / (2 * maxEval)) * 100
}

export function isPlayableMove(validMoves: Position[], row: number, col: number) {
  return validMoves.some((move) => isSamePosition(move, { row, col }))
}
