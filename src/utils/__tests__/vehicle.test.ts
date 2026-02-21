import { getEffectiveSpeed } from '@/utils/vehicle'
import { createVehicle } from '@/__tests__/factories'

describe('getEffectiveSpeed', () => {
  it('returns vehicle Speed when LastPositionTimestamp is within 5 minutes', () => {
    const vehicle = createVehicle({
      Speed: 80,
      LastPositionTimestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    })
    expect(getEffectiveSpeed(vehicle)).toBe(80)
  })

  it('returns Speed when timestamp is exactly now', () => {
    const vehicle = createVehicle({
      Speed: 120,
      LastPositionTimestamp: new Date().toISOString(),
    })
    expect(getEffectiveSpeed(vehicle)).toBe(120)
  })

  it('returns 0 when LastPositionTimestamp is older than 5 minutes', () => {
    const vehicle = createVehicle({
      Speed: 100,
      LastPositionTimestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    })
    expect(getEffectiveSpeed(vehicle)).toBe(0)
  })

  it('returns 0 when LastPositionTimestamp is exactly at the stale threshold', () => {
    const threshold = 5 * 60 * 1000
    const vehicle = createVehicle({
      Speed: 80,
      LastPositionTimestamp: new Date(Date.now() - threshold - 1).toISOString(),
    })
    expect(getEffectiveSpeed(vehicle)).toBe(0)
  })

  it('returns 0 when LastPositionTimestamp is an invalid date string', () => {
    const vehicle = createVehicle({
      Speed: 50,
      LastPositionTimestamp: 'invalid-date',
    })
    expect(getEffectiveSpeed(vehicle)).toBe(0)
  })

  it('returns 0 when LastPositionTimestamp is empty string', () => {
    const vehicle = createVehicle({
      Speed: 50,
      LastPositionTimestamp: '',
    })
    expect(getEffectiveSpeed(vehicle)).toBe(0)
  })

  it('returns 0 for Speed=0 even with fresh timestamp', () => {
    const vehicle = createVehicle({
      Speed: 0,
      LastPositionTimestamp: new Date().toISOString(),
    })
    expect(getEffectiveSpeed(vehicle)).toBe(0)
  })
})
