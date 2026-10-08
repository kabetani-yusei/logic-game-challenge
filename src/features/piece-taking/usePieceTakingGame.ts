import { useEffect } from "react"
import { usePersistentState } from "../../hooks/usePersistentState"
import { canUndo, pushHistory, undoSession } from "../../lib/history"
import { createInitialPieceTakingSession, PIECE_TAKING_STORAGE_KEY } from "./constants"
import {
  applyAIMove,
  applyPlayerMove,
  changeSelectedCount,
  getAvailableColors,
  getPieceCount,
  selectPile,
  setSelection,
} from "./logic"
import { pieceTakingStorageOptions } from "./storage"
import type { PieceColor, PieceTakingGameState } from "./types"

export const AI_THINKING_DELAY_MS = 700

const isPlayerTurn = (state: PieceTakingGameState) => state.currentTurn === "player" && !state.gameOver

export function usePieceTakingGame() {
  const [session, setSession, resetSession] = usePersistentState(
    PIECE_TAKING_STORAGE_KEY,
    createInitialPieceTakingSession,
    pieceTakingStorageOptions,
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
          history: pushHistory(previousSession.history, previousSession.gameState),
        }
      })
    }, AI_THINKING_DELAY_MS)

    return () => window.clearTimeout(timerId)
  }, [gameState.currentTurn, gameState.gameOver, setSession])

  const updateSelection = (updater: (state: PieceTakingGameState) => PieceTakingGameState) => {
    setSession((previousSession) => {
      if (!isPlayerTurn(previousSession.gameState)) {
        return previousSession
      }

      return { ...previousSession, gameState: updater(previousSession.gameState) }
    })
  }

  return {
    gameState,
    availableColors: getAvailableColors(gameState),
    maxSelectableCount: getPieceCount(gameState, gameState.selectedColor),
    canUndo: canUndo(history, isPlayerTurn),
    inProgress: history.length > 0 && !gameState.gameOver,
    handlePileSelect: (color: PieceColor) => updateSelection((state) => selectPile(state, color)),
    handlePieceSelect: (color: PieceColor, count: number) => updateSelection((state) => setSelection(state, color, count)),
    handleIncreaseCount: () => updateSelection((state) => changeSelectedCount(state, 1)),
    handleDecreaseCount: () => updateSelection((state) => changeSelectedCount(state, -1)),
    handleConfirmMove: () => {
      setSession((previousSession) => {
        const nextGameState = applyPlayerMove(previousSession.gameState)

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
