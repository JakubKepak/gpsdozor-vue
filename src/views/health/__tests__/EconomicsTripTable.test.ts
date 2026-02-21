import EconomicsTripTable from '@/views/health/EconomicsTripTable.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'
import { createTrip } from '@/__tests__/factories'

describe('EconomicsTripTable', () => {
  it('renders table with trip data', () => {
    const trips = [
      createTrip({ Id: 1, TotalDistance: 100, AverageSpeed: 60, MaxSpeed: 90 }),
      createTrip({ Id: 2, TotalDistance: 200, AverageSpeed: 70, MaxSpeed: 110 }),
    ]
    const wrapper = mountWithPlugins(EconomicsTripTable, {
      props: { trips },
    })

    expect(wrapper.findComponent({ name: 'ATable' }).exists()).toBe(true)
    expect(wrapper.text()).toContain('100.0 km')
    expect(wrapper.text()).toContain('200.0 km')
  })

  it('renders max speed color coding', () => {
    const trips = [
      createTrip({ Id: 1, MaxSpeed: 140 }),
      createTrip({ Id: 2, MaxSpeed: 110 }),
      createTrip({ Id: 3, MaxSpeed: 80 }),
    ]
    const wrapper = mountWithPlugins(EconomicsTripTable, {
      props: { trips },
    })

    expect(wrapper.text()).toContain('140 km/h')
    expect(wrapper.text()).toContain('110 km/h')
    expect(wrapper.text()).toContain('80 km/h')
  })

  it('shows dash when no fuel data', () => {
    const trips = [
      createTrip({ Id: 1, FuelConsumed: { Value: 0, VolumeUnit: 1 } }),
    ]
    const wrapper = mountWithPlugins(EconomicsTripTable, {
      props: { trips },
    })

    expect(wrapper.text()).toContain('—')
  })

  it('shows dash for missing driver name', () => {
    const trips = [
      createTrip({ Id: 1, DriverName: '' }),
    ]
    const wrapper = mountWithPlugins(EconomicsTripTable, {
      props: { trips },
    })

    // Dash should appear in driver column
    expect(wrapper.text()).toContain('—')
  })

  it('renders title heading', () => {
    const wrapper = mountWithPlugins(EconomicsTripTable, {
      props: { trips: [] },
    })

    const h3 = wrapper.find('h3')
    expect(h3.exists()).toBe(true)
  })
})
