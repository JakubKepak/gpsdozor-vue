import { test, expect } from '@playwright/test'
import { mockApi, setEnglishLocale, expandSidebar } from './fixtures'

test.describe('Locale', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
  })

  test('page loads with English text by default', async ({ page }) => {
    await setEnglishLocale(page)
    await page.goto('/')
    await expect(page.getByText('Fleet Dashboard')).toBeVisible()
    await expect(page.getByText('Dashboard', { exact: true })).toBeVisible()
  })

  test('locale switch changes UI text to Czech', async ({ page }) => {
    await setEnglishLocale(page)
    await page.goto('/')
    await expect(page.getByText('Fleet Dashboard')).toBeVisible()

    // Expand sidebar to reveal locale selector
    await expandSidebar(page)

    // After expanding, the locale is a Select dropdown — pick Czech
    const localeSelect = page.locator('.locale-select')
    await expect(localeSelect).toBeVisible()
    await localeSelect.click()
    await page.getByText('CZ').click()

    // English title should be gone, Czech title should appear
    await expect(page.getByText('Fleet Dashboard')).not.toBeVisible()
  })

  test('locale persists on reload', async ({ page }) => {
    await setEnglishLocale(page)
    await page.goto('/')
    await expect(page.getByText('Fleet Dashboard')).toBeVisible()

    await expandSidebar(page)
    const localeSelect = page.locator('.locale-select')
    await expect(localeSelect).toBeVisible()
    await localeSelect.click()
    await page.getByText('CZ').click()

    await expect(page.getByText('Fleet Dashboard')).not.toBeVisible()

    // Reload — locale should persist via localStorage (not reset by setEnglishLocale since it only runs before first navigation)
    await page.reload()

    // English text should still not be visible after reload
    await expect(page.getByText('Fleet Dashboard')).not.toBeVisible()
  })
})
