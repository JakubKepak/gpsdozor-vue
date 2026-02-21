import { useQueryClient } from '@tanstack/vue-query'
import { vehicleKeys, groupKeys } from '@/api/queryKeys'
import type { Vehicle, Group, Trip, EcoDrivingEvent } from '@/types/api'
import { EcoDrivingEventType } from '@/types/api'

export function useFleetContext(): () => string {
  const queryClient = useQueryClient()

  return () => {
    const groups = queryClient.getQueryData<Group[]>(groupKeys.all)
    const groupCode = groups?.[0]?.Code ?? ''
    const vehicles = queryClient.getQueryData<Vehicle[]>(vehicleKeys.byGroup(groupCode))

    if (!vehicles || vehicles.length === 0) {
      return 'No fleet data available yet.'
    }

    const active = vehicles.filter((v) => v.Speed > 0)
    const inactive = vehicles.filter((v) => !v.IsActive)

    const sections: string[] = [
      `Fleet: ${vehicles.length} vehicles, ${active.length} moving, ${inactive.length} inactive.`,
      '',
      'Vehicles:',
      ...vehicles.map(
        (v) =>
          `- ${v.Name} (SPZ: ${v.SPZ}, Code: ${v.Code}, Branch: ${v.BranchName}, Odometer: ${(v.Odometer / 1000).toFixed(0)}k km, Speed: ${v.Speed} km/h, Active: ${v.IsActive}, EcoDriving: ${v.IsEcoDrivingEnabled})`,
      ),
    ]

    const allTrips: (Trip & { vehicleName: string })[] = []
    const allEcoEvents: { vehicleName: string; events: EcoDrivingEvent[] }[] = []
    const cache = queryClient.getQueryCache().getAll()
    for (const query of cache) {
      const key = query.queryKey
      if (Array.isArray(key) && key[0] === 'vehicles' && key[2] === 'trips' && query.state.data) {
        const vehicleCode = key[1] as string
        const vehicle = vehicles.find((v) => v.Code === vehicleCode)
        const trips = query.state.data as Trip[]
        for (const trip of trips) {
          allTrips.push({ ...trip, vehicleName: vehicle?.Name ?? vehicleCode })
        }
      }
      if (Array.isArray(key) && key[0] === 'vehicles' && key[2] === 'eco-driving' && query.state.data) {
        const vehicleCode = key[1] as string
        const vehicle = vehicles.find((v) => v.Code === vehicleCode)
        const events = query.state.data as EcoDrivingEvent[]
        if (events.length > 0) {
          allEcoEvents.push({ vehicleName: vehicle?.Name ?? vehicleCode, events })
        }
      }
    }

    if (allTrips.length > 0) {
      const driverMap = new Map<
        string,
        { trips: number; totalDist: number; maxSpeed: number; totalFuel: number }
      >()
      for (const trip of allTrips) {
        const name = trip.DriverName || 'Unknown'
        const existing = driverMap.get(name) ?? {
          trips: 0,
          totalDist: 0,
          maxSpeed: 0,
          totalFuel: 0,
        }
        existing.trips++
        existing.totalDist += trip.TotalDistance
        existing.maxSpeed = Math.max(existing.maxSpeed, trip.MaxSpeed)
        existing.totalFuel += trip.FuelConsumed?.Value ?? 0
        driverMap.set(name, existing)
      }

      sections.push(
        '',
        `Trips (${allTrips.length} total):`,
        ...Array.from(driverMap.entries()).map(
          ([name, s]) =>
            `- Driver "${name}": ${s.trips} trips, ${(s.totalDist / 1000).toFixed(0)} km, max speed ${s.maxSpeed} km/h, fuel ${s.totalFuel.toFixed(1)} L`,
        ),
      )

      const totalFuel = allTrips.reduce((sum, t) => sum + (t.FuelConsumed?.Value ?? 0), 0)
      const totalDist = allTrips.reduce((sum, t) => sum + t.TotalDistance, 0)
      const totalCost = allTrips.reduce((sum, t) => sum + (t.TripCost?.Value ?? 0), 0)
      if (totalFuel > 0) {
        sections.push(
          '',
          'Fuel summary:',
          `- Total consumption: ${totalFuel.toFixed(1)} L`,
          `- Total distance: ${(totalDist / 1000).toFixed(0)} km`,
          `- Average consumption: ${totalDist > 0 ? ((totalFuel / (totalDist / 1000)) * 100).toFixed(1) : '?'} L/100km`,
          `- Total cost: ${totalCost.toFixed(0)} CZK`,
        )
      }
    }

    if (allEcoEvents.length > 0) {
      sections.push('', 'Eco-driving events:')
      for (const { vehicleName, events } of allEcoEvents) {
        const byType: Record<string, number> = {}
        let high = 0, medium = 0, low = 0
        for (const e of events) {
          const name = EcoDrivingEventType[e.EventType] ?? 'Unknown'
          byType[name] = (byType[name] ?? 0) + 1
          if (e.EventSeverity === 3) high++
          else if (e.EventSeverity === 2) medium++
          else if (e.EventSeverity === 1) low++
        }
        const typeSummary = Object.entries(byType).map(([t, c]) => `${t}: ${c}`).join(', ')
        sections.push(
          `- ${vehicleName}: ${events.length} events (high: ${high}, medium: ${medium}, low: ${low}) — ${typeSummary}`,
        )
      }
    }

    return sections.join('\n')
  }
}
