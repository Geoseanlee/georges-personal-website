import { expect, test } from '@playwright/test'

test('page content fits phone, tablet, and desktop widths', async ({ page }) => {
  for (const width of [375, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Blotz Task App' })).toBeVisible()
    await expect(page.locator('#about')).toBeAttached()
    await expect(page.locator('#work')).toBeAttached()
    await expect(page.locator('#journey')).toBeAttached()
    await expect(page.locator('#contact')).toBeAttached()

    const pageWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(pageWidth).toBeLessThanOrEqual(width)
  }
})

test('mobile navigation closes with Escape and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  const menuButton = page.locator('button[aria-controls="site-nav"]')
  await menuButton.click()
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true')

  await page.keyboard.press('Escape')
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  await expect(menuButton).toBeFocused()

  await menuButton.click()
  await page.locator('#site-nav a[href="#work"]').click()
  await expect(page).toHaveURL(/#work$/)
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
})
