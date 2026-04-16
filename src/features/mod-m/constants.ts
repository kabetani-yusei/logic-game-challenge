import type { ModMGameState, ModMSession } from "./types"

export const MOD_M_STORAGE_KEY = "logic-game-challenge/mod-m"
export const MOD_M_STORAGE_VERSION = 1
export const MOD_M_N = 5
export const MOD_M_M = 9

export function createInitialModMGameState(): ModMGameState {
  const playerCards = Array.from({ length: MOD_M_N }, (_, index) => index + 1)
  const aiCards = Array.from({ length: MOD_M_N }, (_, index) => index + 1)

  return {
    n: MOD_M_N,
    m: MOD_M_M,
    playerCards,
    aiCards,
    playedCards: [],
    playedBy: [],
    sum: 0,
    currentTurn: "ai",
    gameOver: false,
    winner: null,
    message: "AIのターンです...",
    lastMove: "",
  }
}

export function createInitialModMSession(): ModMSession {
  return {
    gameState: createInitialModMGameState(),
    history: [],
  }
}
