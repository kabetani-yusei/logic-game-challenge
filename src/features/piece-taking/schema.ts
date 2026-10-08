import { z } from "zod"
import { MAX_HISTORY_LENGTH } from "../../lib/history"
import type { PieceTakingGameState, PieceTakingSession } from "./types"

const pieceColorSchema = z.enum(["blue", "yellow", "red"])
const pileCountSchema = z.number().int().min(0).max(9)

export const pieceTakingGameStateSchema: z.ZodType<PieceTakingGameState> = z.object({
  bluePieces: pileCountSchema,
  yellowPieces: pileCountSchema,
  redPieces: pileCountSchema,
  currentTurn: z.enum(["player", "ai"]),
  selectedColor: pieceColorSchema,
  selectedCount: z.number().int().min(0).max(9),
  gameOver: z.boolean(),
  winner: z.enum(["player", "ai"]).nullable(),
  lastAIMove: z.object({ color: pieceColorSchema, count: z.number().int().min(1).max(9) }).nullable(),
})

export const pieceTakingSessionSchema: z.ZodType<PieceTakingSession> = z.object({
  gameState: pieceTakingGameStateSchema,
  history: z.array(pieceTakingGameStateSchema).max(MAX_HISTORY_LENGTH),
})
