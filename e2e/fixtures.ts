import { type Page } from '@playwright/test'

/** Set locale to English via localStorage (default is Czech) */
export async function setEnglishLocale(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('locale', 'en')
  })
}

/** Mock API data for E2E tests — intercepts /api/v1/* requests */
export async function mockApi(page: Page) {
  const groups = [{ Code: 'G1', Name: 'Default' }]

  const vehicles = [
    {
      Code: 'V1',
      GroupCode: 'G1',
      BranchId: 1,
      BranchName: 'Prague',
      Name: 'Toyota Camry',
      SPZ: '1AB 1234',
      BatteryPercentage: 95,
      Speed: 60,
      LastPosition: { Latitude: '50.0755', Longitude: '14.4378' },
      DeviceImei: '123456789',
      IsActive: true,
      LastPositionTimestamp: new Date().toISOString(),
      IsEcoDrivingEnabled: false,
      Odometer: 150000,
      IsInvoiced: false,
      RefuelingCards: [],
    },
    {
      Code: 'V2',
      GroupCode: 'G1',
      BranchId: 1,
      BranchName: 'Brno',
      Name: 'Skoda Octavia',
      SPZ: '2CD 5678',
      BatteryPercentage: 80,
      Speed: 0,
      LastPosition: { Latitude: '49.1951', Longitude: '16.6068' },
      DeviceImei: '987654321',
      IsActive: false,
      LastPositionTimestamp: new Date(Date.now() - 3600000).toISOString(),
      IsEcoDrivingEnabled: false,
      Odometer: 80000,
      IsInvoiced: false,
      RefuelingCards: [],
    },
  ]

  const trips = [
    {
      Id: 1,
      AverageSpeed: 65,
      MaxSpeed: 110,
      TripType: true,
      StartTime: '2025-01-15T08:00:00',
      FinishTime: '2025-01-15T09:30:00',
      StartPosition: { Latitude: '50.0755', Longitude: '14.4378' },
      FinishPosition: { Latitude: '49.1951', Longitude: '16.6068' },
      StartAddress: 'Prague',
      FinishAddress: 'Brno',
      TripLength: '01:30:00',
      TripWaitingTime: '00:00:00',
      TotalDistance: 205.3,
      DriverName: 'Jan Novak',
      DriverChipCode: 'D001',
      IsFinished: true,
      Odometer: 150000,
      FuelConsumed: { Value: 12.5, VolumeUnit: 1 },
      TripCost: { Value: 450, Currency: 1 },
    },
  ]

  // Intercept all API requests
  await page.route('**/api/v1/**', async (route) => {
    const url = route.request().url()

    if (url.includes('/api/v1/groups')) {
      return route.fulfill({ json: groups })
    }
    if (url.match(/\/api\/v1\/vehicles\/group\//)) {
      return route.fulfill({ json: vehicles })
    }
    if (url.match(/\/api\/v1\/vehicle\/[^/]+\/trips/)) {
      return route.fulfill({ json: trips })
    }
    if (url.match(/\/api\/v1\/vehicle\/[^/]+\/sensors/)) {
      return route.fulfill({ json: { items: [] } })
    }
    if (url.match(/\/api\/v1\/vehicle\/[^/]+$/)) {
      return route.fulfill({ json: vehicles[0] })
    }

    // Fallback: empty 200 response
    return route.fulfill({ json: {} })
  })

  // Also mock the AI insights endpoint
  await page.route('**/api/insights/**', (route) =>
    route.fulfill({ json: null }),
  )
}

/** Expand the collapsed sidebar so menu labels are visible */
export async function expandSidebar(page: Page) {
  const expandBtn = page.locator('button', { hasText: '→' })
  if (await expandBtn.isVisible()) {
    await expandBtn.click()
  }
}
