import { describe, expect, it } from "vitest"
import { createInitialModMGameState, createInitialModMSession } from "./constants"
import { chooseAiCard, playCard } from "./logic"
import { modMSessionSchema } from "./schema"

describe("mod M logic", () => {
  it("makes the player lose when the sum becomes a multiple of M", () => {
    const state = { ...createInitialModMGameState(), currentTurn: "player" as const, sum: 5, playedCards: [5], playedBy: ["ai" as const], aiCards: [1, 2, 3, 4] }
    const next = playCard(state, 4, "player")

    expect(next).toMatchObject({ gameOver: true, winner: "ai", sum: 9 })
  })

  it("ignores cards that are not in the hand or out of turn", () => {
    const state = createInitialModMGameState()
    expect(playCard(state, 1, "player")).toBe(state)
    expect(playCard(state, 6, "ai")).toBe(state)
  })

  it("never lets the AI choose an immediately losing card when a safe one exists", () => {
    const state = { ...createInitialModMGameState(), sum: 8, aiCards: [1, 2] }
    expect(chooseAiCard(state, () => 0)).toBe(2)
  })

  it("rejects sessions whose sum does not match the played cards", () => {
    expect(modMSessionSchema.safeParse(createInitialModMSession()).success).toBe(true)
    const tampered = createInitialModMSession()
    tampered.gameState = { ...tampered.gameState, playedCards: [3], playedBy: ["ai"], sum: 9 }
    expect(modMSessionSchema.safeParse(tampered).success).toBe(false)
  })
})
