import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { cacheRules, contentSecurityPolicy, metaContentSecurityPolicy, renderNetlifyHeaders, securityHeaders } from "./security-headers.ts"

describe("security headers", () => {
  it("does not allow inline or eval'd scripts", () => {
    const scriptSrc = contentSecurityPolicy.split("; ").find((directive) => directive.startsWith("script-src"))
    expect(scriptSrc).toBe("script-src 'self'")
    expect(contentSecurityPolicy).not.toContain("unsafe-eval")
  })

  it("omits directives that are ignored in <meta> CSP", () => {
    expect(metaContentSecurityPolicy).not.toContain("frame-ancestors")
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'")
  })

  it("keeps vercel.json in sync with security-headers.ts", () => {
    const vercel = JSON.parse(readFileSync(new URL("./vercel.json", import.meta.url), "utf8")) as {
      headers: { source: string; headers: { key: string; value: string }[] }[]
    }
    const globalRule = vercel.headers.find((rule) => rule.source === "/(.*)")
    expect(Object.fromEntries(globalRule!.headers.map(({ key, value }) => [key, value]))).toEqual(securityHeaders)

    const cacheValues = vercel.headers.filter((rule) => rule !== globalRule).map((rule) => rule.headers[0].value)
    expect(cacheValues).toEqual(cacheRules.map((rule) => rule.value))
  })

  it("renders every header into the _headers file", () => {
    const rendered = renderNetlifyHeaders()
    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(rendered).toContain(`  ${name}: ${value}`)
    }
  })
})
