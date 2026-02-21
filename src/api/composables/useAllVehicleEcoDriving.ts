import { computed, type MaybeRef, toValue } from 'vue'
import { useQueries } from '@tanstack/vue-query'
import { apiGet } from '@/api/client'
import { vehicleKeys } from '@/api/queryKeys'
import type { Vehicle, EcoDrivingEvent } from '@/types/api'
import type { EcoEventWithVehicle } from '@/views/eco-driving/constants'

export type { EcoEventWithVehicle } from '@/views/eco-driving/constants'

export function useAllVehicleEcoDriving(
  vehicles: MaybeRef<Vehicle[]>,
  from: MaybeRef<string>,
  to: MaybeRef<string>,
) {
  return useQueries({
    queries: computed(() =>
      toValue(vehicles).map((v) => ({
        queryKey: vehicleKeys.ecoDriving(v.Code, toValue(from), toValue(to)),
        queryFn: () => {
          const code = encodeURIComponent(v.Code)
          const params = new URLSearchParams({
            from: toValue(from),
            to: toValue(to),
          })
          return apiGet<EcoDrivingEvent[]>(`/vehicle/${code}/eco-driving-events?${params}`)
        },
        enabled: !!toValue(from) && !!toValue(to) && v.IsEcoDrivingEnabled,
        retry: 1,
      })),
    ),
    combine: (results) => {
      const vList = toValue(vehicles)
      const allEvents: EcoEventWithVehicle[] = []
      results.forEach((result, i) => {
        if (result.data) {
          result.data.forEach((event) => {
            allEvents.push({
              ...event,
              vehicleCode: vList[i].Code,
              vehicleName: vList[i].Name,
              vehicleSPZ: vList[i].SPZ,
            })
          })
        }
      })
      return {
        data: allEvents,
        isLoading: results.some((r) => r.isLoading),
        error: results.find((r) => r.error)?.error ?? null,
      }
    },
  })
}
