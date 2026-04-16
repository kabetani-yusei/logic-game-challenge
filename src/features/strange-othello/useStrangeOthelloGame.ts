import { useEffect, useRef } from "react"
import { usePersistentState } from "../../hooks/usePersistentState"
import { STRANGE_OTHELLO_STORAGE_KEY, STRANGE_OTHELLO_STORAGE_VERSION } from "./constants"
import {
  applyBlackMove,
  applyWhiteMove,
  createInitialStrangeOthelloSession,
  encodeBoard,
  getCurrentEval,
  getMoveEvals,
} from "./logic"
import { useStrangeOthelloTables } from "./useStrangeOthelloTables"
import type { Position, StrangeOthelloSession } from "./types"

export function useStrangeOthelloGame() {
  const [session, setSession, resetSession] = usePersistentState<StrangeOthelloSession>(
    STRANGE_OTHELLO_STORAGE_KEY,
    createInitialStrangeOthelloSession,
    { version: STRANGE_OTHELLO_STORAGE_VERSION },
  )
  const { solutionTable, evalTable } = useStrangeOthelloTables()
  const titleClickCount = useRef(0)
  const titleClickTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const { gameState, history, showEvaluation } = session

  useEffect(() => {
    return () => {
      if (titleClickTimer.current) {
        window.clearTimeout(titleClickTimer.current)
      }
    }
  }, [])

  useEffect(() => {
    if (gameState.currentTurn !== "white" || gameState.gameOver || !solutionTable) {
      return
    }

    const timerId = window.setTimeout(() => {
      setSession((previousSession) => {
        if (
          previousSession.gameState.currentTurn !== "white" ||
          previousSession.gameState.gameOver ||
          !solutionTable
        ) {
          return previousSession
        }

        const encodedBoard = encodeBoard(previousSession.gameState.board)
        const storedMove = solutionTable.whiteMoveTable[encodedBoard]
        const nextMove: Position | null = storedMove ? { row: storedMove[0], col: storedMove[1] } : null
        const nextGameState = applyWhiteMove(previousSession.gameState, nextMove)

        if (!nextGameState) {
          return previousSession
        }

        return {
          ...previousSession,
          gameState: nextGameState,
          history: [...previousSession.history, previousSession.gameState],
        }
      })
    }, 1000)

    return () => window.clearTimeout(timerId)
  }, [gameState.currentTurn, gameState.board, gameState.gameOver, setSession, solutionTable])

  return {
    gameState,
    showEvaluation,
    currentEval: showEvaluation ? getCurrentEval(gameState.board, gameState.currentTurn, evalTable) : null,
    moveEvals: showEvaluation && !gameState.gameOver ? getMoveEvals(gameState, evalTable) : new Map<string, number>(),
    canUndo: history.length >= 2,
    handleTitleClick: () => {
      titleClickCount.current += 1

      if (titleClickTimer.current) {
        window.clearTimeout(titleClickTimer.current)
      }

      if (titleClickCount.current >= 5) {
        titleClickCount.current = 0
        setSession((previousSession) => ({
          ...previousSession,
          showEvaluation: !previousSession.showEvaluation,
        }))
        return
      }

      titleClickTimer.current = window.setTimeout(() => {
        titleClickCount.current = 0
      }, 1000)
    },
    handleBlackMove: (row: number, col: number) => {
      setSession((previousSession) => {
        const nextGameState = applyBlackMove(previousSession.gameState, row, col)

        if (!nextGameState) {
          return previousSession
        }

        return {
          ...previousSession,
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
          ...previousSession,
          gameState: restoredState,
          history: nextHistory,
        }
      })
    },
    handleRestart: () => resetSession(),
  }
}
