import { test, expect } from '@playwright/test'

test('runs, pauses, resumes, and completes all rounds before allowing a new program', async ({
  page,
}) => {
  await page.clock.install()
  await page.goto('/')
  const generate = page.getByRole('button', { name: 'Generate schedule' })
  const start = page.getByRole('button', { name: 'Start', exact: true })
  const status = page.getByRole('status', { name: 'Race status', exact: true })
  await expect(start).toBeDisabled()
  await generate.click()
  const roster = await page
    .getByRole('table', { name: 'Available horses' })
    .locator('tbody tr')
    .allTextContents()
  await start.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeFocused()
  await expect(status).toHaveText('Round 1 of 6 is running.')
  await expect(generate).toBeDisabled()
  await page.clock.runFor(32)
  await page.clock.fastForward(2000)
  await page.getByRole('button', { name: 'Pause', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Resume', exact: true })).toBeFocused()
  const elapsed = await page.getByTestId('round-time').textContent()
  await expect(status).toHaveText('Round 1 of 6 is paused.')
  await expect(generate).toBeDisabled()
  await page.clock.fastForward(60000)
  await expect(page.getByTestId('round-time')).toHaveText(elapsed!)
  await expect(page.getByRole('list', { name: 'Completed rounds', exact: true })).toHaveCount(0)
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeFocused()
  await page.clock.runFor(32)
  await page.clock.fastForward(7000)
  await expect(
    page.getByRole('table', { name: 'Round 1 results', exact: true }).locator('tbody tr'),
  ).toHaveCount(10)
  await expect(status).toHaveText('Round 2 of 6 is running.')
  await page.clock.fastForward(100000)
  await expect(status).toHaveText('All 6 rounds completed.')
  await expect(
    page.getByRole('list', { name: 'Completed rounds', exact: true }).locator(':scope > li'),
  ).toHaveCount(6)
  for (let round = 1; round <= 6; round += 1) {
    await expect(
      page.getByRole('table', { name: `Round ${round} results`, exact: true }).locator('tbody tr'),
    ).toHaveCount(10)
  }
  await expect(start).toBeDisabled()
  await expect(generate).toBeEnabled()
  await generate.click()
  await expect(start).toBeEnabled()
  await expect(page.getByRole('list', { name: 'Completed rounds', exact: true })).toHaveCount(0)
  await expect(
    page.getByRole('table', { name: 'Available horses' }).locator('tbody tr'),
  ).toHaveText(roster)
})

test('keeps controls and completed results usable on a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 })
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Generate schedule' }).click()
  await page.getByRole('button', { name: 'Start', exact: true }).click()
  await page.clock.runFor(32)
  await page.clock.fastForward(100000)
  await expect(page.getByRole('status', { name: 'Race status', exact: true })).toHaveText(
    'All 6 rounds completed.',
  )
  await expect(page.getByRole('table', { name: 'Round 6 results', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})
