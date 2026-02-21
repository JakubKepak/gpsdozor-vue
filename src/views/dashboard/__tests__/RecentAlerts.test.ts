import RecentAlerts from '@/views/dashboard/RecentAlerts.vue'
import { mountWithPlugins } from '@/__tests__/mount-helpers'
import { createVehicle } from '@/__tests__/factories'

describe('RecentAlerts', () => {
  it('shows empty state when no alerts are generated', () => {
    const vehicles = [
      createVehicle({ Speed: 80, IsActive: true }),
    ]
    const wrapper = mountWithPlugins(RecentAlerts, { props: { vehicles } })

    // No speeding (<=120), active, not idle — should show empty
    expect(wrapper.text()).toContain('No active alerts')
  })

  it('generates speeding alert when speed > 120 and timestamp is fresh', () => {
    const vehicles = [
      createVehicle({
        Name: 'Fast Car',
        Speed: 140,
        IsActive: true,
        LastPositionTimestamp: new Date().toISOString(),
      }),
    ]
    const wrapper = mountWithPlugins(RecentAlerts, { props: { vehicles } })

    expect(wrapper.text()).toContain('Fast Car')
    expect(wrapper.text()).toContain('Speeding detected')
  })

  it('generates offline alert when IsActive=false', () => {
    const vehicles = [
      createVehicle({
        Name: 'Offline Car',
        Speed: 0,
        IsActive: false,
        LastPositionTimestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      }),
    ]
    const wrapper = mountWithPlugins(RecentAlerts, { props: { vehicles } })

    expect(wrapper.text()).toContain('Offline Car')
    expect(wrapper.text()).toContain('Vehicle offline')
  })

  it('generates idle alert when speed=0, IsActive=true, and idle > 2 hours', () => {
    const vehicles = [
      createVehicle({
        Name: 'Idle Car',
        Speed: 0,
        IsActive: true,
        LastPositionTimestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      }),
    ]
    const wrapper = mountWithPlugins(RecentAlerts, { props: { vehicles } })

    expect(wrapper.text()).toContain('Idle Car')
    expect(wrapper.text()).toContain('Idle for')
  })

  it('does NOT generate idle alert when idle < 2 hours', () => {
    const vehicles = [
      createVehicle({
        Name: 'Parked Car',
        Speed: 0,
        IsActive: true,
        // 1 hour ago — still under 2h idle threshold
        LastPositionTimestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      }),
    ]
    const wrapper = mountWithPlugins(RecentAlerts, { props: { vehicles } })

    // Speed is 0 but getEffectiveSpeed returns 0 (stale >5min), but hoursSince <2
    // Note: getEffectiveSpeed uses 5-minute threshold, this is 1 hour old so returns 0
    // But hoursSince = 1 < 2, so no idle alert
    expect(wrapper.text()).not.toContain('Idle for')
  })

  it('limits alerts to maximum 5', () => {
    const vehicles = Array.from({ length: 10 }, (_, i) =>
      createVehicle({
        Name: `Car ${i}`,
        Speed: 150,
        IsActive: true,
        LastPositionTimestamp: new Date().toISOString(),
      }),
    )
    const wrapper = mountWithPlugins(RecentAlerts, { props: { vehicles } })

    // Each vehicle generates a speeding alert, but only 5 should show
    const alertItems = wrapper.findAll('.border-l-3')
    expect(alertItems).toHaveLength(5)
  })
})
