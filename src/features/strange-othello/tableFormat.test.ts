import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { applyBlackMove, applyWhiteMove, createInitialStrangeOthelloState, findValidMoves } from "./logic"
import {
  decodeBoardKey,
  decodeEvalTable,
  decodeSolutionTable,
  encodeBoardKey,
  encodeEvalKey,
  lookupTable,
  TableFormatError,
} from "./tableFormat"
import type { StrangeOthelloGameState } from "./types"

function readPublic(name: string) {
  const file = readFileSync(new URL(`../../../public/${name}`, import.meta.url))
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer
}

const solution = decodeSolutionTable(readPublic("strange-othello-solution.bin"))
const evaluation = decodeEvalTable(readPublic("strange-othello-eval.bin"))

describe("strange othello binary tables", () => {
  it("round-trips board keys", () => {
    const board = createInitialStrangeOthelloState().board
    const key = encodeBoardKey(board)!
    expect(decodeBoardKey(key)).toEqual(board)
  })

  it("contains the full solved game", () => {
    expect(solution.keys.length).toBe(89986)
    expect(evaluation.keys.length).toBe(210472)
    expect(solution.rootValue).toBe(2)
    expect(lookupTable(evaluation, encodeEvalKey(createInitialStrangeOthelloState().board, "black"))).toBe(2)
  })

  it("only stores legal white moves", () => {
    for (let index = 0; index < solution.keys.length; index += 1) {
      const board = decodeBoardKey(solution.keys[index])
      const move = solution.values[index]
      const legal = findValidMoves(board, "white").some((candidate) => candidate.row * 6 + candidate.col === move)
      if (!legal) throw new Error(`illegal move at entry ${index}`)
    }
  })

  it("lets the AI hold the solved value against every first move", () => {
    const initial = createInitialStrangeOthelloState()
    for (const move of initial.validMoves) {
      let state: StrangeOthelloGameState | null = applyBlackMove(initial, move.row, move.col)
      // 黒は常に最初の合法手、白はテーブルの手で終局まで進める
      while (state && !state.gameOver) {
        if (state.currentTurn === "black") {
          state = applyBlackMove(state, state.validMoves[0].row, state.validMoves[0].col)
        } else {
          const stored = lookupTable(solution, encodeBoardKey(state.board))
          expect(stored).toBeDefined()
          state = applyWhiteMove(state, { row: Math.floor(stored! / 6), col: stored! % 6 })
        }
      }
      expect(state!.blackScore - state!.whiteScore).toBeLessThanOrEqual(2)
    }
  })

  it("rejects corrupted data", () => {
    const valid = new Uint8Array(readPublic("strange-othello-solution.bin"))
    const corrupt = (mutate: (bytes: Uint8Array) => Uint8Array) => () =>
      decodeSolutionTable(mutate(valid.slice()).buffer as ArrayBuffer)

    expect(corrupt((bytes) => bytes.slice(0, 5))).toThrow(TableFormatError)
    expect(corrupt((bytes) => ((bytes[0] = 0x58), bytes))).toThrow(TableFormatError)
    expect(corrupt((bytes) => bytes.slice(0, bytes.length - 3))).toThrow(TableFormatError)
    expect(corrupt((bytes) => ((bytes[bytes.length - 1] = 99), bytes))).toThrow(TableFormatError)
    expect(() => decodeEvalTable(valid.buffer as ArrayBuffer)).toThrow(TableFormatError)
  })
})
