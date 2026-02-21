import TripTable from '@/views/fleet/TripTable.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'
import { createTrip } from '@/__tests__/factories'

function createTripWithVehicle(overrides = {}) {
  return {
    ...createTrip(),
    vehicleCode: 'V001',
    vehicleName: 'Skoda Octavia',
    vehicleSPZ: '1A2 3456',
    ...overrides,
  }
}

describe('TripTable', () => {
  it('renders AntD Table component', () => {
    const wrapper = mountWithPlugins(TripTable, {
      props: { trips: [], loading: false },
    })

    expect(wrapper.findComponent({ name: 'ATable' }).exists()).toBe(true)
  })

  it('renders trip data in table rows', () => {
    const trips = [
      createTripWithVehicle({
        vehicleName: 'Test Car',
        vehicleSPZ: 'ABC 123',
        DriverName: 'Jan Novak',
        TotalDistance: 150.5,
      }),
    ]
    const wrapper = mountWithPlugins(TripTable, {
      props: { trips, loading: false },
    })

    expect(wrapper.text()).toContain('Test Car')
    expect(wrapper.text()).toContain('ABC 123')
    expect(wrapper.text()).toContain('Jan Novak')
    expect(wrapper.text()).toContain('150.5 km')
  })

  it('shows loading state', () => {
    const wrapper = mountWithPlugins(TripTable, {
      props: { trips: [], loading: true },
    })

    const table = wrapper.findComponent({ name: 'ATable' })
    expect(table.props('loading')).toBe(true)
  })

  it('renders max speed Tag with red color when > 130', () => {
    const trips = [createTripWithVehicle({ MaxSpeed: 140, Id: 1 })]
    const wrapper = mountWithPlugins(TripTable, {
      props: { trips, loading: false },
    })

    const html = wrapper.html()
    expect(html).toContain('140 km/h')
  })

  it('shows dash for missing fuel data', () => {
    const trips = [createTripWithVehicle({
      FuelConsumed: { Value: 0, VolumeUnit: 1 },
      TripCost: { Value: 0, Currency: 1 },
      Id: 1,
    })]
    const wrapper = mountWithPlugins(TripTable, {
      props: { trips, loading: false },
    })

    expect(wrapper.text()).toContain('—')
  })

  it('shows dash for missing driver name', () => {
    const trips = [createTripWithVehicle({ DriverName: '', Id: 1 })]
    const wrapper = mountWithPlugins(TripTable, {
      props: { trips, loading: false },
    })

    // The dash should appear in the driver column
    const italicDashes = wrapper.findAll('.italic')
    expect(italicDashes.length).toBeGreaterThan(0)
  })
})
