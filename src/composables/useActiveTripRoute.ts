import { computed, type MaybeRef, toValue } from 'vue'
import dayjs from 'dayjs'
import { useTrips, usePositionHistory } from '@/api/composables'
import type { Trip } from '@/types/api'

export function useActiveTripRoute(vehicleCode: MaybeRef<string | null>) {
  const startOfDay = dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss')
  const endOfDay = dayjs().endOf('day').format('YYYY-MM-DDTHH:mm:ss')

  const code = computed(() => toValue(vehicleCode) ?? '')

  const { data: trips } = useTrips(
    code,
    startOfDay,
    endOfDay,
    computed(() => (code.value ? 30_000 : undefined)),
  )

  const activeTrip = computed((): Trip | null => {
    if (!trips.value?.length) return null
    const unfinished = trips.value.find((t) => !t.IsFinished)
    if (unfinished) return unfinished
    return trips.value[trips.value.length - 1]
  })

  const posVehicleCodes = computed(() => (code.value ? [code.value] : []))
  const posFrom = computed(() => activeTrip.value?.StartTime ?? '')

  const { data: positions } = usePositionHistory(
    posVehicleCodes,
    posFrom,
    endOfDay,
    computed(() => (activeTrip.value && !activeTrip.value.IsFinished ? 15_000 : undefined)),
  )

  return {
    activeTrip,
    positions: computed(() => positions.value ?? []),
  }
}
