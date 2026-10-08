// 対AIゲーム共通の「待った」処理。
// 履歴を後ろから辿り、プレイヤーが操作できる局面まで巻き戻す（AIの手とプレイヤーの手をまとめて取り消す）。
export const MAX_HISTORY_LENGTH = 200

export interface GameSession<S> {
  gameState: S
  history: S[]
}

export function findUndoIndex<S>(history: S[], isPlayerTurn: (state: S) => boolean) {
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (isPlayerTurn(history[index])) {
      return index
    }
  }

  return -1
}

export function canUndo<S>(history: S[], isPlayerTurn: (state: S) => boolean) {
  return findUndoIndex(history, isPlayerTurn) >= 0
}

export function undoSession<T extends GameSession<S>, S>(session: T, isPlayerTurn: (state: S) => boolean): T {
  const index = findUndoIndex(session.history, isPlayerTurn)

  if (index < 0) {
    return session
  }

  return {
    ...session,
    gameState: session.history[index],
    history: session.history.slice(0, index),
  }
}

export function pushHistory<S>(history: S[], state: S) {
  const next = [...history, state]
  return next.length > MAX_HISTORY_LENGTH ? next.slice(next.length - MAX_HISTORY_LENGTH) : next
}
