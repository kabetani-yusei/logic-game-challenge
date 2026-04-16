export type ModMPlayer = "player" | "ai"
export type ModMWinner = ModMPlayer | null

export interface ModMGameState {
  n: number
  m: number
  playerCards: number[]
  aiCards: number[]
  playedCards: number[]
  playedBy: ModMPlayer[]
  sum: number
  currentTurn: ModMPlayer
  gameOver: boolean
  winner: ModMWinner
  message: string
  lastMove: string
}

export interface ModMSession {
  gameState: ModMGameState
  history: ModMGameState[]
}
