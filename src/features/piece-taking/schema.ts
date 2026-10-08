import { MAX_HISTORY_LENGTH } from "../../lib/history"
import { arrayMax, intBetween, z, type Schema } from "../../lib/schema"
import type { PieceTakingGameState, PieceTakingSession } from "./types"

const pieceColorSchema = z.enum(["blue", "yellow", "red"])

export const pieceTakingGameStateSchema: Schema<PieceTakingGameState> = z.object({
  bluePieces: intBetween(0, 9),
  yellowPieces: intBetween(0, 9),
  redPieces: intBetween(0, 9),
  currentTurn: z.enum(["player", "ai"]),
  selectedColor: pieceColorSchema,
  selectedCount: intBetween(0, 9),
  gameOver: z.boolean(),
  winner: z.nullable(z.enum(["player", "ai"])),
  lastAIMove: z.nullable(z.object({ color: pieceColorSchema, count: intBetween(1, 9) })),
})

export const pieceTakingSessionSchema: Schema<PieceTakingSession> = z.object({
  gameState: pieceTakingGameStateSchema,
  history: arrayMax(pieceTakingGameStateSchema, MAX_HISTORY_LENGTH),
})
