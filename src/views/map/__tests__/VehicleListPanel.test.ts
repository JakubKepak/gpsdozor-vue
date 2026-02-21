import VehicleListPanel from '@/views/map/VehicleListPanel.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'
import { createVehicle } from '@/__tests__/factories'

describe('VehicleListPanel', () => {
  it('shows expand button when collapsed', () => {
    const wrapper = mountWithPlugins(VehicleListPanel, {
      props: { vehicles: [], collapsed: true },
    })

    const expandBtn = wrapper.find('button[aria-label="Expand"]')
    expect(expandBtn.exists()).toBe(true)
  })

  it('shows panel with search and groups when expanded', () => {
    const vehicles = [createVehicle()]
    const wrapper = mountWithPlugins(VehicleListPanel, {
      props: { vehicles, collapsed: false },
    })

    expect(wrapper.text()).toContain('Driving')
    expect(wrapper.text()).toContain('Parked')
    expect(wrapper.text()).toContain('Offline')
  })

  it('groups vehicles by status', () => {
    const vehicles = [
      createVehicle({
        Code: 'V1',
        Name: 'Active Car',
        Speed: 80,
        IsActive: true,
        LastPositionTimestamp: new Date().toISOString(),
      }),
      createVehicle({
        Code: 'V2',
        Name: 'Parked Car',
        Speed: 0,
        IsActive: true,
        // Stale timestamp so getEffectiveSpeed returns 0
        LastPositionTimestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      }),
      createVehicle({
        Code: 'V3',
        Name: 'Offline Car',
        Speed: 0,
        IsActive: false,
        LastPositionTimestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      }),
    ]
    const wrapper = mountWithPlugins(VehicleListPanel, {
      props: { vehicles, collapsed: false },
    })

    // Driving group is open by default
    expect(wrapper.text()).toContain('Active Car')
  })

  it('filters vehicles by search query', async () => {
    const vehicles = [
      createVehicle({
        Code: 'V1',
        Name: 'Toyota Camry',
        SPZ: '1AB 1234',
        Speed: 60,
        IsActive: true,
        LastPositionTimestamp: new Date().toISOString(),
      }),
      createVehicle({
        Code: 'V2',
        Name: 'Skoda Octavia',
        SPZ: '2CD 5678',
        Speed: 80,
        IsActive: true,
        LastPositionTimestamp: new Date().toISOString(),
      }),
    ]
    const wrapper = mountWithPlugins(VehicleListPanel, {
      props: { vehicles, collapsed: false },
    })

    // Both visible initially
    expect(wrapper.text()).toContain('Toyota Camry')
    expect(wrapper.text()).toContain('Skoda Octavia')

    // Type search via native input element
    const input = wrapper.find('input')
    await input.setValue('Toyota')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Toyota Camry')
    expect(wrapper.text()).not.toContain('Skoda Octavia')
  })

  it('emits selectVehicle when vehicle is clicked', async () => {
    const vehicles = [
      createVehicle({
        Code: 'V1',
        Name: 'Test Vehicle',
        Speed: 60,
        IsActive: true,
        LastPositionTimestamp: new Date().toISOString(),
      }),
    ]
    const wrapper = mountWithPlugins(VehicleListPanel, {
      props: { vehicles, collapsed: false },
    })

    // Click on the vehicle button (within the driving group, which is open by default)
    const vehicleBtn = wrapper.findAll('button').find((b) => b.text().includes('Test Vehicle'))
    expect(vehicleBtn).toBeDefined()
    await vehicleBtn!.trigger('click')

    expect(wrapper.emitted('selectVehicle')).toBeTruthy()
    expect(wrapper.emitted('selectVehicle')![0]).toEqual(['V1'])
  })

  it('highlights selected vehicle', () => {
    const vehicles = [
      createVehicle({
        Code: 'V1',
        Name: 'Selected Car',
        Speed: 60,
        IsActive: true,
        LastPositionTimestamp: new Date().toISOString(),
      }),
    ]
    const wrapper = mountWithPlugins(VehicleListPanel, {
      props: { vehicles, collapsed: false, selectedCode: 'V1' },
    })

    const vehicleBtn = wrapper.findAll('button').find((b) => b.text().includes('Selected Car'))
    expect(vehicleBtn?.classes()).toContain('bg-blue-50')
  })
})
