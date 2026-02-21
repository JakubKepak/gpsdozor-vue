import { test, expect } from '@playwright/test'
import { mockApi, setEnglishLocale } from './fixtures'

test.describe('Fleet / Trip Logs', () => {
  test.beforeEach(async ({ page }) => {
    await setEnglishLocale(page)
    await mockApi(page)
    await page.goto('/fleet')
  })

  test('renders page title and stat cards', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Trip Logs' })).toBeVisible()
    await expect(page.getByText('Total Trips')).toBeVisible()
    await expect(page.getByText('Total Distance')).toBeVisible()
  })

  test('renders vehicle selector', async ({ page }) => {
    const select = page.locator('.ant-select')
    await expect(select.first()).toBeVisible()
  })

  test('renders trip table', async ({ page }) => {
    const table = page.locator('.ant-table')
    await expect(table).toBeVisible()
  })
})
