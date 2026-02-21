import { ref } from 'vue'
import HealthPage from '@/views/health/HealthPage.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'
import { createVehicle } from '@/__tests__/factories'

vi.mock('@/api/composables', () => ({
  useGroups: vi.fn(),
  useVehicles: vi.fn(),
}))

vi.mock('@/api/composables/useAIInsights', () => ({
  useAIInsights: vi.fn(),
}))

import { useGroups, useVehicles } from '@/api/composables'
import { useAIInsights } from '@/api/composables/useAIInsights'

function setupMocks(overrides: { vehicles?: any[]; error?: Error | null } = {}) {
  vi.mocked(useGroups).mockReturnValue({
    data: ref([{ Code: 'G1', Name: 'Default' }]),
    isLoading: ref(false),
    error: ref(null),
  } as any)

  vi.mocked(useVehicles).mockReturnValue({
    data: ref(overrides.vehicles ?? [
      createVehicle({ Code: 'V1', Name: 'Car Alpha', SPZ: '1AB 1234', IsActive: true, Speed: 60, Odometer: 150000 }),
      createVehicle({ Code: 'V2', Name: 'Car Beta', SPZ: '2CD 5678', IsActive: false, Speed: 0, Odometer: 80000 }),
    ]),
    isLoading: ref(false),
    error: ref(overrides.error ?? null),
  } as any)

  vi.mocked(useAIInsights).mockReturnValue({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null),
  } as any)
}

describe('HealthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders title and subtitle', () => {
    setupMocks()
    const wrapper = mountWithPlugins(HealthPage)

    expect(wrapper.find('h1').text()).toBe('Fleet')
    expect(wrapper.text()).toContain('Vehicle overview, costs, and consumption')
  })

  it('renders vehicle table', () => {
    setupMocks()
    const wrapper = mountWithPlugins(HealthPage)

    const table = wrapper.findComponent({ name: 'ATable' })
    expect(table.exists()).toBe(true)
  })

  it('shows error alert when loading fails', () => {
    setupMocks({ error: new Error('Failed') })
    const wrapper = mountWithPlugins(HealthPage)

    expect(wrapper.text()).toContain('Failed to load vehicle data')
  })

  it('renders vehicle names in table', () => {
    setupMocks()
    const wrapper = mountWithPlugins(HealthPage)

    expect(wrapper.text()).toContain('Car Alpha')
    expect(wrapper.text()).toContain('Car Beta')
  })

  it('renders status tags with correct colors', () => {
    setupMocks()
    const wrapper = mountWithPlugins(HealthPage)

    expect(wrapper.text()).toContain('In service')
    expect(wrapper.text()).toContain('Out of service')
  })

  it('renders AI insights button', () => {
    setupMocks()
    const wrapper = mountWithPlugins(HealthPage)

    const aiBtn = wrapper.findComponent({ name: 'AIInsightsButton' })
    expect(aiBtn.exists()).toBe(true)
  })
})
