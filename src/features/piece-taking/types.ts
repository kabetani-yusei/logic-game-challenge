export type PieceColor = "blue" | "yellow" | "red"
export type PieceTakingTurn = "player" | "ai"
export type PieceTakingWinner = "player" | "ai" | null

export interface AIMove {
  color: PieceColor
  count: number
}

export interface PieceTakingGameState {
  bluePieces: number
  yellowPieces: number
  redPieces: number
  currentTurn: PieceTakingTurn
  selectedColor: PieceColor
  selectedCount: number
  gameOver: boolean
  winner: PieceTakingWinner
  lastAIMove: AIMove | null
}

export interface PieceTakingSession {
  gameState: PieceTakingGameState
  history: PieceTakingGameState[]
}
