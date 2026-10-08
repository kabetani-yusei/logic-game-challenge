import type { Plugin } from "vite"
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { metaContentSecurityPolicy, renderNetlifyHeaders, securityHeaders } from "./security-headers.ts"

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

// 開発サーバーは HMR がインラインスクリプトを使うため CSP 以外のヘッダーのみ付与する
const { "Content-Security-Policy": _csp, "Strict-Transport-Security": _hsts, ...devHeaders } = securityHeaders

export default defineConfig({
  plugins: [react(), securityPlugin()],
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
