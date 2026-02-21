import { computed, type MaybeRef, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/client'
import { vehicleKeys } from '@/api/queryKeys'
import type { EcoDrivingEvent } from '@/types/api'

export function useEcoDriving(
  vehicleCode: MaybeRef<string>,
  from: MaybeRef<string>,
  to: MaybeRef<string>,
  enabled: MaybeRef<boolean> = true,
) {
  return useQuery({
    queryKey: computed(() =>
      vehicleKeys.ecoDriving(toValue(vehicleCode), toValue(from), toValue(to)),
    ),
    queryFn: () => {
      const code = encodeURIComponent(toValue(vehicleCode))
      const params = new URLSearchParams({
        from: toValue(from),
        to: toValue(to),
      })
      return apiGet<EcoDrivingEvent[]>(`/vehicle/${code}/eco-driving-events?${params}`)
    },
    enabled: computed(
      () =>
        !!toValue(vehicleCode) && !!toValue(from) && !!toValue(to) && toValue(enabled),
    ),
    retry: 1,
  })
}
