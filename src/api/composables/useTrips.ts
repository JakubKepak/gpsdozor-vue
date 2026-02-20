import { computed, type MaybeRef, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/client'
import { vehicleKeys } from '@/api/queryKeys'
import type { Trip } from '@/types/api'

export function useTrips(
  vehicleCode: MaybeRef<string>,
  from: MaybeRef<string>,
  to: MaybeRef<string>,
  refetchInterval?: MaybeRef<number | undefined>,
) {
  return useQuery({
    queryKey: computed(() => vehicleKeys.trips(toValue(vehicleCode), toValue(from), toValue(to))),
    queryFn: () =>
      apiGet<Trip[]>(`/vehicle/${toValue(vehicleCode)}/trips?from=${toValue(from)}&to=${toValue(to)}`),
    enabled: computed(() => !!toValue(vehicleCode) && !!toValue(from) && !!toValue(to)),
    refetchInterval: computed(() => toValue(refetchInterval) ?? false),
  })
}
