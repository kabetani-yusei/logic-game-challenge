import { describe, expect, it } from "vitest"
import { canUndo, MAX_HISTORY_LENGTH, pushHistory, undoSession } from "./history"

interface State {
  id: number
  turn: "player" | "ai"
}

const isPlayerTurn = (state: State) => state.turn === "player"

describe("undoSession", () => {
  it("rewinds to the latest state where the player could move", () => {
    const history: State[] = [
      { id: 0, turn: "player" },
      { id: 1, turn: "ai" },
      { id: 2, turn: "player" },
      { id: 3, turn: "ai" },
    ]
    const session = { gameState: { id: 4, turn: "player" as const }, history }

    expect(undoSession(session, isPlayerTurn)).toEqual({ gameState: history[2], history: history.slice(0, 2) })
  })

  it("does nothing when there is no player turn to go back to", () => {
    const session = { gameState: { id: 1, turn: "player" as const }, history: [{ id: 0, turn: "ai" as const }] }

    expect(canUndo(session.history, isPlayerTurn)).toBe(false)
    expect(undoSession(session, isPlayerTurn)).toBe(session)
  })
})

describe("pushHistory", () => {
  it("caps the history length", () => {
    let history: number[] = []
    for (let index = 0; index < MAX_HISTORY_LENGTH + 10; index += 1) {
      history = pushHistory(history, index)
    }

    expect(history).toHaveLength(MAX_HISTORY_LENGTH)
    expect(history.at(-1)).toBe(MAX_HISTORY_LENGTH + 9)
  })
})
