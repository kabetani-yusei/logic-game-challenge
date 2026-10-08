// Service Worker の登録と状態管理。
// CSP で Trusted Types を必須にしているため、登録 URL は専用ポリシーを通して生成する。

const SERVICE_WORKER_URL = "/sw.js"
const POLICY_NAME = "lgc-service-worker"

export interface ServiceWorkerState {
  /** 新しいバージョンが待機中（ユーザーの操作で切り替える） */
  updateReady: boolean
  /** 初回インストールが完了し、オフラインでも遊べるようになった */
  offlineReady: boolean
}

let state: ServiceWorkerState = { updateReady: false, offlineReady: false }
let waitingWorker: ServiceWorker | null = null
const listeners = new Set<() => void>()

function setState(patch: Partial<ServiceWorkerState>) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

export function subscribeServiceWorker(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getServiceWorkerState() {
  return state
}

export function dismissOfflineReady() {
  setState({ offlineReady: false })
}

export function applyServiceWorkerUpdate() {
  if (!waitingWorker) {
    return
  }

  navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true })
  waitingWorker.postMessage({ type: "SKIP_WAITING" })
}

function createScriptUrl(): string | TrustedScriptURL {
  const factory = window.trustedTypes

  if (!factory) {
    return SERVICE_WORKER_URL
  }

  const policy = factory.createPolicy(POLICY_NAME, {
    createScriptURL: (input) => {
      if (input !== SERVICE_WORKER_URL) {
        throw new TypeError(`Unexpected service worker URL: ${input}`)
      }
      return input
    },
  })

  return policy.createScriptURL(SERVICE_WORKER_URL)
}

function trackInstalling(worker: ServiceWorker, hadController: boolean) {
  worker.addEventListener("statechange", () => {
    if (worker.state !== "installed") {
      return
    }

    if (hadController) {
      waitingWorker = worker
      setState({ updateReady: true })
    } else {
      setState({ offlineReady: true })
    }
  })
}

export async function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return
  }

  try {
    const hadController = Boolean(navigator.serviceWorker.controller)
    // Trusted Types 有効時は TrustedScriptURL を渡す（DOM の型定義上は string のみ受け付けるためキャスト）
    const registration = await navigator.serviceWorker.register(createScriptUrl() as unknown as string, { scope: "/" })

    if (registration.waiting && hadController) {
      waitingWorker = registration.waiting
      setState({ updateReady: true })
    }

    if (registration.installing) {
      trackInstalling(registration.installing, hadController)
    }

    registration.addEventListener("updatefound", () => {
      if (registration.installing) {
        trackInstalling(registration.installing, Boolean(navigator.serviceWorker.controller))
      }
    })
  } catch (error) {
    // 登録に失敗してもアプリ自体はオンラインで動作する
    if (import.meta.env.DEV) console.error(error)
  }
}
