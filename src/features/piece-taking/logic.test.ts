import { describe, expect, it } from "vitest"
import { createInitialPieceTakingSession, createInitialPieceTakingState } from "./constants"
import { applyAIMove, applyPlayerMove, setSelection } from "./logic"
import { pieceTakingSessionSchema } from "./schema"

describe("piece-taking logic", () => {
  it("removes the selected pieces and hands the turn to the AI", () => {
    const state = setSelection(createInitialPieceTakingState(), "yellow", 2)
    const next = applyPlayerMove(state)

    expect(next.yellowPieces).toBe(1)
    expect(next.currentTurn).toBe("ai")
  })

  it("rejects selections larger than the pile", () => {
    const state = createInitialPieceTakingState()
    expect(setSelection(state, "red", 3)).toBe(state)
    const oversized = { ...state, selectedColor: "red" as const, selectedCount: 5 }
    expect(applyPlayerMove(oversized)).toBe(oversized)
  })

  it("loses when the player takes the last piece", () => {
    const state = { ...createInitialPieceTakingState(), bluePieces: 1, yellowPieces: 0, redPieces: 0, selectedCount: 1 }
    expect(applyPlayerMove(state)).toMatchObject({ gameOver: true, winner: "ai" })
  })

  it("lets the AI leave a single piece when only one pile remains", () => {
    const state = { ...createInitialPieceTakingState(), bluePieces: 4, yellowPieces: 0, redPieces: 0, currentTurn: "ai" as const }
    const next = applyAIMove(state)

    expect(next.bluePieces).toBe(1)
    expect(next.lastAIMove).toEqual({ color: "blue", count: 3 })
  })

  it("validates persisted sessions", () => {
    expect(pieceTakingSessionSchema.safeParse(createInitialPieceTakingSession()).success).toBe(true)
    const tampered = { ...createInitialPieceTakingSession(), gameState: { ...createInitialPieceTakingState(), bluePieces: -3 } }
    expect(pieceTakingSessionSchema.safeParse(tampered).success).toBe(false)
  })
})
