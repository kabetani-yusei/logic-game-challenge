import { DIRECTIONS, INITIAL_BOARD } from "./constants"
import { encodeEvalKey, lookupTable, type DecodedTable } from "./tableFormat"
import type { Board, OthelloColor, Position, StrangeOthelloGameState, StrangeOthelloSession } from "./types"

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

interface TurnState {
  currentTurn: OthelloColor
  validMoves: Position[]
  gameOver: boolean
  winner: OthelloColor | "draw" | null
  passed: OthelloColor | null
}

function buildGameState(
  board: Board,
  turnState: TurnState,
  lastMove: StrangeOthelloGameState["lastMove"] = null,
  flipped: Position[] = [],
): StrangeOthelloGameState {
  return {
    board,
    currentTurn: turnState.currentTurn,
    blackScore: countPieces(board, "black"),
    whiteScore: countPieces(board, "white"),
    gameOver: turnState.gameOver,
    winner: turnState.winner,
    validMoves: turnState.validMoves,
    lastMove,
    flipped,
    passed: turnState.passed,
  }
}

export function createInitialStrangeOthelloState(): StrangeOthelloGameState {
  const board = cloneBoard(INITIAL_BOARD)
  return buildGameState(board, {
    currentTurn: "black",
    validMoves: findValidMoves(board, "black"),
    gameOver: false,
    winner: null,
    passed: null,
  })
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

function resolveNextTurnState(board: Board, playerWhoFinishedTurn: OthelloColor): TurnState {
  const nextTurn = getOpponentColor(playerWhoFinishedTurn)
  const nextValidMoves = findValidMoves(board, nextTurn)

  if (nextValidMoves.length > 0) {
    return {
      currentTurn: nextTurn,
      validMoves: nextValidMoves,
      gameOver: false,
      winner: null,
      passed: null,
    }
  }

  const retryValidMoves = findValidMoves(board, playerWhoFinishedTurn)
  const gameOver = retryValidMoves.length === 0

  return {
    currentTurn: playerWhoFinishedTurn,
    validMoves: retryValidMoves,
    gameOver,
    winner: gameOver ? determineWinner(board) : null,
    passed: gameOver ? null : nextTurn,
  }
}

function applyMove(state: StrangeOthelloGameState, move: Position, color: OthelloColor) {
  const flipped = getFlippedPieces(state.board, move.row, move.col, color)
  const nextBoard = placePiece(state.board, move.row, move.col, color)
  return buildGameState(nextBoard, resolveNextTurnState(nextBoard, color), { ...move, color }, flipped)
}

function getEvalValue(board: Board, turn: OthelloColor, evalTable: DecodedTable | null) {
  if (!evalTable) {
    return null
  }

  return lookupTable(evalTable, encodeEvalKey(board, turn)) ?? null
}

export function applyBlackMove(state: StrangeOthelloGameState, row: number, col: number): StrangeOthelloGameState | null {
  if (state.currentTurn !== "black" || state.gameOver || !isPlayableMove(state.validMoves, row, col)) {
    return null
  }

  return applyMove(state, { row, col }, "black")
}

/**
 * 解析テーブルが示す白（AI）の手を検証し、合法手でなければ最も多く返せる手にフォールバックする。
 * テーブルが改ざん・破損していても不正な盤面にはならない。
 */
export function chooseWhiteMove(state: StrangeOthelloGameState, tableMove: Position | null): Position | null {
  if (state.validMoves.length === 0) {
    return null
  }

  if (tableMove && isPlayableMove(state.validMoves, tableMove.row, tableMove.col)) {
    return tableMove
  }

  let bestMove = state.validMoves[0]
  let bestFlips = -1

  for (const move of state.validMoves) {
    const flips = getFlippedPieces(state.board, move.row, move.col, "white").length

    if (flips > bestFlips) {
      bestMove = move
      bestFlips = flips
    }
  }

  return bestMove
}

export function applyWhiteMove(state: StrangeOthelloGameState, tableMove: Position | null): StrangeOthelloGameState | null {
  if (state.currentTurn !== "white" || state.gameOver) {
    return null
  }

  const move = chooseWhiteMove(state, tableMove)

  if (!move) {
    return buildGameState(state.board, resolveNextTurnState(state.board, "white"))
  }

  return applyMove(state, move, "white")
}

export function getCurrentEval(board: Board, currentTurn: OthelloColor, evalTable: DecodedTable | null) {
  return getEvalValue(board, currentTurn, evalTable)
}

export function getMoveEvals(gameState: StrangeOthelloGameState, evalTable: DecodedTable | null) {
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
