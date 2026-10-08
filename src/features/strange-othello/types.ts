export type OthelloColor = "black" | "white"
export type CellState = "empty" | "black" | "white"
export type Board = CellState[][]

export interface Position {
  row: number
  col: number
}

export interface OthelloSolutionTable {
  initialTurn: OthelloColor
  rootValue: number
  whiteMoveTable: Record<string, [number, number]>
  visitedStateCount: number
  whiteStateCount: number
}

export interface EvalTable {
  rootValue: number
  evalTable: Record<string, number>
  stateCount: number
}

export interface StrangeOthelloGameState {
  board: Board
  currentTurn: OthelloColor
  blackScore: number
  whiteScore: number
  gameOver: boolean
  winner: OthelloColor | "draw" | null
  validMoves: Position[]
  lastMove: (Position & { color: OthelloColor }) | null
  flipped: Position[]
  /** 直前の手番でパスした側（パスが発生していなければ null） */
  passed: OthelloColor | null
}

export interface StrangeOthelloSession {
  gameState: StrangeOthelloGameState
  history: StrangeOthelloGameState[]
  showEvaluation: boolean
}
