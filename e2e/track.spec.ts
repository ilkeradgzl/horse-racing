import { test, expect } from '@playwright/test'

test('moves horses, freezes them on Pause, switches rounds, and retains the final positions', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/')
  const track = page.getByRole('region', { name: 'Race track', exact: true })
  await expect(track.getByRole('progressbar')).toHaveCount(0)
  await page.getByRole('button', { name: 'Generate schedule' }).click()
  await expect(track.getByRole('progressbar')).toHaveCount(10)
  const marker = track.locator('.runner-position').first()
  const initial = await marker.boundingBox()
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await page.clock.runFor(32)
  await page.clock.fastForward(2000)
  const moved = await marker.boundingBox()
  expect(moved!.x).toBeGreaterThan(initial!.x)
  await page.getByRole('button', { name: 'Pause', exact: true }).click()
  const paused = await marker.boundingBox()
  await page.clock.fastForward(60000)
  expect(await marker.boundingBox()).toEqual(paused)
  await page.getByRole('button', { name: 'Resume', exact: true }).click()
  await page.clock.runFor(32)
  await page.clock.fastForward(7000)
  await expect(track).toContainText('Round 2 · 1400 m')
  await page.clock.fastForward(100000)
  await expect(track).toContainText('Round 6 · 2200 m')
  await expect(track.locator('[aria-valuenow="100"]')).toHaveCount(10)
  await expect(track.getByText('Finished', { exact: true })).toHaveCount(10)
  await page.getByRole('button', { name: 'Generate schedule' }).click()
  await expect(track).toContainText('Round 1 · 1200 m')
  await expect(track.locator('[aria-valuenow="0"]')).toHaveCount(10)
})

test('fits all ten lanes on a 320px viewport at the start and finish', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 })
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Generate schedule' }).click()
  const track = page.getByRole('region', { name: 'Race track', exact: true })
  await expect(track.getByRole('progressbar')).toHaveCount(10)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await page.clock.runFor(32)
  await page.clock.fastForward(100000)
  await expect(track.locator('[aria-valuenow="100"]')).toHaveCount(10)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('hides moving indicators for reduced motion while keeping distances and results', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Generate schedule' }).click()
  const track = page.getByRole('region', { name: 'Race track', exact: true })
  await expect(
    track.getByText('Moving horse indicators are hidden.', { exact: false }),
  ).toBeVisible()
  await expect(track.locator('.runner-position').first()).toBeHidden()
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await page.clock.runFor(32)
  await page.clock.fastForward(100000)
  await expect(track.locator('[aria-valuenow="100"]')).toHaveCount(10)
  await expect(page.getByRole('table', { name: 'Round 6 results', exact: true })).toBeVisible()
})
