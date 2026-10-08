import { useCallback, useEffect, useState } from "react"
import { z, type Schema } from "../lib/schema"

// localStorage はユーザーや拡張機能が自由に書き換えられる「信頼できない入力」として扱う。
// 読み込み時はスキーマで検証し、壊れた値・改ざんされた値・旧バージョンの値は破棄して初期状態に戻す。
const MAX_STORED_BYTES = 256 * 1024

interface UsePersistentStateOptions<T> {
  version: number
  schema: Schema<T>
}

function resolveInitialValue<T>(initialValue: T | (() => T)): T {
  return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue
}

function getStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    // Safari のプライベートモードや、ストレージがブロックされている環境では例外になる
    return null
  }
}

export function readPersistentValue<T>(key: string, { version, schema }: UsePersistentStateOptions<T>): T | null {
  const storage = getStorage()

  if (!storage) {
    return null
  }

  try {
    const raw = storage.getItem(key)

    if (!raw || raw.length > MAX_STORED_BYTES) {
      return null
    }

    const envelope = z.object({ version: z.literal(version), value: schema }).safeParse(JSON.parse(raw))
    return envelope.success ? envelope.data.value : null
  } catch {
    return null
  }
}

export function usePersistentState<T>(
  key: string,
  initialValue: T | (() => T),
  options: UsePersistentStateOptions<T>,
) {
  const { version } = options
  const [state, setState] = useState<T>(() => readPersistentValue(key, options) ?? resolveInitialValue(initialValue))

  useEffect(() => {
    const storage = getStorage()

    if (!storage) {
      return
    }

    try {
      storage.setItem(key, JSON.stringify({ version, value: state }))
    } catch {
      // 容量超過などで保存できなくてもゲーム自体は続行できる
    }
  }, [key, state, version])

  const resetState = useCallback(() => {
    setState(resolveInitialValue(initialValue))
  }, [initialValue])

  return [state, setState, resetState] as const
}
