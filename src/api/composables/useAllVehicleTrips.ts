import { computed, type MaybeRef, toValue } from 'vue'
import { useQueries } from '@tanstack/vue-query'
import { apiGet } from '@/api/client'
import { vehicleKeys } from '@/api/queryKeys'
import type { Vehicle, Trip } from '@/types/api'

export type TripWithVehicle = Trip & {
  vehicleCode: string
  vehicleName: string
  vehicleSPZ: string
}

export function useAllVehicleTrips(
  vehicles: MaybeRef<Vehicle[]>,
  from: MaybeRef<string>,
  to: MaybeRef<string>,
) {
  return useQueries({
    queries: computed(() =>
      toValue(vehicles).map((v) => ({
        queryKey: vehicleKeys.trips(v.Code, toValue(from), toValue(to)),
        queryFn: () =>
          apiGet<Trip[]>(`/vehicle/${v.Code}/trips?from=${toValue(from)}&to=${toValue(to)}`),
        enabled: !!toValue(from) && !!toValue(to),
      })),
    ),
    combine: (results) => {
      const vList = toValue(vehicles)
      const allTrips: TripWithVehicle[] = []
      results.forEach((result, i) => {
        if (result.data) {
          result.data.forEach((trip) => {
            allTrips.push({
              ...trip,
              vehicleCode: vList[i].Code,
              vehicleName: vList[i].Name,
              vehicleSPZ: vList[i].SPZ,
            })
          })
        }
      })
      return {
        data: allTrips,
        isLoading: results.some((r) => r.isLoading),
        error: results.find((r) => r.error)?.error ?? null,
      }
    },
  })
}
