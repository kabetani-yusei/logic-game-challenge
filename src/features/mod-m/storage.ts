import { readPersistentValue } from "../../hooks/usePersistentState"
import { MOD_M_N, MOD_M_STORAGE_KEY, MOD_M_STORAGE_VERSION } from "./constants"
import { modMSessionSchema } from "./schema"

export const modMStorageOptions = {
  version: MOD_M_STORAGE_VERSION,
  schema: modMSessionSchema,
}

export function hasModMProgress() {
  const session = readPersistentValue(MOD_M_STORAGE_KEY, modMStorageOptions)
  return Boolean(session && session.gameState.playerCards.length < MOD_M_N && !session.gameState.gameOver)
}
