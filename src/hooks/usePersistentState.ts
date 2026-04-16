import { useEffect, useState } from "react"

interface StoredValue<T> {
  version: number
  value: T
}

interface UsePersistentStateOptions {
  version?: number
}

function resolveInitialValue<T>(initialValue: T | (() => T)): T {
  return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue
}

export function usePersistentState<T>(
  key: string,
  initialValue: T | (() => T),
  options: UsePersistentStateOptions = {},
) {
  const version = options.version ?? 1

  const readState = (): T => {
    const fallbackValue = resolveInitialValue(initialValue)

    if (typeof window === "undefined") {
      return fallbackValue
    }

    try {
      const storedValue = window.localStorage.getItem(key)

      if (!storedValue) {
        return fallbackValue
      }

      const parsed = JSON.parse(storedValue) as StoredValue<T>
      return parsed.version === version ? parsed.value : fallbackValue
    } catch (error) {
      console.error(`Failed to read persistent state for "${key}"`, error)
      return fallbackValue
    }
  }

  const [state, setState] = useState<T>(readState)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version,
          value: state,
        }),
      )
    } catch (error) {
      console.error(`Failed to persist state for "${key}"`, error)
    }
  }, [key, state, version])

  const resetState = () => {
    const nextState = resolveInitialValue(initialValue)
    setState(nextState)

    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Failed to clear persistent state for "${key}"`, error)
    }
  }

  return [state, setState, resetState] as const
}
