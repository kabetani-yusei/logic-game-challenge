import type { PieceColor, PieceTakingGameState, PieceTakingSession } from "./types"

export const PIECE_TAKING_STORAGE_KEY = "logic-game-challenge/piece-taking"
export const PIECE_TAKING_STORAGE_VERSION = 1

export const PIECE_COLOR_ORDER: PieceColor[] = ["blue", "yellow", "red"]

export const COLOR_NAMES: Record<PieceColor, string> = {
  blue: "青色",
  yellow: "黄色",
  red: "赤色",
}

export const PIECE_COLORS: Record<PieceColor, { main: string; light: string; shadow: string; contrastText: string }> = {
  blue: { main: "#3d6fd6", light: "#8fb3ff", shadow: "#1f3f8a", contrastText: "#ffffff" },
  yellow: { main: "#e2a300", light: "#ffe07a", shadow: "#9a6a00", contrastText: "#2a1d00" },
  red: { main: "#d9443a", light: "#ff9a8f", shadow: "#8a1f17", contrastText: "#ffffff" },
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
