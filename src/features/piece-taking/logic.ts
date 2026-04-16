import { PIECE_COLOR_ORDER } from "./constants"
import type { PieceColor, PieceTakingGameState } from "./types"

type PieceCountKey = "bluePieces" | "yellowPieces" | "redPieces"

const PIECE_COUNT_KEYS: Record<PieceColor, PieceCountKey> = {
  blue: "bluePieces",
  yellow: "yellowPieces",
  red: "redPieces",
}

function withPieceCount(state: PieceTakingGameState, color: PieceColor, count: number): PieceTakingGameState {
  return { ...state, [PIECE_COUNT_KEYS[color]]: count }
}

function getTotalPieceCount(state: PieceTakingGameState) {
  return state.bluePieces + state.yellowPieces + state.redPieces
}

function normalizeSelection(state: PieceTakingGameState): PieceTakingGameState {
  const availableColors = getAvailableColors(state)

  if (availableColors.length === 0) {
    return {
      ...state,
      selectedCount: 0,
    }
  }

  if (!availableColors.includes(state.selectedColor)) {
    return {
      ...state,
      selectedColor: availableColors[0],
      selectedCount: 1,
    }
  }

  return {
    ...state,
    selectedCount: Math.min(Math.max(state.selectedCount, 1), getPieceCount(state, state.selectedColor)),
  }
}

export function getPieceCount(state: PieceTakingGameState, color: PieceColor) {
  return state[PIECE_COUNT_KEYS[color]]
}

export function getAvailableColors(state: PieceTakingGameState): PieceColor[] {
  return PIECE_COLOR_ORDER.filter((color) => getPieceCount(state, color) > 0)
}

export function cycleSelectedColor(state: PieceTakingGameState, direction: -1 | 1): PieceTakingGameState {
  const availableColors = getAvailableColors(state)

  if (availableColors.length <= 1) {
    return state
  }

  let index = PIECE_COLOR_ORDER.indexOf(state.selectedColor)

  for (let step = 0; step < PIECE_COLOR_ORDER.length; step += 1) {
    index = (index + direction + PIECE_COLOR_ORDER.length) % PIECE_COLOR_ORDER.length
    const candidate = PIECE_COLOR_ORDER[index]

    if (getPieceCount(state, candidate) > 0) {
      return {
        ...state,
        selectedColor: candidate,
        selectedCount: 1,
      }
    }
  }

  return state
}

export function changeSelectedCount(state: PieceTakingGameState, delta: -1 | 1): PieceTakingGameState {
  const maxSelectableCount = getPieceCount(state, state.selectedColor)
  const nextCount = Math.min(Math.max(state.selectedCount + delta, 1), maxSelectableCount)

  if (nextCount === state.selectedCount) {
    return state
  }

  return {
    ...state,
    selectedCount: nextCount,
  }
}

export function selectPile(state: PieceTakingGameState, color: PieceColor): PieceTakingGameState {
  const pieceCount = getPieceCount(state, color)

  if (pieceCount === 0) {
    return state
  }

  if (state.selectedColor === color) {
    const nextCount = Math.min(state.selectedCount + 1, pieceCount)

    if (nextCount === state.selectedCount) {
      return state
    }

    return {
      ...state,
      selectedCount: nextCount,
    }
  }

  return {
    ...state,
    selectedColor: color,
    selectedCount: 1,
  }
}

export function applyPlayerMove(state: PieceTakingGameState): PieceTakingGameState {
  if (state.currentTurn !== "player" || state.gameOver) {
    return state
  }

  const currentCount = getPieceCount(state, state.selectedColor)
  const nextState = {
    ...withPieceCount(state, state.selectedColor, Math.max(currentCount - state.selectedCount, 0)),
    currentTurn: "ai" as const,
  }

  if (getTotalPieceCount(nextState) === 0) {
    return {
      ...nextState,
      gameOver: true,
      winner: "ai",
    }
  }

  return normalizeSelection({
    ...nextState,
    lastAIMove: null,
  })
}

interface AIMove {
  color: PieceColor
  count: number
}

function chooseAIMove(state: PieceTakingGameState, random: () => number): AIMove {
  const availableColors = getAvailableColors(state)
  const blue = state.bluePieces
  const yellow = state.yellowPieces
  const red = state.redPieces
  const nimSum = blue ^ yellow ^ red

  if (availableColors.length === 2) {
    for (const color of availableColors) {
      if (getPieceCount(state, color) !== 1) {
        continue
      }

      const otherColor = availableColors.find((candidate) => candidate !== color)

      if (otherColor) {
        return { color: otherColor, count: getPieceCount(state, otherColor) }
      }
    }
  } else if (availableColors.length === 1) {
    const onlyColor = availableColors[0]
    const pileSize = getPieceCount(state, onlyColor)

    if (pileSize > 1) {
      return { color: onlyColor, count: pileSize - 1 }
    }
  }

  if (availableColors.length === 3) {
    if (blue === 1 && yellow === 1 && red > 1) {
      return { color: "red", count: red - 1 }
    } else if (blue === 1 && red === 1 && yellow > 1) {
      return { color: "yellow", count: yellow - 1 }
    } else if (yellow === 1 && red === 1 && blue > 1) {
      return { color: "blue", count: blue - 1 }
    }
  }

  if (nimSum !== 0) {
    for (const color of PIECE_COLOR_ORDER) {
      const pileSize = getPieceCount(state, color)
      const target = pileSize ^ nimSum

      if (target < pileSize) {
        return { color, count: pileSize - target }
      }
    }
  }

  const randomColor = availableColors[Math.floor(random() * availableColors.length)]
  const pileSize = getPieceCount(state, randomColor)
  const maxRemoval = Math.min(2, pileSize)
  const removalCount = Math.floor(random() * maxRemoval) + 1

  return { color: randomColor, count: removalCount }
}

export function applyAIMove(state: PieceTakingGameState, random = Math.random): PieceTakingGameState {
  const move = chooseAIMove(state, random)
  const currentCount = getPieceCount(state, move.color)
  const nextState = {
    ...withPieceCount(state, move.color, currentCount - move.count),
    selectedColor: move.color,
    lastAIMove: { color: move.color, count: move.count },
  }

  if (getTotalPieceCount(nextState) === 0) {
    return {
      ...nextState,
      currentTurn: "player" as const,
      gameOver: true,
      winner: "player" as const,
    }
  }

  return normalizeSelection({
    ...nextState,
    currentTurn: "player",
  })
}
