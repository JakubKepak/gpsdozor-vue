<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { GoogleMap } from 'vue3-google-map'
import { EnvironmentOutlined } from '@ant-design/icons-vue'
import VehicleMarker from '@/components/VehicleMarker.vue'
import type { Vehicle } from '@/types/api'
import { getEffectiveSpeed } from '@/utils/vehicle'

const { vehicles, focusedVehicleCode = null } = defineProps<{
  vehicles: Vehicle[]
  focusedVehicleCode?: string | null
}>()

const emit = defineEmits<{
  focusHandled: []
}>()

const { t } = useI18n()

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null)
const selectedCode = ref<string | null>(null)
const hasFitted = ref(false)

const center = { lat: 50.08, lng: 14.43 }

// Fit bounds on first load
watch(
  () => mapRef.value?.ready,
  (ready) => {
    if (!ready || hasFitted.value || vehicles.length === 0) return
    const map = mapRef.value?.map
    if (!map) return

    const bounds = new google.maps.LatLngBounds()
    let hasValid = false
    for (const v of vehicles) {
      const lat = parseFloat(v.LastPosition.Latitude)
      const lng = parseFloat(v.LastPosition.Longitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        bounds.extend({ lat, lng })
        hasValid = true
      }
    }
    if (hasValid) {
      map.fitBounds(bounds, 50)
      hasFitted.value = true
    }
  },
)

// Focus vehicle when requested
watch(
  () => focusedVehicleCode,
  (code) => {
    if (!code) return
    const vehicle = vehicles.find((v) => v.Code === code)
    if (!vehicle) return

    const lat = parseFloat(vehicle.LastPosition.Latitude)
    const lng = parseFloat(vehicle.LastPosition.Longitude)
    if (isNaN(lat) || isNaN(lng)) return

    const map = mapRef.value?.map
    if (map) {
      map.panTo({ lat, lng })
      map.setZoom(14)
    }
    selectedCode.value = code
    emit('focusHandled')
  },
)

function onMarkerSelect(code: string | null) {
  selectedCode.value = code
}

const activeCount = computed(() => vehicles.filter((v) => getEffectiveSpeed(v) > 0).length)
const idleCount = computed(
  () => vehicles.filter((v) => getEffectiveSpeed(v) === 0 && v.IsActive).length,
)
</script>

<template>
  <!-- Placeholder when no API key -->
  <div
    v-if="!MAPS_API_KEY"
    class="h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex flex-col items-center justify-center text-center p-6"
  >
    <EnvironmentOutlined class="text-4xl text-blue-300 mb-3" />
    <div class="text-gray-600 font-medium">
      {{ t('map.placeholder') }}
    </div>
    <div class="text-gray-400 text-sm mt-1">
      {{ t('map.placeholderHint') }}
    </div>
    <div class="flex gap-4 mt-4 text-xs">
      <div class="flex items-center gap-1.5">
        <div class="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span class="text-gray-500">{{ t('map.activeCount', { count: activeCount }) }}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2.5 h-2.5 rounded-full bg-amber-500" />
        <span class="text-gray-500">{{ t('map.idleCount', { count: idleCount }) }}</span>
      </div>
    </div>
  </div>

  <!-- Google Map -->
  <div
    v-else
    class="h-full relative"
  >
    <GoogleMap
      ref="mapRef"
      :api-key="MAPS_API_KEY"
      :center="center"
      :zoom="6"
      class="w-full h-full rounded-lg"
      :gesture-handling="'greedy'"
      :disable-default-ui="true"
      :zoom-control="true"
    >
      <VehicleMarker
        v-for="v in vehicles"
        :key="v.Code"
        :vehicle="v"
        :selected="selectedCode === v.Code"
        @select="onMarkerSelect"
      />
    </GoogleMap>

    <!-- Legend -->
    <div class="absolute top-4 right-4 bg-white rounded-lg shadow-md px-3 py-2.5 text-xs">
      <div class="font-medium text-gray-700 mb-1.5">
        {{ t('map.legend') }}
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span class="text-gray-600">{{ t('map.active') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span class="text-gray-600">{{ t('map.idleParked') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span class="text-gray-600">{{ t('map.offline') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
