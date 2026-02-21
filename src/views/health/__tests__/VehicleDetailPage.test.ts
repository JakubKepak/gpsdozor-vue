import { ref } from 'vue'
import VehicleDetailPage from '@/views/health/VehicleDetailPage.vue'
import { mountWithRouter } from '@/__tests__/mount-helpers'
import { createVehicle, createTrip, createSensorItem } from '@/__tests__/factories'

vi.mock('vue-echarts', () => ({
  default: {
    name: 'VChart',
    props: ['option', 'autoresize'],
    template: '<div class="v-chart-stub"><slot /></div>',
  },
}))

vi.mock('@/api/composables', () => ({
  useVehicle: vi.fn(),
  useVehicleSensors: vi.fn(),
  useTrips: vi.fn(),
  useEcoDriving: vi.fn(),
}))

vi.mock('@/api/composables/useAIInsights', () => ({
  useAIInsights: vi.fn(),
}))

import { useVehicle, useVehicleSensors, useTrips, useEcoDriving } from '@/api/composables'
import { useAIInsights } from '@/api/composables/useAIInsights'

const testVehicle = createVehicle({
  Code: 'V001',
  Name: 'Test Vehicle',
  SPZ: '1AB 1234',
  BranchName: 'Prague',
  Speed: 60,
  Odometer: 150000,
})

function setupMocks(overrides: {
  vehicle?: any
  vehicleError?: Error | null
  vehicleLoading?: boolean
  sensors?: any[]
  sensorsLoading?: boolean
} = {}) {
  vi.mocked(useVehicle).mockReturnValue({
    data: ref(overrides.vehicle !== undefined ? overrides.vehicle : testVehicle),
    isLoading: ref(overrides.vehicleLoading ?? false),
    error: ref(overrides.vehicleError ?? null),
  } as any)

  vi.mocked(useVehicleSensors).mockReturnValue({
    data: ref(overrides.sensors
      ? { items: overrides.sensors }
      : {
          items: [
            createSensorItem({ name: 'ExternalBatteryVoltage', data: [{ t: '2025-01-15T08:00:00', v: 12.8 }] }),
            createSensorItem({ name: 'CoolingLiquidTemperature', data: [{ t: '2025-01-15T08:00:00', v: 90 }] }),
            createSensorItem({ name: 'Rpm', data: [{ t: '2025-01-15T08:00:00', v: 2000 }] }),
            createSensorItem({ name: 'FuelConsumedTotal', data: [{ t: '2025-01-15T08:00:00', v: 5000 }] }),
          ],
        }),
    isLoading: ref(overrides.sensorsLoading ?? false),
    error: ref(null),
  } as any)

  vi.mocked(useTrips).mockReturnValue({
    data: ref([createTrip()]),
    isLoading: ref(false),
    error: ref(null),
  } as any)

  vi.mocked(useAIInsights).mockReturnValue({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null),
  } as any)

  vi.mocked(useEcoDriving).mockReturnValue({
    data: ref(null),
    isLoading: ref(false),
    error: ref(null),
  } as any)
}

async function mountPage() {
  return mountWithRouter(
    VehicleDetailPage,
    [
      { path: '/health', component: { template: '<div />' } },
      { path: '/health/:vehicleCode', component: VehicleDetailPage },
    ],
    '/health/V001',
    {
      global: {
        stubs: {
          VehicleTripEconomics: { template: '<div class="trip-economics-stub" />' },
        },
      },
    },
  )
}

describe('VehicleDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders back link to fleet list', async () => {
    setupMocks()
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Back to list')
  })

  it('renders vehicle name and SPZ', async () => {
    setupMocks()
    const wrapper = await mountPage()

    expect(wrapper.find('h1').text()).toBe('Test Vehicle')
    expect(wrapper.text()).toContain('1AB 1234')
    expect(wrapper.text()).toContain('Prague')
  })

  it('shows error alert when vehicle load fails', async () => {
    setupMocks({ vehicleError: new Error('Not found') })
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Failed to load vehicle data')
  })

  it('renders gauge cards with sensor values', async () => {
    setupMocks()
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Battery Voltage')
    expect(wrapper.text()).toContain('Coolant Temperature')
    expect(wrapper.text()).toContain('Engine RPM')
    expect(wrapper.text()).toContain('Total Fuel Consumed')
  })

  it('renders sensor history heading', async () => {
    setupMocks()
    const wrapper = await mountPage()

    expect(wrapper.text()).toContain('Sensor History')
  })

  it('renders AI insights button', async () => {
    setupMocks()
    const wrapper = await mountPage()

    const aiBtn = wrapper.findComponent({ name: 'AIInsightsButton' })
    expect(aiBtn.exists()).toBe(true)
  })
})
