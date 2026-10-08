import { useEffect, useMemo, useRef } from "react"
import { usePersistentState } from "../../hooks/usePersistentState"
import { canUndo, pushHistory, undoSession } from "../../lib/history"
import { BOARD_SIZE, STRANGE_OTHELLO_STORAGE_KEY } from "./constants"
import {
  applyBlackMove,
  applyWhiteMove,
  createInitialStrangeOthelloSession,
  getCurrentEval,
  getMoveEvals,
} from "./logic"
import { strangeOthelloStorageOptions } from "./storage"
import { encodeBoardKey, lookupTable } from "./tableFormat"
import { useStrangeOthelloTables } from "./useStrangeOthelloTables"
import type { Position, StrangeOthelloGameState } from "./types"

export const AI_THINKING_DELAY_MS = 800
const SECRET_CLICK_COUNT = 5

const isPlayerTurn = (state: StrangeOthelloGameState) => state.currentTurn === "black" && !state.gameOver

export function useStrangeOthelloGame() {
  const [session, setSession] = usePersistentState(
    STRANGE_OTHELLO_STORAGE_KEY,
    createInitialStrangeOthelloSession,
    strangeOthelloStorageOptions,
  )
  const { gameState, history, showEvaluation } = session
  const { solution, evaluation } = useStrangeOthelloTables(showEvaluation)
  const solutionTable = solution.data
  const evalTable = evaluation.data
  const titleClickCount = useRef(0)
  const titleClickTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (titleClickTimer.current !== null) {
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
        const previousState = previousSession.gameState

        if (previousState.currentTurn !== "white" || previousState.gameOver) {
          return previousSession
        }

        const storedMove = lookupTable(solutionTable, encodeBoardKey(previousState.board))
        const tableMove: Position | null =
          storedMove === undefined
            ? null
            : { row: Math.floor(storedMove / BOARD_SIZE), col: storedMove % BOARD_SIZE }
        const nextGameState = applyWhiteMove(previousState, tableMove)

        if (!nextGameState) {
          return previousSession
        }

        return {
          ...previousSession,
          gameState: nextGameState,
          history: pushHistory(previousSession.history, previousState),
        }
      })
    }, AI_THINKING_DELAY_MS)

    return () => window.clearTimeout(timerId)
  }, [gameState.currentTurn, gameState.board, gameState.gameOver, setSession, solutionTable])

  const currentEval = useMemo(
    () => (showEvaluation ? getCurrentEval(gameState.board, gameState.currentTurn, evalTable) : null),
    [showEvaluation, gameState.board, gameState.currentTurn, evalTable],
  )
  const moveEvals = useMemo(
    () => (showEvaluation && !gameState.gameOver ? getMoveEvals(gameState, evalTable) : new Map<string, number>()),
    [showEvaluation, gameState, evalTable],
  )

  return {
    gameState,
    showEvaluation,
    currentEval,
    moveEvals,
    solutionStatus: solution.status,
    evaluationStatus: evaluation.status,
    retrySolution: solution.retry,
    canUndo: canUndo(history, isPlayerTurn),
    inProgress: history.length > 0 && !gameState.gameOver,
    handleTitleClick: () => {
      titleClickCount.current += 1

      if (titleClickTimer.current !== null) {
        window.clearTimeout(titleClickTimer.current)
      }

      if (titleClickCount.current >= SECRET_CLICK_COUNT) {
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
          history: pushHistory(previousSession.history, previousSession.gameState),
        }
      })
    },
    handleUndo: () => setSession((previousSession) => undoSession(previousSession, isPlayerTurn)),
    handleRestart: () => {
      setSession((previousSession) => ({
        ...createInitialStrangeOthelloSession(),
        showEvaluation: previousSession.showEvaluation,
      }))
    },
  }
}
