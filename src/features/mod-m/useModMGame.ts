import { useEffect } from "react"
import { usePersistentState } from "../../hooks/usePersistentState"
import { canUndo, pushHistory, undoSession } from "../../lib/history"
import { createInitialModMSession, MOD_M_STORAGE_KEY } from "./constants"
import { chooseAiCard, playCard } from "./logic"
import { modMStorageOptions } from "./storage"
import type { ModMGameState } from "./types"

export const AI_THINKING_DELAY_MS = 900

const isPlayerTurn = (state: ModMGameState) => state.currentTurn === "player" && !state.gameOver

export function useModMGame() {
  const [session, setSession, resetSession] = usePersistentState(
    MOD_M_STORAGE_KEY,
    createInitialModMSession,
    modMStorageOptions,
  )
  const { gameState, history } = session

  useEffect(() => {
    if (gameState.currentTurn !== "ai" || gameState.gameOver) {
      return
    }

    const timerId = window.setTimeout(() => {
      setSession((previousSession) => {
        if (previousSession.gameState.currentTurn !== "ai" || previousSession.gameState.gameOver) {
          return previousSession
        }

        const chosenCard = chooseAiCard(previousSession.gameState)

        if (chosenCard === undefined) {
          return previousSession
        }

        return {
          gameState: playCard(previousSession.gameState, chosenCard, "ai"),
          history: pushHistory(previousSession.history, previousSession.gameState),
        }
      })
    }, AI_THINKING_DELAY_MS)

    return () => window.clearTimeout(timerId)
  }, [gameState.currentTurn, gameState.gameOver, setSession])

  return {
    gameState,
    canUndo: canUndo(history, isPlayerTurn),
    inProgress: gameState.playedBy.includes("player") && !gameState.gameOver,
    handleCardSelect: (card: number) => {
      setSession((previousSession) => {
        const nextGameState = playCard(previousSession.gameState, card, "player")

        if (nextGameState === previousSession.gameState) {
          return previousSession
        }

        return {
          gameState: nextGameState,
          history: pushHistory(previousSession.history, previousSession.gameState),
        }
      })
    },
    handleUndo: () => setSession((previousSession) => undoSession(previousSession, isPlayerTurn)),
    handleRestart: resetSession,
  }
}
