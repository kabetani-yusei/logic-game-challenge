import { useEffect } from "react"
import { usePersistentState } from "../../hooks/usePersistentState"
import {
  createInitialPieceTakingSession,
  PIECE_TAKING_STORAGE_KEY,
  PIECE_TAKING_STORAGE_VERSION,
} from "./constants"
import {
  applyAIMove,
  applyPlayerMove,
  changeSelectedCount,
  cycleSelectedColor,
  getAvailableColors,
  getPieceCount,
  selectPile,
} from "./logic"
import type { PieceColor, PieceTakingSession } from "./types"

export function usePieceTakingGame() {
  const [session, setSession, resetSession] = usePersistentState<PieceTakingSession>(
    PIECE_TAKING_STORAGE_KEY,
    createInitialPieceTakingSession,
    { version: PIECE_TAKING_STORAGE_VERSION },
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

        return {
          gameState: applyAIMove(previousSession.gameState),
          history: [...previousSession.history, previousSession.gameState],
        }
      })
    }, 500)

    return () => window.clearTimeout(timerId)
  }, [gameState.currentTurn, gameState.gameOver, setSession])

  const availableColors = getAvailableColors(gameState)
  const maxSelectableCount = getPieceCount(gameState, gameState.selectedColor)

  const updateSelection = (updater: (state: typeof gameState) => typeof gameState) => {
    setSession((previousSession) => ({
      ...previousSession,
      gameState: updater(previousSession.gameState),
    }))
  }

  const commitTurn = (updater: (state: typeof gameState) => typeof gameState) => {
    setSession((previousSession) => {
      const nextGameState = updater(previousSession.gameState)

      if (nextGameState === previousSession.gameState) {
        return previousSession
      }

      return {
        gameState: nextGameState,
        history: [...previousSession.history, previousSession.gameState],
      }
    })
  }

  return {
    gameState,
    history,
    availableColors,
    maxSelectableCount,
    canUndo: history.length >= 2,
    handlePileSelect: (color: PieceColor) => updateSelection((state) => selectPile(state, color)),
    handleNextColor: () => updateSelection((state) => cycleSelectedColor(state, 1)),
    handlePrevColor: () => updateSelection((state) => cycleSelectedColor(state, -1)),
    handleIncreaseCount: () => updateSelection((state) => changeSelectedCount(state, 1)),
    handleDecreaseCount: () => updateSelection((state) => changeSelectedCount(state, -1)),
    handleConfirmMove: () => commitTurn(applyPlayerMove),
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
