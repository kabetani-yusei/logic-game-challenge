// 本番配信用のセキュリティヘッダー定義（単一の情報源）。
// - ビルド時に dist/_headers（Netlify / Cloudflare Pages 形式）を生成する
// - index.html に CSP の <meta> を埋め込む（ヘッダーを設定できないホスティング向けの多層防御）
// - `vite preview` でも同じヘッダーを返し、本番と同じ条件で動作確認できるようにする
// vercel.json のヘッダーもこの定義と一致していることをテストで検証している。

const cspDirectives: Record<string, string[]> = {
  "default-src": ["'none'"],
  "script-src": ["'self'"],
  // MUI (Emotion) は実行時に <style> を挿入するため 'unsafe-inline' が必要（スクリプトには許可しない）
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:"],
  "font-src": ["'self'"],
  "connect-src": ["'self'"],
  "manifest-src": ["'self'"],
  "base-uri": ["'none'"],
  "form-action": ["'none'"],
  "object-src": ["'none'"],
  "frame-src": ["'none'"],
  // オフライン対応の Service Worker（同一オリジンの /sw.js のみ）
  "worker-src": ["'self'"],
  "frame-ancestors": ["'none'"],
  "require-trusted-types-for": ["'script'"],
  // Service Worker 登録用の Trusted Types ポリシーだけを許可する（src/app/serviceWorker.ts）
  "trusted-types": ["lgc-service-worker"],
  "upgrade-insecure-requests": [],
}

// <meta> では frame-ancestors などが無視される（ブラウザが警告を出す）ため除外する
const META_UNSUPPORTED_DIRECTIVES = new Set(["frame-ancestors", "report-uri", "report-to", "sandbox"])

function serializeCsp(filter: (directive: string) => boolean = () => true) {
  return Object.entries(cspDirectives)
    .filter(([directive]) => filter(directive))
    .map(([directive, values]) => [directive, ...values].join(" "))
    .join("; ")
}

export const contentSecurityPolicy = serializeCsp()
export const metaContentSecurityPolicy = serializeCsp((directive) => !META_UNSUPPORTED_DIRECTIVES.has(directive))

export const securityHeaders: Record<string, string> = {
  "Content-Security-Policy": contentSecurityPolicy,
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy":
    "accelerometer=(), autoplay=(), camera=(), display-capture=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), publickey-credentials-get=(), usb=(), xr-spatial-tracking=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Origin-Agent-Cluster": "?1",
  "X-Permitted-Cross-Domain-Policies": "none",
}

export const cacheRules: { source: string; value: string }[] = [
  { source: "/assets/*", value: "public, max-age=31536000, immutable" },
  { source: "/*.bin", value: "public, max-age=86400, must-revalidate" },
  // Service Worker は常に最新を確認させ、アップデートを即座に検知できるようにする
  { source: "/sw.js", value: "no-cache" },
]

export function renderNetlifyHeaders() {
  const lines = ["/*", ...Object.entries(securityHeaders).map(([name, value]) => `  ${name}: ${value}`)]

  for (const rule of cacheRules) {
    lines.push("", rule.source, `  Cache-Control: ${rule.value}`)
  }

  return `${lines.join("\n")}\n`
}
