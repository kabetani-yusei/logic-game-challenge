import { useEffect, useState } from "react"
import type { z } from "zod"
import { STRANGE_OTHELLO_TABLES_VERSION } from "./constants"
import { evalTableSchema, solutionTableSchema } from "./schema"
import type { EvalTable, OthelloSolutionTable } from "./types"

export type TableStatus = "idle" | "loading" | "ready" | "error"

interface TableState<T> {
  status: TableStatus
  data: T | null
}

// 一度検証したテーブルはページ遷移しても再取得・再検証しない
const tableCache = new Map<string, Promise<unknown>>()

function loadTable<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const url = `${import.meta.env.BASE_URL}${path}?v=${STRANGE_OTHELLO_TABLES_VERSION}`
  const cached = tableCache.get(url)

  if (cached) {
    return cached as Promise<T>
  }

  const promise = fetch(url, { credentials: "same-origin" })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load ${path}: HTTP ${response.status}`)
      }

      return schema.parse(await response.json())
    })
    .catch((error: unknown) => {
      tableCache.delete(url)
      throw error
    })

  tableCache.set(url, promise)
  return promise
}

function useTable<T>(path: string, schema: z.ZodType<T>, enabled: boolean) {
  const [state, setState] = useState<TableState<T>>({ status: "idle", data: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) {
      return
    }

    // 取得処理はキャッシュで共有しているため中断せず、アンマウント後の結果だけを無視する
    let active = true
    loadTable(path, schema)
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
  }, [path, schema, enabled, attempt])

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
  const solution = useTable<OthelloSolutionTable>("strange-othello-table.json", solutionTableSchema, true)
  const evaluation = useTable<EvalTable>("strange-othello-eval.json", evalTableSchema, evaluationEnabled)

  return { solution, evaluation }
}
