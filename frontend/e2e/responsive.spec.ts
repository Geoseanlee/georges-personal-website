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

test('profile photo floats over the nav and failed hero images use the dark placeholder', async ({ page }) => {
  await page.route('**/images/**', (route) => route.abort())
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')

  const profileLink = page.getByRole('link', { name: 'George Li, home' })
  await expect(profileLink.locator('.profile-avatar-frame > span')).toHaveText('GL')
  await expect(page.getByRole('img', { name: 'George Li portrait unavailable' })).toBeVisible()
  await expect(page.locator('.hero-portrait-placeholder')).toHaveCSS(
    'background-color',
    'rgb(40, 44, 52)',
  )

  const beforeScroll = await profileLink.evaluate((element) => {
    const { x, y } = element.getBoundingClientRect()
    return { position: getComputedStyle(element).position, x, y }
  })
  await page.evaluate(() => window.scrollTo(0, 600))
  const afterScroll = await profileLink.evaluate((element) => {
    const { x, y } = element.getBoundingClientRect()
    return { x, y }
  })

  expect(beforeScroll.position).toBe('fixed')
  expect(afterScroll).toEqual({ x: beforeScroll.x, y: beforeScroll.y })
})

test('profile photo stays within the nav by default and grows inward after a hover delay', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')

  const profileLink = page.getByRole('link', { name: 'George Li, home' })
  const navHeight = await page.locator('.site-header').evaluate((element) =>
    element.getBoundingClientRect().height,
  )
  const initial = await profileLink.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const frame = element.querySelector('.profile-avatar-frame')
    const image = frame?.querySelector('img')
    return {
      width: rect.width,
      height: rect.height,
      frameWidth: frame?.getBoundingClientRect().width ?? 0,
      filter: image ? getComputedStyle(image).filter : '',
    }
  })

  expect(initial.height).toBeLessThan(navHeight)
  expect(initial.filter).toContain('brightness(0.78)')
  const avatarFrame = profileLink.locator('.profile-avatar-frame')
  await profileLink.hover()
  await expect(avatarFrame).toHaveCSS('width', '160px', { timeout: 1200 })

  const expanded = await avatarFrame.evaluate((frame) => {
    const rect = frame.getBoundingClientRect()
    const image = frame.querySelector('img')
    return {
      width: rect.width,
      right: rect.right,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      borderWidth: getComputedStyle(frame).borderTopWidth,
      filter: image ? getComputedStyle(image).filter : '',
    }
  })
  expect(expanded.width).toBeCloseTo(initial.frameWidth * 4)
  expect(expanded.right).toBeLessThan(expanded.viewportWidth)
  expect(expanded.bottom).toBeLessThan(expanded.viewportHeight)
  expect(expanded.borderWidth).toBe('2px')
  await expect.poll(() => avatarFrame.locator('img').evaluate((image) =>
    getComputedStyle(image).filter,
  )).toBe('brightness(1)')

  await page.mouse.move(expanded.right - 8, expanded.bottom - 8)
  await expect(profileLink).toHaveCSS('width', '160px')
  await expect(avatarFrame).toHaveCSS('width', '160px')
})

test('hero photo keeps its landscape ratio and fades to transparent at the edges', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')

  const heroImage = page.getByRole('img', { name: 'George Li sitting by a cafe window' })
  await expect(heroImage).toHaveAttribute('src', '/images/hero-photo.jpg?v=2')
  await expect(heroImage).toHaveJSProperty('naturalWidth', 1706)
  await expect(heroImage).toHaveJSProperty('naturalHeight', 1279)
  await expect(heroImage).toHaveCSS('aspect-ratio', '4 / 3')
  await expect(heroImage).toHaveCSS('transform', 'matrix(-1, 0, 0, 1, 0, 0)')
  await expect(heroImage).toHaveCSS('mask-image', /linear-gradient/)
  await expect(page.locator('.hero-portrait-frame')).toHaveCSS(
    'border-top-color',
    'rgba(255, 255, 255, 0.38)',
  )
  await expect(page.locator('.hero-portrait-frame')).toHaveCSS(
    'backdrop-filter',
    /blur\(24px\)/,
  )

  const columnWidths = await page.evaluate(() => ({
    text: document.querySelector('.hero-inner')?.getBoundingClientRect().width ?? 0,
    image: document.querySelector('.hero-portrait')?.getBoundingClientRect().width ?? 0,
  }))
  expect(columnWidths.text / (columnWidths.text + columnWidths.image)).toBeCloseTo(0.4, 1)
})

test('hero glass frame lights up and lifts, tilts with the mouse, and presses down', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('/')

  const frame = page.locator('.hero-portrait-frame')
  const initialTransform = await frame.evaluate((element) => getComputedStyle(element).transform)
  await frame.hover({ position: { x: 24, y: 24 } })

  await expect(frame).toHaveCSS('border-top-color', 'rgba(255, 255, 255, 0.62)')
  await expect.poll(() => frame.evaluate((element) => getComputedStyle(element).translate))
    .not.toBe('none')
  await expect.poll(() => frame.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(initialTransform)

  await page.mouse.down()
  await expect.poll(() => frame.evaluate((element) => getComputedStyle(element).translate))
    .toBe('0px 2px')
  await page.mouse.up()
})
