import { test, expect } from '@playwright/test'
import { mockApi, setEnglishLocale } from './fixtures'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await setEnglishLocale(page)
    await mockApi(page)
  })

  test('sidebar links navigate to all pages', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Navigate to Trip Logs (menuitem accessible name includes icon + label)
    await page.getByRole('menuitem', { name: /trip logs/i }).click()
    await expect(page).toHaveURL(/\/fleet/)

    // Navigate to Map
    await page.getByRole('menuitem', { name: /map/i }).click()
    await expect(page).toHaveURL('/map')

    // Navigate to Fleet
    await page.getByRole('menuitem', { name: /fleet/i }).click()
    await expect(page).toHaveURL('/health')

    // Navigate back to Dashboard
    await page.getByRole('menuitem', { name: /dashboard/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('catch-all redirects to dashboard', async ({ page }) => {
    await page.goto('/nonexistent-page')
    await expect(page).toHaveURL('/')
  })

  test('health detail route loads', async ({ page }) => {
    await page.goto('/health')
    await expect(page).toHaveURL('/health')

    // Page should show the fleet table heading
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
