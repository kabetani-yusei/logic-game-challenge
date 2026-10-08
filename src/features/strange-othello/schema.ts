import { MAX_HISTORY_LENGTH } from "../../lib/history"
import { arrayMax, intBetween, z, type Schema } from "../../lib/schema"
import { BOARD_SIZE } from "./constants"
import type { StrangeOthelloGameState, StrangeOthelloSession } from "./types"

const CELL_COUNT = BOARD_SIZE * BOARD_SIZE
const colorSchema = z.enum(["black", "white"])
const coordinateSchema = intBetween(0, BOARD_SIZE - 1)
const positionSchema = z.object({ row: coordinateSchema, col: coordinateSchema })
const cellSchema = z.enum(["empty", "black", "white"])
const boardRowSchema = z.array(cellSchema).check(z.length(BOARD_SIZE))

export const strangeOthelloGameStateSchema: Schema<StrangeOthelloGameState> = z.object({
  board: z.array(boardRowSchema).check(z.length(BOARD_SIZE)),
  currentTurn: colorSchema,
  blackScore: intBetween(0, CELL_COUNT),
  whiteScore: intBetween(0, CELL_COUNT),
  gameOver: z.boolean(),
  winner: z.nullable(z.enum(["black", "white", "draw"])),
  validMoves: arrayMax(positionSchema, CELL_COUNT),
  lastMove: z.nullable(z.extend(positionSchema, { color: colorSchema })),
  flipped: arrayMax(positionSchema, CELL_COUNT),
  passed: z.nullable(colorSchema),
})

export const strangeOthelloSessionSchema: Schema<StrangeOthelloSession> = z.object({
  gameState: strangeOthelloGameStateSchema,
  history: arrayMax(strangeOthelloGameStateSchema, MAX_HISTORY_LENGTH),
  showEvaluation: z.boolean(),
})
