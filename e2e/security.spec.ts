import { expect, test } from "./fixtures"

test("responses carry the production security headers", async ({ page }) => {
  const response = await page.goto("/")
  const headers = response!.headers()
  expect(headers["content-security-policy"]).toContain("script-src 'self'")
  expect(headers["content-security-policy"]).toContain("require-trusted-types-for 'script'")
  expect(headers["x-frame-options"]).toBe("DENY")
  expect(headers["x-content-type-options"]).toBe("nosniff")
})

test("string-to-HTML assignment is blocked by Trusted Types", async ({ page, problems }) => {
  await page.goto("/")
  const executed = await page.evaluate(() => {
    const element = document.createElement("div")
    try {
      // Trusted Types によって文字列の HTML 代入自体が拒否される
      element.innerHTML = "<img src=x onerror=\"window.__xss = 1\">"
      document.body.append(element)
    } catch {
      return "blocked"
    }
    return "assigned"
  })
  expect(executed).toBe("blocked")
  // このテストでは意図的に違反を起こしているため、想定どおりの違反だけを取り除く
  const unexpected = problems.filter((message) => !/TrustedHTML|require-trusted-types-for/.test(message))
  problems.splice(0, problems.length, ...unexpected)
})
