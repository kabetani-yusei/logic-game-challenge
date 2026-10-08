import { expect, test } from "./fixtures"

test("works offline after the first visit", async ({ page, context }) => {
  await page.goto("/")
  await expect(page.getByText("オフラインでも遊べるようになりました")).toBeVisible({ timeout: 15_000 })
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready
  })

  await context.setOffline(true)

  // 初回訪問で開いていないページ・解析データもプリキャッシュから表示できる
  await page.goto("/strange-othello")
  await expect(page.getByText("オフラインです")).toBeVisible()
  await page.getByRole("button", { name: /に置く/ }).first().click()
  await expect(page.getByRole("status").first()).toContainText(/AIが .+ に置き/, { timeout: 10_000 })

  await page.goto("/mod-m")
  await expect(page.getByRole("status").first()).toContainText("あなたの番です", { timeout: 5000 })

  await context.setOffline(false)
})
