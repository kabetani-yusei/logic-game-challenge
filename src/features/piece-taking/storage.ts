import { readPersistentValue } from "../../hooks/usePersistentState"
import { PIECE_TAKING_STORAGE_KEY, PIECE_TAKING_STORAGE_VERSION } from "./constants"
import { pieceTakingSessionSchema } from "./schema"

export const pieceTakingStorageOptions = {
  version: PIECE_TAKING_STORAGE_VERSION,
  schema: pieceTakingSessionSchema,
}

export function hasPieceTakingProgress() {
  const session = readPersistentValue(PIECE_TAKING_STORAGE_KEY, pieceTakingStorageOptions)
  return Boolean(session && session.history.length > 0 && !session.gameState.gameOver)
}
