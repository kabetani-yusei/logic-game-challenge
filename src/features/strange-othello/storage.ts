import { readPersistentValue } from "../../hooks/usePersistentState"
import { STRANGE_OTHELLO_STORAGE_KEY, STRANGE_OTHELLO_STORAGE_VERSION } from "./constants"
import { strangeOthelloSessionSchema } from "./schema"

export const strangeOthelloStorageOptions = {
  version: STRANGE_OTHELLO_STORAGE_VERSION,
  schema: strangeOthelloSessionSchema,
}

export function hasStrangeOthelloProgress() {
  const session = readPersistentValue(STRANGE_OTHELLO_STORAGE_KEY, strangeOthelloStorageOptions)
  return Boolean(session && session.history.length > 0 && !session.gameState.gameOver)
}
