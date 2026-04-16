import type { PieceColor, PieceTakingGameState, PieceTakingSession } from "./types"

export const PIECE_TAKING_STORAGE_KEY = "logic-game-challenge/piece-taking"
export const PIECE_TAKING_STORAGE_VERSION = 1

export const PIECE_COLOR_ORDER: PieceColor[] = ["blue", "yellow", "red"]

export const COLOR_NAMES: Record<PieceColor, string> = {
  blue: "青色",
  yellow: "黄色",
  red: "赤色",
}

export const PIECE_COLORS: Record<PieceColor, { main: string; light: string; shadow: string }> = {
  blue: { main: "#3b5998", light: "#5b7dc0", shadow: "#2c4373" },
  yellow: { main: "#d4a017", light: "#e6b830", shadow: "#b8860b" },
  red: { main: "#c0392b", light: "#e05544", shadow: "#8b1a10" },
}

export function createInitialPieceTakingState(): PieceTakingGameState {
  return {
    bluePieces: 4,
    yellowPieces: 3,
    redPieces: 2,
    currentTurn: "player",
    selectedColor: "blue",
    selectedCount: 1,
    gameOver: false,
    winner: null,
    lastAIMove: null,
  }
}

export function createInitialPieceTakingSession(): PieceTakingSession {
  return {
    gameState: createInitialPieceTakingState(),
    history: [],
  }
}
