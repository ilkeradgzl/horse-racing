import { test, expect } from '@playwright/test'

for (const width of [320, 1440]) {
  test(`skip link lands below the header on repeated keyboard and pointer activation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 400 })
    await page.goto('/')
    const skip = page.getByRole('link', { name: 'Skip to race' })
    const heading = page.getByRole('heading', { name: 'Race status', exact: true })
    const header = page.locator('header')

    const checkLanding = async () => {
      await expect(heading).toBeFocused()
      const target = await heading.boundingBox()
      const controls = await header.boundingBox()
      expect(target!.y).toBeGreaterThanOrEqual(controls!.y + controls!.height)
      expect(target!.y + target!.height).toBeLessThanOrEqual(400)
    }

    // The empty-state workspace is a valid destination before generation.
    await skip.focus()
    await expect(skip).toBeInViewport()
    await page.keyboard.press('Enter')
    await checkLanding()

    await page.getByRole('button', { name: 'Generate schedule' }).click()
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await skip.evaluate((element) => element.focus({ preventScroll: true }))
    await skip.click()
    await checkLanding()
    const firstScroll = await page.evaluate(() => window.scrollY)

    await skip.focus()
    await page.keyboard.press('Enter')
    await checkLanding()
    expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(firstScroll, 0)
    await skip.focus()
    await skip.click()
    await checkLanding()
    expect(await page.evaluate(() => window.scrollY)).toBeCloseTo(firstScroll, 0)
  })
}

const layouts = [
  { width: 320, axis: 'y', first: 'Race track', second: 'Horse list' },
  { width: 768, axis: 'y', first: 'Race track', second: 'Horse list' },
  { width: 1440, axis: 'x', first: 'Horse list', second: 'Race track' },
] as const

for (const { width, axis, first, second } of layouts) {
  test(`keeps race content and controls usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.clock.install()
    await page.goto('/')
    await page.getByRole('button', { name: 'Generate schedule' }).click()
    const firstPanel = await page.getByRole('region', { name: first, exact: true }).boundingBox()
    const secondPanel = await page.getByRole('region', { name: second, exact: true }).boundingBox()
    expect(firstPanel![axis]).toBeLessThan(secondPanel![axis])
    await page.getByRole('button', { name: 'Start', exact: true }).click()
    await page.clock.runFor(32)
    await page.clock.fastForward(100000)
    const results = page.getByRole('region', { name: 'Results', exact: true })
    const schedule = page.getByRole('region', { name: 'Race schedule', exact: true })
    expect((await results.boundingBox())!.y).toBeLessThan((await schedule.boundingBox())!.y)
    await page.getByRole('table', { name: 'Round 6 results', exact: true }).scrollIntoViewIfNeeded()
    await expect(page.getByRole('button', { name: 'Generate schedule' })).toBeInViewport()
    await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
    await expect(
      page.getByRole('table', { name: 'Available horses' }).locator('tbody tr'),
    ).toHaveCount(20)
  })
}
