import { computed, type MaybeRef, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/client'
import { vehicleKeys } from '@/api/queryKeys'
import type { Vehicle } from '@/types/api'

export function useVehicle(vehicleCode: MaybeRef<string>) {
  return useQuery({
    queryKey: computed(() => vehicleKeys.detail(toValue(vehicleCode))),
    queryFn: () => apiGet<Vehicle>(`/vehicle/${toValue(vehicleCode)}`),
    enabled: computed(() => !!toValue(vehicleCode)),
  })
}
