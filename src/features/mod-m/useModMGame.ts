import { useEffect } from "react"
import { usePersistentState } from "../../hooks/usePersistentState"
import { createInitialModMSession, MOD_M_STORAGE_KEY, MOD_M_STORAGE_VERSION } from "./constants"
import { chooseAiCard, playCard } from "./logic"
import type { ModMSession } from "./types"

export function useModMGame() {
  const [session, setSession, resetSession] = usePersistentState<ModMSession>(
    MOD_M_STORAGE_KEY,
    createInitialModMSession,
    { version: MOD_M_STORAGE_VERSION },
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
          history: [...previousSession.history, previousSession.gameState],
        }
      })
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [gameState.currentTurn, gameState.gameOver, setSession])

  return {
    gameState,
    canUndo: history.length >= 2,
    handleCardSelect: (card: number) => {
      setSession((previousSession) => {
        const nextGameState = playCard(previousSession.gameState, card, "player")

        if (nextGameState === previousSession.gameState) {
          return previousSession
        }

        return {
          gameState: nextGameState,
          history: [...previousSession.history, previousSession.gameState],
        }
      })
    },
    handleUndo: () => {
      setSession((previousSession) => {
        if (previousSession.history.length < 2) {
          return previousSession
        }

        const nextHistory = [...previousSession.history]
        nextHistory.pop()
        const restoredState = nextHistory.pop()

        if (!restoredState) {
          return previousSession
        }

        return {
          gameState: restoredState,
          history: nextHistory,
        }
      })
    },
    handleRestart: () => resetSession(),
  }
}
