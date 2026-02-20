import { computed, type MaybeRef, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/client'
import { vehicleKeys } from '@/api/queryKeys'
import type { SensorResponse } from '@/types/api'

export function useVehicleSensors(
  vehicleCode: MaybeRef<string>,
  sensorTypes: MaybeRef<string[]>,
  from: MaybeRef<string>,
  to: MaybeRef<string>,
) {
  return useQuery({
    queryKey: computed(() =>
      vehicleKeys.sensors(toValue(vehicleCode), toValue(sensorTypes), toValue(from), toValue(to)),
    ),
    queryFn: () =>
      apiGet<SensorResponse>(
        `/vehicle/${toValue(vehicleCode)}/sensors/${toValue(sensorTypes).join(',')}?from=${toValue(from)}&to=${toValue(to)}`,
      ),
    enabled: computed(
      () =>
        !!toValue(vehicleCode) &&
        toValue(sensorTypes).length > 0 &&
        !!toValue(from) &&
        !!toValue(to),
    ),
  })
}
