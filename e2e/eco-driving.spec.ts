import { test, expect } from '@playwright/test'
import { mockApi, setEnglishLocale } from './fixtures'

test.describe('Eco-Driving', () => {
  test.beforeEach(async ({ page }) => {
    await setEnglishLocale(page)
    await mockApi(page)
    await page.goto('/eco-driving')
  })

  test('renders page title', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1, name: 'Eco-Driving Comparison' }),
    ).toBeVisible()
  })

  test('defaults to AHE vehicle selection', async ({ page }) => {
    // Should default to V3 (Skoda AHE Superb) as it's eco-enabled and matches AHE
    await expect(page.getByTitle('Skoda AHE Superb (3EF 9012)')).toBeVisible()
  })

  test('renders stat cards when events exist', async ({ page }) => {
    await expect(page.getByText('Total Events')).toBeVisible()
    await expect(page.getByText('High Severity')).toBeVisible()
    await expect(page.getByText('Vehicles Analyzed')).toBeVisible()
    await expect(page.getByText('Avg Eco Score')).toBeVisible()
  })

  test('renders event log table', async ({ page }) => {
    await expect(page.getByRole('table').first()).toBeVisible()
  })

  test('renders vehicle ranking table', async ({ page }) => {
    await expect(page.getByText('Vehicle Ranking')).toBeVisible()
  })
})
