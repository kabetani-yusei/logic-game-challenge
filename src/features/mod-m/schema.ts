import { MAX_HISTORY_LENGTH } from "../../lib/history"
import { arrayMax, intBetween, z, type Schema } from "../../lib/schema"
import { MOD_M_M, MOD_M_N } from "./constants"
import type { ModMGameState, ModMSession } from "./types"

const playerSchema = z.enum(["player", "ai"])
const cardSchema = intBetween(1, MOD_M_N)

export const modMGameStateSchema: Schema<ModMGameState> = z
  .object({
    n: z.literal(MOD_M_N),
    m: z.literal(MOD_M_M),
    playerCards: arrayMax(cardSchema, MOD_M_N),
    aiCards: arrayMax(cardSchema, MOD_M_N),
    playedCards: arrayMax(cardSchema, MOD_M_N * 2),
    playedBy: arrayMax(playerSchema, MOD_M_N * 2),
    sum: intBetween(0, MOD_M_N * (MOD_M_N + 1)),
    currentTurn: playerSchema,
    gameOver: z.boolean(),
    winner: z.nullable(playerSchema),
    message: z.string().check(z.maxLength(200)),
    lastMove: z.string().check(z.maxLength(200)),
  })
  .check(
    z.refine((state) => state.playedCards.length === state.playedBy.length),
    z.refine((state) => state.sum === state.playedCards.reduce((total, card) => total + card, 0)),
  )

export const modMSessionSchema: Schema<ModMSession> = z.object({
  gameState: modMGameStateSchema,
  history: arrayMax(modMGameStateSchema, MAX_HISTORY_LENGTH),
})
