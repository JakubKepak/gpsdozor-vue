<script setup lang="ts">
import { ref, computed } from 'vue'
import { CustomMarker, InfoWindow } from 'vue3-google-map'
import type { Vehicle } from '@/types/api'
import { getEffectiveSpeed } from '@/utils/vehicle'

const { vehicle, selected = false } = defineProps<{
  vehicle: Vehicle
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [code: string | null]
}>()

const markerRef = ref()

const lat = computed(() => parseFloat(vehicle.LastPosition.Latitude))
const lng = computed(() => parseFloat(vehicle.LastPosition.Longitude))
const speed = computed(() => getEffectiveSpeed(vehicle))

const color = computed(() => {
  if (speed.value > 0) return '#22c55e'
  if (vehicle.IsActive) return '#f59e0b'
  return '#9ca3af'
})

const statusLabel = computed(() => {
  if (speed.value > 0) return `${speed.value} km/h`
  if (vehicle.IsActive) return 'Parked'
  return 'Offline'
})

const infoWindowOptions = computed(() => ({
  position: { lat: lat.value, lng: lng.value },
  pixelOffset: new google.maps.Size(0, -20),
}))
</script>

<template>
  <CustomMarker
    ref="markerRef"
    :options="{ position: { lat, lng }, anchorPoint: 'BOTTOM_CENTER' }"
    @click="emit('select', vehicle.Code)"
  >
    <div class="flex flex-col items-center cursor-pointer">
      <div
        class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md"
        :style="{ backgroundColor: color }"
      />
    </div>
  </CustomMarker>

  <InfoWindow
    v-if="selected"
    :options="infoWindowOptions"
    @close-click="emit('select', null)"
  >
    <div class="vehicle-popover relative min-w-35 pr-6">
      <button
        class="absolute -top-0.5 right-0 flex items-center justify-center w-5 h-5 rounded-full bg-transparent border-0 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs leading-none"
        aria-label="Close"
        @click="emit('select', null)"
      >
        ✕
      </button>
      <div class="font-semibold text-sm">
        {{ vehicle.Name }}
      </div>
      <div class="text-xs text-gray-400 mt-0.5">
        {{ vehicle.SPZ }}
      </div>
      <div class="flex items-center gap-1.5 mt-1.5">
        <div
          class="w-2.5 h-2.5 rounded-full shrink-0"
          :style="{ backgroundColor: color }"
        />
        <span class="text-xs text-gray-600">{{ statusLabel }}</span>
      </div>
      <div class="text-xs text-gray-400 mt-1">
        {{ vehicle.BranchName }}
      </div>
    </div>
  </InfoWindow>
</template>
