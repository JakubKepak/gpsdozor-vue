import { computed, type MaybeRef, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/client'
import { vehicleKeys } from '@/api/queryKeys'
import type { PositionHistoryResponse } from '@/types/api'

export function usePositionHistory(
  vehicleCodes: MaybeRef<string[]>,
  from: MaybeRef<string>,
  to: MaybeRef<string>,
  refetchInterval?: number,
) {
  return useQuery({
    queryKey: computed(() =>
      vehicleKeys.positionHistory(toValue(vehicleCodes), toValue(from), toValue(to)),
    ),
    queryFn: async () => {
      const res = await apiGet<PositionHistoryResponse[]>(
        `/vehicles/history/${toValue(vehicleCodes).join(',')}?from=${toValue(from)}&to=${toValue(to)}`,
      )
      return res.flatMap(r => r.Positions)
    },
    enabled: computed(() => toValue(vehicleCodes).length > 0 && !!toValue(from) && !!toValue(to)),
    refetchInterval,
  })
}
