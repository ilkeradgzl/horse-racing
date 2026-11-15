import { test, expect } from '@playwright/test'

test('generates and replaces a schedule without changing the roster', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Horse Racing')
  await expect(page.getByRole('heading', { name: 'Horse Racing', level: 1 })).toBeVisible()
  const rosterRows = page.getByRole('table', { name: 'Available horses' }).locator('tbody tr')
  await expect(rosterRows).toHaveCount(20)
  const roster = await rosterRows.allTextContents()
  await expect(page.getByRole('status', { name: 'Schedule status' })).toHaveText(
    'No schedule generated',
  )

  const generate = page.getByRole('button', { name: 'Generate schedule' })
  await generate.focus()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('status', { name: 'Schedule status' })).toHaveText(
    '6 rounds · 10 horses per round',
  )
  const rounds = page
    .getByRole('list', { name: 'Scheduled rounds', exact: true })
    .locator(':scope > li')
  await expect(rounds).toHaveCount(6)
  for (let number = 1; number <= 6; number += 1) {
    await expect(
      page.getByRole('list', { name: `Round ${number} participants` }).getByRole('listitem'),
    ).toHaveCount(10)
  }

  await generate.click()

  await expect(rounds).toHaveCount(6)
  await expect(rosterRows).toHaveText(roster)
})

for (const width of [320, 375]) {
  test(`keeps generated content within a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Generate schedule' }).click()
    await expect(page.getByRole('heading', { name: 'Round 6', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
  })
}
