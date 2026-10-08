import { useEffect, useState } from "react"
import { STRANGE_OTHELLO_TABLES_VERSION } from "./constants"
import { decodeEvalTable, decodeSolutionTable, type DecodedTable } from "./tableFormat"

export type TableStatus = "idle" | "loading" | "ready" | "error"

interface TableState {
  status: TableStatus
  data: DecodedTable | null
}

// 一度読み込んだテーブルはページ遷移しても再取得・再デコードしない
const tableCache = new Map<string, Promise<DecodedTable>>()

function loadTable(path: string, decode: (buffer: ArrayBuffer) => DecodedTable): Promise<DecodedTable> {
  const url = `${import.meta.env.BASE_URL}${path}?v=${STRANGE_OTHELLO_TABLES_VERSION}`
  const cached = tableCache.get(url)

  if (cached) {
    return cached
  }

  const promise = fetch(url, { credentials: "same-origin" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${path}: HTTP ${response.status}`)
      }

      return decode(await response.arrayBuffer())
    })
    .catch((error: unknown) => {
      tableCache.delete(url)
      throw error
    })

  tableCache.set(url, promise)
  return promise
}

function useTable(path: string, decode: (buffer: ArrayBuffer) => DecodedTable, enabled: boolean) {
  const [state, setState] = useState<TableState>({ status: "idle", data: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    // 取得処理はキャッシュで共有しているため中断せず、アンマウント後の結果だけを無視する
    let active = true
    loadTable(path, decode)
      .then((data) => {
        if (active) setState({ status: "ready", data })
      })
      .catch((error: unknown) => {
        if (!active) return
        if (import.meta.env.DEV) console.error(error)
        setState({ status: "error", data: null })
      })

    return () => {
      active = false
    }
  }, [path, decode, enabled, attempt])

  const status: TableStatus = !enabled ? "idle" : state.status === "idle" ? "loading" : state.status

  return {
    status,
    data: state.data,
    retry: () => {
      setState({ status: "idle", data: null })
      setAttempt((value) => value + 1)
    },
  }
}

export function useStrangeOthelloTables(evaluationEnabled: boolean) {
  const solution = useTable("strange-othello-solution.bin", decodeSolutionTable, true)
  const evaluation = useTable("strange-othello-eval.bin", decodeEvalTable, evaluationEnabled)

  return { solution, evaluation }
}
