import { computeVehicleEconomics, computeDailyFuel } from '@/views/health/computeVehicleEconomics'
import { createVehicle, createTrip } from '@/__tests__/factories'

describe('computeVehicleEconomics', () => {
  it('returns correct totals for a list of trips', () => {
    const vehicle = createVehicle()
    const trips = [
      createTrip({ TotalDistance: 100, FuelConsumed: { Value: 7, VolumeUnit: 1 }, TripCost: { Value: 280, Currency: 1 }, AverageSpeed: 60, MaxSpeed: 90 }),
      createTrip({ TotalDistance: 150, FuelConsumed: { Value: 10, VolumeUnit: 1 }, TripCost: { Value: 400, Currency: 1 }, AverageSpeed: 70, MaxSpeed: 120 }),
      createTrip({ TotalDistance: 50, FuelConsumed: { Value: 4, VolumeUnit: 1 }, TripCost: { Value: 160, Currency: 1 }, AverageSpeed: 40, MaxSpeed: 80 }),
    ]

    const result = computeVehicleEconomics(vehicle, trips)

    expect(result.totalTrips).toBe(3)
    expect(result.totalDistance).toBe(300)
    expect(result.totalFuel).toBe(21)
    expect(result.totalCost).toBe(840)
    expect(result.fuelPer100km).toBeCloseTo(7)
    expect(result.costPerKm).toBeCloseTo(2.8)
    expect(result.avgSpeed).toBe(57) // Math.round((60+70+40)/3)
    expect(result.maxSpeed).toBe(120)
  })

  it('returns zero aggregates for empty trips array', () => {
    const vehicle = createVehicle()
    const result = computeVehicleEconomics(vehicle, [])

    expect(result.totalTrips).toBe(0)
    expect(result.totalDistance).toBe(0)
    expect(result.totalFuel).toBe(0)
    expect(result.totalCost).toBe(0)
    expect(result.fuelPer100km).toBe(0)
    expect(result.avgSpeed).toBe(0)
    expect(result.maxSpeed).toBe(0)
    expect(result.hasFuelData).toBe(false)
  })

  it('collects unique driver names, trimming whitespace', () => {
    const vehicle = createVehicle()
    const trips = [
      createTrip({ DriverName: 'Jan Novak' }),
      createTrip({ DriverName: ' Jan Novak ' }),
      createTrip({ DriverName: 'Petr Svoboda' }),
      createTrip({ DriverName: '' }),
    ]

    const result = computeVehicleEconomics(vehicle, trips)
    expect(result.drivers).toEqual(expect.arrayContaining(['Jan Novak', 'Petr Svoboda']))
    expect(result.drivers).toHaveLength(2)
  })

  it('handles NaN and null values via safeNum', () => {
    const vehicle = createVehicle()
    const trips = [
      createTrip({
        TotalDistance: NaN,
        FuelConsumed: { Value: NaN, VolumeUnit: 1 },
        TripCost: { Value: NaN, Currency: 1 },
        AverageSpeed: NaN,
        MaxSpeed: NaN,
      }),
    ]

    const result = computeVehicleEconomics(vehicle, trips)
    expect(result.totalDistance).toBe(0)
    expect(result.totalFuel).toBe(0)
    expect(result.totalCost).toBe(0)
    expect(result.avgSpeed).toBe(0)
    expect(result.maxSpeed).toBe(0)
    expect(Number.isFinite(result.fuelPer100km)).toBe(true)
  })

  it('sets hasFuelData=false when no trip has fuel > 0', () => {
    const vehicle = createVehicle()
    const trips = [
      createTrip({ FuelConsumed: { Value: 0, VolumeUnit: 1 } }),
      createTrip({ FuelConsumed: { Value: 0, VolumeUnit: 1 } }),
    ]

    const result = computeVehicleEconomics(vehicle, trips)
    expect(result.hasFuelData).toBe(false)
    expect(result.fuelPer100km).toBe(0)
  })

  it('sets hasFuelData=true when at least one trip has fuel > 0', () => {
    const vehicle = createVehicle()
    const trips = [
      createTrip({ FuelConsumed: { Value: 0, VolumeUnit: 1 } }),
      createTrip({ FuelConsumed: { Value: 5, VolumeUnit: 1 } }),
    ]

    const result = computeVehicleEconomics(vehicle, trips)
    expect(result.hasFuelData).toBe(true)
  })

  it('returns vehicle metadata from the vehicle object', () => {
    const vehicle = createVehicle({
      Code: 'V999',
      Name: 'Test Car',
      SPZ: '9Z9 9999',
      BranchName: 'Brno',
    })

    const result = computeVehicleEconomics(vehicle, [])
    expect(result.vehicleCode).toBe('V999')
    expect(result.vehicleName).toBe('Test Car')
    expect(result.vehicleSPZ).toBe('9Z9 9999')
    expect(result.branchName).toBe('Brno')
  })

  it('handles fuelPer100km=0 when totalDistance is 0', () => {
    const vehicle = createVehicle()
    const trips = [
      createTrip({ TotalDistance: 0, FuelConsumed: { Value: 5, VolumeUnit: 1 } }),
    ]

    const result = computeVehicleEconomics(vehicle, trips)
    expect(result.fuelPer100km).toBe(0)
  })
})

