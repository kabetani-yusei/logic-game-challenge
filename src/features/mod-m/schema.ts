import { z } from "zod"
import { MAX_HISTORY_LENGTH } from "../../lib/history"
import { MOD_M_M, MOD_M_N } from "./constants"
import type { ModMGameState, ModMSession } from "./types"

const playerSchema = z.enum(["player", "ai"])
const cardSchema = z.number().int().min(1).max(MOD_M_N)
const handSchema = z.array(cardSchema).max(MOD_M_N)

export const modMGameStateSchema: z.ZodType<ModMGameState> = z
  .object({
    n: z.literal(MOD_M_N),
    m: z.literal(MOD_M_M),
    playerCards: handSchema,
    aiCards: handSchema,
    playedCards: z.array(cardSchema).max(MOD_M_N * 2),
    playedBy: z.array(playerSchema).max(MOD_M_N * 2),
    sum: z.number().int().min(0).max(MOD_M_N * (MOD_M_N + 1)),
    currentTurn: playerSchema,
    gameOver: z.boolean(),
    winner: playerSchema.nullable(),
    message: z.string().max(200),
    lastMove: z.string().max(200),
  })
  .refine((state) => state.playedCards.length === state.playedBy.length)
  .refine((state) => state.sum === state.playedCards.reduce((total, card) => total + card, 0))

export const modMSessionSchema: z.ZodType<ModMSession> = z.object({
  gameState: modMGameStateSchema,
  history: z.array(modMGameStateSchema).max(MAX_HISTORY_LENGTH),
})
