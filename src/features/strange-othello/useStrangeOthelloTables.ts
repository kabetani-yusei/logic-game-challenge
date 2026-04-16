import { useEffect, useState } from "react"
import { STRANGE_OTHELLO_TABLES_VERSION } from "./constants"
import type { EvalTable, OthelloSolutionTable } from "./types"

export function useStrangeOthelloTables() {
  const [solutionTable, setSolutionTable] = useState<OthelloSolutionTable | null>(null)
  const [evalTable, setEvalTable] = useState<EvalTable | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTables() {
      try {
        const versionSuffix = `?v=${STRANGE_OTHELLO_TABLES_VERSION}`
        const [solutionResponse, evalResponse] = await Promise.all([
          fetch(`/strange-othello-table.json${versionSuffix}`),
          fetch(`/strange-othello-eval.json${versionSuffix}`),
        ])

        const [solutionData, evalData] = await Promise.all([
          solutionResponse.json() as Promise<OthelloSolutionTable>,
          evalResponse.json() as Promise<EvalTable>,
        ])

        if (!cancelled) {
          setSolutionTable(solutionData)
          setEvalTable(evalData)
        }
      } catch (error) {
        console.error("Failed to load strange othello tables", error)
      }
    }

    loadTables()

    return () => {
      cancelled = true
    }
  }, [])

  return { solutionTable, evalTable }
}
