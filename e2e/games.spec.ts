import { expect, test } from "./fixtures"

test("home lists every game and has no horizontal overflow", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { level: 1, name: "頭脳王に挑戦！" })).toBeVisible()
  for (const name of ["駒取りゲーム", "ストレンジオセロ", "mod M ゲーム"]) {
    await expect(page.getByRole("heading", { name })).toBeVisible()
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(0)
})

test("piece-taking: player move then AI reply", async ({ page }) => {
  await page.goto("/piece-taking")
  await page.getByRole("button", { name: "黄色を3個選ぶ" }).click()
  await page.getByRole("button", { name: /黄色を 3 個取る/ }).click()
  await expect(page.getByRole("status").first()).toContainText("AIは", { timeout: 5000 })
  await expect(page.getByRole("status").first()).toContainText("あなたの番です")
})

test("strange othello: AI answers from the solution table", async ({ page }) => {
  await page.goto("/strange-othello")
  await expect(page.getByRole("status").first()).toContainText("あなたの番です（黒）")
  await page.getByRole("button", { name: /に置く/ }).first().click()
  await expect(page.getByRole("status").first()).toContainText(/AIが .+ に置き/, { timeout: 10_000 })
})

test("strange othello: hidden evaluation panel loads", async ({ page }) => {
  await page.goto("/strange-othello")
  for (let index = 0; index < 5; index += 1) await page.getByRole("heading", { level: 1 }).click()
  await expect(page.getByRole("meter", { name: "評価値" })).toBeVisible({ timeout: 15_000 })
})

test("mod M: AI opens and the player can answer", async ({ page }) => {
  await page.goto("/mod-m")
  await expect(page.getByRole("status").first()).toContainText("あなたの番です", { timeout: 5000 })
  await page.getByRole("button", { name: /を出す/ }).first().click()
  await expect(page.getByRole("list", { name: /場に出されたカード/ }).getByRole("listitem")).toHaveCount(2)
})

test("win dialog shows and can restart", async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => {
    const state = {
      bluePieces: 0, yellowPieces: 0, redPieces: 1, currentTurn: "ai", selectedColor: "red",
      selectedCount: 1, gameOver: false, winner: null, lastAIMove: null,
    }
    localStorage.setItem(
      "logic-game-challenge/piece-taking",
      JSON.stringify({ version: 1, value: { gameState: state, history: [{ ...state, redPieces: 3, currentTurn: "player" }] } }),
    )
  })
  await page.goto("/piece-taking")
  const dialog = page.getByRole("dialog")
  await expect(dialog).toContainText("あなたの勝ちです！", { timeout: 5000 })
  await dialog.getByRole("button", { name: "もう一度挑戦する" }).click()
  await expect(page.getByRole("button", { name: "青色を4個選ぶ" })).toBeVisible()
})

test("tampered storage falls back to a fresh game", async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() =>
    localStorage.setItem(
      "logic-game-challenge/piece-taking",
      '{"version":1,"value":{"gameState":{"bluePieces":"<img src=x onerror=alert(1)>"}}}',
    ),
  )
  await page.goto("/piece-taking")
  await expect(page.getByRole("status").first()).toContainText("あなたの番です")
})

test("unknown routes show the not-found page", async ({ page }) => {
  await page.goto("/does-not-exist")
  await expect(page.getByRole("heading", { name: "ページが見つかりません" })).toBeVisible()
})
