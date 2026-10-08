import { describe, expect, it } from "vitest"
import { applyBlackMove, applyWhiteMove, chooseWhiteMove, createInitialStrangeOthelloSession, createInitialStrangeOthelloState } from "./logic"
import { strangeOthelloSessionSchema } from "./schema"

describe("strange othello logic", () => {
  it("records the last move and flipped discs", () => {
    const initial = createInitialStrangeOthelloState()
    const move = initial.validMoves[0]
    const next = applyBlackMove(initial, move.row, move.col)

    expect(next).not.toBeNull()
    expect(next!.lastMove).toEqual({ ...move, color: "black" })
    expect(next!.flipped.length).toBeGreaterThan(0)
    expect(next!.blackScore).toBe(initial.blackScore + 1 + next!.flipped.length)
  })

  it("rejects illegal moves", () => {
    expect(applyBlackMove(createInitialStrangeOthelloState(), 0, 0)).toBeNull()
  })

  it("falls back to a legal move when the table suggests an illegal one", () => {
    const initial = createInitialStrangeOthelloState()
    const move = initial.validMoves[0]
    const whiteTurn = applyBlackMove(initial, move.row, move.col)!

    expect(whiteTurn.currentTurn).toBe("white")
    const chosen = chooseWhiteMove(whiteTurn, { row: 0, col: 0 })
    expect(whiteTurn.validMoves).toContainEqual(chosen)
    expect(applyWhiteMove(whiteTurn, { row: 0, col: 0 })?.lastMove?.color).toBe("white")
  })

  it("validates persisted sessions", () => {
    expect(strangeOthelloSessionSchema.safeParse(createInitialStrangeOthelloSession()).success).toBe(true)
    const tampered = createInitialStrangeOthelloSession()
    tampered.gameState.board[0][0] = "red" as never
    expect(strangeOthelloSessionSchema.safeParse(tampered).success).toBe(false)
  })
})
