import { computed, type MaybeRef, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/client'
import { vehicleKeys } from '@/api/queryKeys'
import type { Vehicle } from '@/types/api'

export function useVehicles(groupCode: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => vehicleKeys.byGroup(toValue(groupCode))),
    queryFn: () => apiGet<Vehicle[]>(`/vehicles/group/${toValue(groupCode)}`),
    enabled: computed(() => !!toValue(groupCode)),
    refetchInterval: 30_000,
  })
}
