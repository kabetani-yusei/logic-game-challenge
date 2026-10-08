import { test as base, expect } from "@playwright/test"

// すべてのテストで CSP 違反・未捕捉の例外・コンソールエラーを収集し、発生したら失敗させる
export const test = base.extend<{ problems: string[] }>({
  problems: [
    async ({ page }, use) => {
      const problems: string[] = []
      await page.addInitScript(() => {
        document.addEventListener("securitypolicyviolation", (event) => {
          console.error(`CSP violation: ${event.violatedDirective} ${event.blockedURI}`)
        })
      })
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning") problems.push(message.text())
      })
      page.on("pageerror", (error) => problems.push(error.message))

      await use(problems)

      expect(problems, "console errors / CSP violations").toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
