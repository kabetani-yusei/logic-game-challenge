// オフライン対応用の Service Worker。
// ビルド時に vite.config.ts のプラグインが、先頭に PRECACHE_URLS と CACHE_VERSION を埋め込んで dist/sw.js を出力する。

const PRECACHE_NAME = `lgc-precache-${CACHE_VERSION}`
const RUNTIME_NAME = `lgc-runtime-${CACHE_VERSION}`
const APP_SHELL_URL = "/index.html"
const NAVIGATION_TIMEOUT_MS = 4000

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PRECACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PRECACHE_NAME, RUNTIME_NAME])
      const names = await caches.keys()
      await Promise.all(names.filter((name) => name.startsWith("lgc-") && !keep.has(name)).map((name) => caches.delete(name)))
      await self.clients.claim()
    })(),
  )
})

// 画面側の「更新」ボタンから新しいバージョンへ切り替える
self.addEventListener("message", (event) => {
  if (event.origin === self.location.origin && event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

async function networkFirstNavigation(request) {
  const cache = await caches.open(PRECACHE_NAME)

  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), NAVIGATION_TIMEOUT_MS)),
    ])

    if (response.ok) {
      return response
    }

    return (await cache.match(APP_SHELL_URL)) || response
  } catch {
    const cached = await cache.match(APP_SHELL_URL)
    return cached || Response.error()
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)

  if (cached) {
    return cached
  }

  const response = await fetch(request)

  // 同一オリジンの正常なレスポンスだけを保存する（エラーページや不透明レスポンスはキャッシュしない）
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(RUNTIME_NAME)
    await cache.put(request, response.clone())
  }

  return response
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  // sw.js 自身は常にネットワークから取得してアップデートを検知できるようにする
  if (url.pathname === "/sw.js") {
    return
  }

  event.respondWith(cacheFirst(request))
})
