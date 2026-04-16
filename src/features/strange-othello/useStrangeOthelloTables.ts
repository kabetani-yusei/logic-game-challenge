import { useEffect, useState } from "react"
import type { EvalTable, OthelloSolutionTable } from "./types"

export function useStrangeOthelloTables() {
  const [solutionTable, setSolutionTable] = useState<OthelloSolutionTable | null>(null)
  const [evalTable, setEvalTable] = useState<EvalTable | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTables() {
      try {
        const [solutionResponse, evalResponse] = await Promise.all([
          fetch("/strange-othello-table.json"),
          fetch("/strange-othello-eval.json"),
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
