import { createHash } from "node:crypto"
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, relative, sep } from "node:path"
import type { Plugin, ResolvedConfig } from "vite"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { metaContentSecurityPolicy, renderNetlifyHeaders, securityHeaders } from "./security-headers.ts"
import { STRANGE_OTHELLO_TABLES_VERSION } from "./src/features/strange-othello/constants.ts"

function securityPlugin(): Plugin {
  return {
    name: "logic-game-challenge:security",
    apply: "build",
    transformIndexHtml(html) {
      // charset の直後（他のどのリソースよりも前）に CSP を挿入する
      const charset = '<meta charset="UTF-8" />'
      if (!html.includes(charset)) {
        throw new Error("index.html must contain <meta charset=\"UTF-8\" />")
      }
      return html.replace(
        charset,
        `${charset}\n    <meta http-equiv="Content-Security-Policy" content="${metaContentSecurityPolicy}" />`,
      )
    },
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "_headers", source: renderNetlifyHeaders() })
    },
  }
}

// オフライン用にプリキャッシュしないファイル（ホスティング設定、大きく任意の評価値データなど）
const PRECACHE_EXCLUDE = new Set(["_headers", "_redirects", "robots.txt", "sw.js", "strange-othello-eval.bin"])
// 解析テーブルはクエリ付き URL で取得するため、キャッシュキーも合わせる
const PRECACHE_QUERY: Record<string, string> = {
  "strange-othello-solution.bin": `?v=${STRANGE_OTHELLO_TABLES_VERSION}`,
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
  )
}

function serviceWorkerPlugin(): Plugin {
  let config: ResolvedConfig

  return {
    name: "logic-game-challenge:service-worker",
    apply: "build",
    configResolved(resolved) {
      config = resolved
    },
    closeBundle() {
      const outDir = config.build.outDir
      const files = listFiles(outDir)
        .map((file) => relative(outDir, file).split(sep).join("/"))
        .filter((file) => !PRECACHE_EXCLUDE.has(file))
        .sort()

      // ファイル内容のハッシュをキャッシュ名に使い、デプロイごとに古いキャッシュを確実に破棄する
      const hash = createHash("sha256")
      for (const file of files) {
        hash.update(file)
        hash.update(readFileSync(join(outDir, file)))
      }

      const urls = files.map((file) => `/${file}${PRECACHE_QUERY[file] ?? ""}`)
      const template = readFileSync(new URL("./service-worker/sw.js", import.meta.url), "utf8")
      const header = [
        `const PRECACHE_URLS = ${JSON.stringify(urls)}`,
        `const CACHE_VERSION = ${JSON.stringify(hash.digest("hex").slice(0, 12))}`,
      ].join("\n")

      writeFileSync(join(outDir, "sw.js"), `${header}\n${template}`)
    },
  }
}

// 開発サーバーは HMR がインラインスクリプトを使うため CSP 以外のヘッダーのみ付与する
const { "Content-Security-Policy": _csp, "Strict-Transport-Security": _hsts, ...devHeaders } = securityHeaders

export default defineConfig({
  plugins: [react(), securityPlugin(), serviceWorkerPlugin()],
  build: {
    outDir: "dist",
    target: "es2022",
    sourcemap: false,
    // フォント等を data: URI として埋め込まず、CSP を厳格に保つ
    assetsInlineLimit: 0,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "react", test: /node_modules[\\/](react|react-dom|scheduler|react-router)[\\/]/ },
            { name: "mui", test: /node_modules[\\/](@mui|@emotion)[\\/]/ },
          ],
        },
      },
    },
  },
  server: {
    headers: devHeaders,
  },
  preview: {
    headers: securityHeaders,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "*.test.ts"],
  },
})
