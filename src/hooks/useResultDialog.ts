import { useState } from "react"

// 対局終了時に結果ダイアログを開く。閉じた後は同じ局面では再表示せず、
// 「待った」や「やり直し」で局面が変わると再び表示対象になる。
export function useResultDialog(gameState: object, gameOver: boolean) {
  const [dismissedState, setDismissedState] = useState<object | null>(null)

  return {
    open: gameOver && dismissedState !== gameState,
    close: () => setDismissedState(gameState),
    reopen: () => setDismissedState(null),
  }
}
