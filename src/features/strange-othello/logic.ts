import { DIRECTIONS, INITIAL_BOARD } from "./constants"
import type { Board, EvalTable, OthelloColor, Position, StrangeOthelloGameState, StrangeOthelloSession } from "./types"

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

function isValidPosition(board: Board, row: number, col: number) {
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length
}

function isSamePosition(left: Position, right: Position) {
  return left.row === right.row && left.col === right.col
}

function getOpponentColor(color: OthelloColor): OthelloColor {
  return color === "black" ? "white" : "black"
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

export function encodeEvalState(board: Board, turn: OthelloColor) {
  return `${turn[0]}:${encodeBoard(board)}`
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

function resolveNextTurnState(board: Board, playerWhoFinishedTurn: OthelloColor) {
  const nextTurn = getOpponentColor(playerWhoFinishedTurn)
  const nextValidMoves = findValidMoves(board, nextTurn)

  if (nextValidMoves.length > 0) {
    return {
      currentTurn: nextTurn,
      validMoves: nextValidMoves,
      gameOver: false,
      winner: null,
    }
  }

  const retryValidMoves = findValidMoves(board, playerWhoFinishedTurn)
  const gameOver = retryValidMoves.length === 0

  return {
    currentTurn: playerWhoFinishedTurn,
    validMoves: retryValidMoves,
    gameOver,
    winner: gameOver ? determineWinner(board) : null,
  }
}

function getEvalValue(board: Board, turn: OthelloColor, evalTable: EvalTable | null) {
  if (!evalTable) {
    return null
  }

  const value = evalTable.evalTable[encodeEvalState(board, turn)]
  return value !== undefined ? value : null
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
  const nextTurnState = resolveNextTurnState(nextBoard, "black")

  return buildGameState(
    nextBoard,
    nextTurnState.currentTurn,
    nextTurnState.validMoves,
    nextTurnState.gameOver,
    nextTurnState.winner,
  )
}

export function applyWhiteMove(
  state: StrangeOthelloGameState,
  move: Position | null,
): StrangeOthelloGameState | null {
  if (state.currentTurn !== "white" || state.gameOver) {
    return null
  }

  if (!move) {
    const nextTurnState = resolveNextTurnState(state.board, "white")

    return buildGameState(
      state.board,
      nextTurnState.currentTurn,
      nextTurnState.validMoves,
      nextTurnState.gameOver,
      nextTurnState.winner,
    )
  }

  const nextBoard = placePiece(state.board, move.row, move.col, "white")
  const nextTurnState = resolveNextTurnState(nextBoard, "white")

  return buildGameState(
    nextBoard,
    nextTurnState.currentTurn,
    nextTurnState.validMoves,
    nextTurnState.gameOver,
    nextTurnState.winner,
  )
}

export function getCurrentEval(board: Board, currentTurn: OthelloColor, evalTable: EvalTable | null) {
  return getEvalValue(board, currentTurn, evalTable)
}

export function getMoveEvals(gameState: StrangeOthelloGameState, evalTable: EvalTable | null) {
  const result = new Map<string, number>()

  if (!evalTable) {
    return result
  }

  for (const move of gameState.validMoves) {
    const nextBoard = placePiece(gameState.board, move.row, move.col, gameState.currentTurn)
    const nextTurnState = resolveNextTurnState(nextBoard, gameState.currentTurn)
    const value = getEvalValue(nextBoard, nextTurnState.currentTurn, evalTable)

    if (value !== null) {
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
