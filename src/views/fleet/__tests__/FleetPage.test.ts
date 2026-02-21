import { ref, computed } from 'vue'
import FleetPage from '@/views/fleet/FleetPage.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'
import { createVehicle, createTrip } from '@/__tests__/factories'

vi.mock('@/api/composables', () => ({
  useGroups: vi.fn(),
  useVehicles: vi.fn(),
  useAllVehicleTrips: vi.fn(),
}))

vi.mock('@/api/composables/useAIInsights', () => ({
  useAIInsights: vi.fn(),
}))

import { useGroups, useVehicles, useAllVehicleTrips } from '@/api/composables'
import { useAIInsights } from '@/api/composables/useAIInsights'

const vehicle = createVehicle({ Code: 'V1', Name: 'Test Car', SPZ: 'ABC 123' })

function setupMocks(overrides: { error?: Error | null; trips?: any[] } = {}) {
  vi.mocked(useGroups).mockReturnValue({
    data: ref([{ Code: 'G1', Name: 'Default' }]),
    isLoading: ref(false),
    error: ref(null),
  } as any)

  vi.mocked(useVehicles).mockReturnValue({
    data: ref([vehicle]),
    isLoading: ref(false),
    error: ref(null),
  } as any)

  const tripData = overrides.trips ?? [
    {
      ...createTrip({ TotalDistance: 150.5, DriverName: 'Jan Novak' }),
      vehicleCode: 'V1',
      vehicleName: 'Test Car',
      vehicleSPZ: 'ABC 123',
    },
  ]

  vi.mocked(useAllVehicleTrips).mockReturnValue(
    computed(() => ({
      data: tripData,
      isLoading: false,
      error: overrides.error ?? null,
    })) as any,
  )

  vi.mocked(useAIInsights).mockReturnValue({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null),
  } as any)
}

describe('FleetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and subtitle', () => {
    setupMocks()
    const wrapper = mountWithPlugins(FleetPage)

    expect(wrapper.find('h1').text()).toBe('Trip Logs')
    expect(wrapper.text()).toContain('Overview of all trips, routes, and drivers')
  })

  it('renders stat cards with computed values', () => {
    setupMocks()
    const wrapper = mountWithPlugins(FleetPage)

    expect(wrapper.text()).toContain('Total Trips')
    expect(wrapper.text()).toContain('Total Distance')
    expect(wrapper.text()).toContain('Vehicles')
    expect(wrapper.text()).toContain('Drivers')
  })

  it('shows error alert when trip loading fails', () => {
    setupMocks({ error: new Error('API failed') })
    const wrapper = mountWithPlugins(FleetPage)

    expect(wrapper.text()).toContain('Failed to load trip data')
  })

  it('renders AI insights button', () => {
    setupMocks()
    const wrapper = mountWithPlugins(FleetPage)

    const aiBtn = wrapper.findComponent({ name: 'AIInsightsButton' })
    expect(aiBtn.exists()).toBe(true)
  })

  it('renders trip table component', () => {
    setupMocks()
    const wrapper = mountWithPlugins(FleetPage)

    const table = wrapper.findComponent({ name: 'ATable' })
    expect(table.exists()).toBe(true)
  })
})
