import { BOARD_SIZE, INITIAL_BOARD } from "./constants"
import type { Board, CellState, OthelloColor } from "./types"

// scripts/generate_eval_table.py が出力するバイナリ形式の解析テーブルを読み込む。
// 形式の詳細は生成スクリプトの先頭コメントを参照。
// 静的ファイルとはいえ外部から取得するデータなので、構造を厳密に検証してから使う。

export const SOLUTION_MAGIC = "SOTS"
export const EVAL_MAGIC = "SOTE"
const FORMAT_VERSION = 1
const HEADER_BYTES = 10
const MAX_ENTRIES = 1_000_000
const MAX_VARINT_BYTES = 8

const TERNARY_VALUES: Record<CellState, number> = { empty: 0, black: 1, white: 2 }
const TERNARY_CELLS: CellState[] = ["empty", "black", "white"]
const FIXED_CELL_COUNT = INITIAL_BOARD.flat().filter((cell) => cell !== "empty").length
const FREE_CELL_COUNT = BOARD_SIZE * BOARD_SIZE - FIXED_CELL_COUNT
export const MAX_BOARD_KEY = 2 ** FIXED_CELL_COUNT * 3 ** FREE_CELL_COUNT

export interface DecodedTable {
  rootValue: number
  keys: Float64Array
  values: Int8Array
}

export class TableFormatError extends Error {
  override name = "TableFormatError"
}

/** 盤面を整数キーに変換する。初期配置で石があるマスが空になっている盤面（到達不能）は null。 */
export function encodeBoardKey(board: Board): number | null {
  let key = 0

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const cell = board[row]?.[col]

      if (cell === undefined) {
        return null
      }

      if (INITIAL_BOARD[row][col] !== "empty") {
        if (cell === "empty") {
          return null
        }
        key = key * 2 + (cell === "black" ? 1 : 0)
      } else {
        key = key * 3 + TERNARY_VALUES[cell]
      }
    }
  }

  return key
}

export function encodeEvalKey(board: Board, turn: OthelloColor): number | null {
  const boardKey = encodeBoardKey(board)
  return boardKey === null ? null : boardKey * 2 + (turn === "white" ? 1 : 0)
}

/** encodeBoardKey の逆変換（テストと検証用） */
export function decodeBoardKey(key: number): Board {
  const board: Board = INITIAL_BOARD.map((row) => row.map(() => "empty" as CellState))
  let rest = key

  for (let index = BOARD_SIZE * BOARD_SIZE - 1; index >= 0; index -= 1) {
    const row = Math.floor(index / BOARD_SIZE)
    const col = index % BOARD_SIZE

    if (INITIAL_BOARD[row][col] !== "empty") {
      board[row][col] = rest % 2 === 1 ? "black" : "white"
      rest = Math.floor(rest / 2)
    } else {
      board[row][col] = TERNARY_CELLS[rest % 3]
      rest = Math.floor(rest / 3)
    }
  }

  return board
}

export function decodeTable(
  buffer: ArrayBuffer,
  magic: string,
  { maxKey, isValidValue }: { maxKey: number; isValidValue: (value: number) => boolean },
): DecodedTable {
  const bytes = new Uint8Array(buffer)
  const view = new DataView(buffer)

  if (bytes.length < HEADER_BYTES) {
    throw new TableFormatError("table is too short")
  }

  for (let index = 0; index < magic.length; index += 1) {
    if (bytes[index] !== magic.charCodeAt(index)) {
      throw new TableFormatError("unexpected table type")
    }
  }

  if (bytes[4] !== FORMAT_VERSION) {
    throw new TableFormatError("unsupported table version")
  }

  const rootValue = view.getInt8(5)
  const count = view.getUint32(6, true)

  if (count > MAX_ENTRIES || count * 2 > bytes.length - HEADER_BYTES) {
    throw new TableFormatError("invalid entry count")
  }

  const keys = new Float64Array(count)
  const values = new Int8Array(count)
  let offset = HEADER_BYTES
  let previousKey = 0

  for (let entry = 0; entry < count; entry += 1) {
    let delta = 0
    let multiplier = 1
    let byteCount = 0

    while (true) {
      if (offset >= bytes.length || byteCount >= MAX_VARINT_BYTES) {
        throw new TableFormatError("truncated or invalid key")
      }

      const byte = bytes[offset]
      offset += 1
      byteCount += 1
      delta += (byte & 0x7f) * multiplier
      multiplier *= 128

      if ((byte & 0x80) === 0) {
        break
      }
    }

    const key = previousKey + delta

    if ((entry > 0 && delta === 0) || key >= maxKey) {
      throw new TableFormatError("keys are not strictly increasing or out of range")
    }

    if (offset >= bytes.length) {
      throw new TableFormatError("truncated value")
    }

    const value = view.getInt8(offset)
    offset += 1

    if (!isValidValue(value)) {
      throw new TableFormatError("value out of range")
    }

    keys[entry] = key
    values[entry] = value
    previousKey = key
  }

  if (offset !== bytes.length) {
    throw new TableFormatError("unexpected trailing data")
  }

  return { rootValue, keys, values }
}

export function lookupTable(table: DecodedTable, key: number | null): number | undefined {
  if (key === null) {
    return undefined
  }

  let low = 0
  let high = table.keys.length - 1

  while (low <= high) {
    const middle = (low + high) >>> 1
    const candidate = table.keys[middle]

    if (candidate === key) {
      return table.values[middle]
    }

    if (candidate < key) {
      low = middle + 1
    } else {
      high = middle - 1
    }
  }

  return undefined
}

export function decodeSolutionTable(buffer: ArrayBuffer) {
  return decodeTable(buffer, SOLUTION_MAGIC, {
    maxKey: MAX_BOARD_KEY,
    isValidValue: (value) => value >= 0 && value < BOARD_SIZE * BOARD_SIZE,
  })
}

export function decodeEvalTable(buffer: ArrayBuffer) {
  const maxScore = BOARD_SIZE * BOARD_SIZE
  return decodeTable(buffer, EVAL_MAGIC, {
    maxKey: MAX_BOARD_KEY * 2,
    isValidValue: (value) => value >= -maxScore && value <= maxScore,
  })
}
