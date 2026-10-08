import { z } from "zod"
import { MAX_HISTORY_LENGTH } from "../../lib/history"
import { BOARD_SIZE } from "./constants"
import type { EvalTable, OthelloSolutionTable, StrangeOthelloGameState, StrangeOthelloSession } from "./types"

const colorSchema = z.enum(["black", "white"])
const coordinateSchema = z.number().int().min(0).max(BOARD_SIZE - 1)
const positionSchema = z.object({ row: coordinateSchema, col: coordinateSchema })
const cellSchema = z.enum(["empty", "black", "white"])
const pieceCountSchema = z.number().int().min(0).max(BOARD_SIZE * BOARD_SIZE)
const encodedBoardSchema = z.string().regex(new RegExp(`^[.BW]{${BOARD_SIZE * BOARD_SIZE}}$`))

export const strangeOthelloGameStateSchema: z.ZodType<StrangeOthelloGameState> = z.object({
  board: z.array(z.array(cellSchema).length(BOARD_SIZE)).length(BOARD_SIZE),
  currentTurn: colorSchema,
  blackScore: pieceCountSchema,
  whiteScore: pieceCountSchema,
  gameOver: z.boolean(),
  winner: z.enum(["black", "white", "draw"]).nullable(),
  validMoves: z.array(positionSchema).max(BOARD_SIZE * BOARD_SIZE),
  lastMove: positionSchema.extend({ color: colorSchema }).nullable(),
  flipped: z.array(positionSchema).max(BOARD_SIZE * BOARD_SIZE),
  passed: colorSchema.nullable(),
})

export const strangeOthelloSessionSchema: z.ZodType<StrangeOthelloSession> = z.object({
  gameState: strangeOthelloGameStateSchema,
  history: z.array(strangeOthelloGameStateSchema).max(MAX_HISTORY_LENGTH),
  showEvaluation: z.boolean(),
})

// 静的ファイルとして配信する解析テーブルも、取得後に形式を検証してから使う
export const solutionTableSchema: z.ZodType<OthelloSolutionTable> = z.object({
  initialTurn: colorSchema,
  rootValue: z.number().int(),
  whiteMoveTable: z.record(encodedBoardSchema, z.tuple([coordinateSchema, coordinateSchema])),
  visitedStateCount: z.number().int().nonnegative(),
  whiteStateCount: z.number().int().nonnegative(),
})

export const evalTableSchema: z.ZodType<EvalTable> = z.object({
  rootValue: z.number().int(),
  evalTable: z.record(
    z.string().regex(new RegExp(`^[bw]:[.BW]{${BOARD_SIZE * BOARD_SIZE}}$`)),
    z.number().int().min(-BOARD_SIZE * BOARD_SIZE).max(BOARD_SIZE * BOARD_SIZE),
  ),
  stateCount: z.number().int().nonnegative(),
})
