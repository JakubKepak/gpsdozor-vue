import { test, expect } from '@playwright/test'
import { mockApi, setEnglishLocale } from './fixtures'

test.describe('Fleet (Health) Page', () => {
  test.beforeEach(async ({ page }) => {
    await setEnglishLocale(page)
    await mockApi(page)
    await page.goto('/health')
  })

  test('renders page title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Fleet' })).toBeVisible()
  })

  test('renders vehicle table with all vehicles', async ({ page }) => {
    const table = page.getByRole('table')
    await expect(table).toBeVisible()

    await expect(page.getByText('Toyota Camry')).toBeVisible()
    await expect(page.getByText('Skoda Octavia')).toBeVisible()
    await expect(page.getByText('Skoda AHE Superb')).toBeVisible()
  })

  test('shows 3-state vehicle status tags', async ({ page }) => {
    // V1: Speed=60, IsActive=true, fresh timestamp → "In service" (green)
    await expect(page.getByText('In service')).toBeVisible()

    // V3: Speed=0, IsActive=true, fresh timestamp → "Idle" (orange)
    await expect(page.getByText('Idle')).toBeVisible()

    // V2: Speed=0, IsActive=false → "Out of service" (red)
    await expect(page.getByText('Out of service')).toBeVisible()
  })

  test('shows activity with effective speed', async ({ page }) => {
    // V1 should show speed
    await expect(page.getByText('60 km/h')).toBeVisible()

    // V2 and V3 should show "Parked"
    const parkedLabels = page.getByText('Parked')
    await expect(parkedLabels.first()).toBeVisible()
  })

  test('renders eco driving indicators', async ({ page }) => {
    // V3 has IsEcoDrivingEnabled=true — should show a check icon
    const table = page.getByRole('table')
    await expect(table).toBeVisible()

    // V1/V2 have eco disabled (dash), V3 has eco enabled (check)
    const checks = table.getByRole('img', { name: 'check' })
    await expect(checks).toHaveCount(1)
  })
})