describe('computeDailyFuel', () => {
  it('groups trips by date and returns sorted daily metrics', () => {
    const trips = [
      createTrip({ StartTime: '2025-01-16T10:00:00', TotalDistance: 80, FuelConsumed: { Value: 6, VolumeUnit: 1 }, TripCost: { Value: 240, Currency: 1 } }),
      createTrip({ StartTime: '2025-01-15T08:00:00', TotalDistance: 100, FuelConsumed: { Value: 7, VolumeUnit: 1 }, TripCost: { Value: 280, Currency: 1 } }),
      createTrip({ StartTime: '2025-01-15T14:00:00', TotalDistance: 50, FuelConsumed: { Value: 4, VolumeUnit: 1 }, TripCost: { Value: 160, Currency: 1 } }),
      createTrip({ StartTime: '2025-01-16T16:00:00', TotalDistance: 120, FuelConsumed: { Value: 9, VolumeUnit: 1 }, TripCost: { Value: 360, Currency: 1 } }),
    ]

    const result = computeDailyFuel(trips)

    expect(result).toHaveLength(2)
    // Sorted by date
    expect(result[0].date).toBe('2025-01-15')
    expect(result[1].date).toBe('2025-01-16')

    // Day 1: 2 trips, 150 km, 11 L, 440 CZK
    expect(result[0].trips).toBe(2)
    expect(result[0].distance).toBe(150)
    expect(result[0].fuel).toBe(11)
    expect(result[0].cost).toBe(440)

    // Day 2: 2 trips, 200 km, 15 L, 600 CZK
    expect(result[1].trips).toBe(2)
    expect(result[1].distance).toBe(200)
    expect(result[1].fuel).toBe(15)
    expect(result[1].cost).toBe(600)
  })

  it('calculates daily efficiency as L/100km correctly', () => {
    const trips = [
      createTrip({ StartTime: '2025-01-15T08:00:00', TotalDistance: 100, FuelConsumed: { Value: 10, VolumeUnit: 1 } }),
    ]

    const result = computeDailyFuel(trips)
    expect(result[0].efficiency).toBe(10) // 10L / 100km * 100 = 10
  })

  it('returns empty array for empty trips', () => {
    expect(computeDailyFuel([])).toEqual([])
  })

  it('sets efficiency=0 when no fuel data', () => {
    const trips = [
      createTrip({ StartTime: '2025-01-15T08:00:00', TotalDistance: 100, FuelConsumed: { Value: 0, VolumeUnit: 1 } }),
    ]

    const result = computeDailyFuel(trips)
    expect(result[0].efficiency).toBe(0)
  })

  it('calculates fuelDistance only from trips with fuel > 0', () => {
    const trips = [
      createTrip({ StartTime: '2025-01-15T08:00:00', TotalDistance: 100, FuelConsumed: { Value: 8, VolumeUnit: 1 } }),
      createTrip({ StartTime: '2025-01-15T14:00:00', TotalDistance: 50, FuelConsumed: { Value: 0, VolumeUnit: 1 } }),
    ]

    const result = computeDailyFuel(trips)
    // Efficiency = 8 / 100 * 100 = 8 (only fuelDistance=100 counted, not 150)
    expect(result[0].efficiency).toBe(8)
    expect(result[0].distance).toBe(150) // total distance includes all trips
  })
})
