import type { Board, Position } from "./types.ts"

export const STRANGE_OTHELLO_STORAGE_KEY = "logic-game-challenge/strange-othello"
export const STRANGE_OTHELLO_STORAGE_VERSION = 2
export const STRANGE_OTHELLO_TABLES_VERSION = 3

export const BOARD_SIZE = 6

export const DIRECTIONS: Position[] = [
  { row: -1, col: 0 },
  { row: -1, col: 1 },
  { row: 0, col: 1 },
  { row: 1, col: 1 },
  { row: 1, col: 0 },
  { row: 1, col: -1 },
  { row: 0, col: -1 },
  { row: -1, col: -1 },
]

export const INITIAL_BOARD: Board = [
  ["white", "black", "black", "black", "black", "white"],
  ["black", "empty", "empty", "empty", "empty", "white"],
  ["black", "empty", "white", "black", "empty", "white"],
  ["black", "empty", "black", "white", "empty", "white"],
  ["black", "empty", "empty", "empty", "empty", "white"],
  ["white", "white", "white", "white", "white", "white"],
]
