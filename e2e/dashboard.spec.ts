import { test, expect } from '@playwright/test'
import { mockApi, setEnglishLocale } from './fixtures'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await setEnglishLocale(page)
    await mockApi(page)
    await page.goto('/')
  })

  test('renders stat cards', async ({ page }) => {
    await expect(page.getByText('Active Vehicles')).toBeVisible()
    await expect(page.getByText('Idle Vehicles')).toBeVisible()
    await expect(page.getByText('Maintenance')).toBeVisible()
    await expect(page.getByText('Total Fleet')).toBeVisible()
  })

  test('map area is visible', async ({ page }) => {
    await expect(page.getByText('Live Map')).toBeVisible()
  })

  test('recent alerts section is visible', async ({ page }) => {
    await expect(page.getByText('Recent Alerts')).toBeVisible()
  })
})
