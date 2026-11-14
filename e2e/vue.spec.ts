import { test, expect } from '@playwright/test'

test('loads the application', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Horse Racing')
  await expect(page.getByRole('heading', { name: 'Horse Racing', level: 1 })).toBeVisible()
})
