import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    let seed = 42
    Math.random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0
      return seed / 4294967296
    }
  })
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') })
  await page.goto('/')
})

test('initial desktop layout', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeDisabled()
  await expect(page).toHaveScreenshot('initial-desktop.png', { fullPage: true })
})

test('generated desktop layout', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate schedule' }).click()
  await expect(
    page.getByRole('region', { name: 'Race track', exact: true }).getByRole('progressbar'),
  ).toHaveCount(10)
  await page.mouse.move(0, 0)
  await expect(page).toHaveScreenshot('generated-desktop.png', { fullPage: true })
})

test('generated mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.getByRole('button', { name: 'Generate schedule' }).click()
  await expect(
    page.getByRole('region', { name: 'Race track', exact: true }).getByRole('progressbar'),
  ).toHaveCount(10)
  await page.mouse.move(0, 0)
  await expect(page).toHaveScreenshot('generated-mobile.png', { fullPage: true })
})

test('completed desktop layout', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate schedule' }).click()
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await page.clock.runFor(32)
  await page.clock.fastForward(100000)
  await expect(page.getByRole('status', { name: 'Race status', exact: true })).toHaveText(
    'All 6 rounds completed.',
  )
  await page.mouse.move(0, 0)
  await expect(page).toHaveScreenshot('completed-desktop.png', { fullPage: true })
})
