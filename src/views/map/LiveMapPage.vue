<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { GoogleMap, CustomMarker } from 'vue3-google-map'
import { EnvironmentOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { useGroups, useVehicles } from '@/api/composables'
import { useActiveTripRoute } from '@/composables/useActiveTripRoute'
import { useSpeedPolyline } from '@/composables/useSpeedPolyline'
import { useQueryParam } from '@/composables/useQueryParam'
import VehicleMarker from '@/components/VehicleMarker.vue'
import VehicleListPanel from '@/views/map/VehicleListPanel.vue'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

const { t } = useI18n()

// --- URL state ---
const { value: selectedCode, set: setSelectedCode } = useQueryParam('vehicle')

const panelCollapsed = ref(false)

// --- Data ---
const { data: groups } = useGroups()
const groupCode = computed(() => groups.value?.[0]?.Code ?? '')
const { data: vehicles } = useVehicles(groupCode)

const vehicleList = computed(() => vehicles.value ?? [])

// --- Trip route ---
const { activeTrip, positions } = useActiveTripRoute(selectedCode)

// --- Map ---
const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null)
const center = { lat: 50.08, lng: 14.43 }
const hasFitted = ref(false)

// Fit bounds on first load
watch(
  () => mapRef.value?.ready,
  (ready) => {
    if (!ready || hasFitted.value || vehicleList.value.length === 0 || selectedCode.value) return
    const map = mapRef.value?.map
    if (!map) return

    const bounds = new google.maps.LatLngBounds()
    let hasValid = false
    for (const v of vehicleList.value) {
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

// Focus on selected vehicle (watches all deps so it works on page reload too)
const prevFocusCode = ref('')
watch([selectedCode, vehicleList, () => mapRef.value?.ready], ([code, list, ready]) => {
  if (!code || !ready || code === prevFocusCode.value) return

  const vehicle = list.find((v) => v.Code === code)
  if (!vehicle) return

  prevFocusCode.value = code

  const lat = parseFloat(vehicle.LastPosition.Latitude)
  const lng = parseFloat(vehicle.LastPosition.Longitude)
  if (isNaN(lat) || isNaN(lng)) return

  const map = mapRef.value?.map
  if (map) {
    map.panTo({ lat, lng })
    map.setZoom(14)
  }
})

// Speed-colored polyline
useSpeedPolyline(mapRef, positions)

function onMarkerSelect(code: string | null) {
  setSelectedCode(code ?? '')
}

function onPanelSelectVehicle(code: string) {
  setSelectedCode(code)
}

// Trip start marker
const tripStartPosition = computed(() => {
  if (!positions.value.length) return null
  const p = positions.value[0]
  const lat = Number(p.Lat)
  const lng = Number(p.Lng)
  if (isNaN(lat) || isNaN(lng)) return null
  return { lat, lng }
})

const tripStartLabel = computed(() =>
  activeTrip.value ? dayjs(activeTrip.value.StartTime).format('HH:mm') : '',
)
</script>

<template>
  <!-- Placeholder when no API key -->
  <div
    v-if="!MAPS_API_KEY"
    class="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center text-center p-6"
  >
    <EnvironmentOutlined class="text-4xl text-blue-300 mb-3" />
    <div class="text-gray-600 font-medium">
      {{ t('map.placeholder') }}
    </div>
    <div class="text-gray-400 text-sm mt-1">
      {{ t('map.placeholderHint') }}
    </div>
  </div>

  <!-- Google Map -->
  <div
    v-else
    class="relative w-full h-full"
  >
    <GoogleMap
      ref="mapRef"
      :api-key="MAPS_API_KEY"
      :center="center"
      :zoom="8"
      class="w-full h-full"
      :gesture-handling="'greedy'"
      :disable-default-ui="true"
      :zoom-control="true"
    >
      <VehicleMarker
        v-for="v in vehicleList"
        :key="v.Code"
        :vehicle="v"
        :selected="selectedCode === v.Code"
        @select="onMarkerSelect"
      />

      <!-- Trip start marker -->
      <CustomMarker
        v-if="tripStartPosition"
        :options="{ position: tripStartPosition, anchorPoint: 'BOTTOM_CENTER' }"
      >
        <div class="flex flex-col items-center">
          <div
            class="flex items-center gap-1 px-2 py-1 rounded-full text-white text-[10px] font-semibold shadow-md whitespace-nowrap bg-brand-primary"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line
                x1="4"
                y1="22"
                x2="4"
                y2="15"
              />
            </svg>
            {{ tripStartLabel }}
          </div>
          <div
            class="w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-brand-primary"
          />
        </div>
      </CustomMarker>
    </GoogleMap>

    <!-- Vehicle list panel -->
    <VehicleListPanel
      v-model:collapsed="panelCollapsed"
      :vehicles="vehicleList"
      :selected-code="selectedCode"
      @select-vehicle="onPanelSelectVehicle"
    />

    <!-- Trip info bar -->
    <div
      v-if="activeTrip && selectedCode"
      class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-4 text-sm max-w-150 border border-black/8"
    >
      <div
        :class="[
          'px-2 py-0.5 rounded text-xs font-semibold text-white shrink-0',
          activeTrip.IsFinished ? 'bg-gray-400' : 'bg-green-500',
        ]"
      >
        {{ t(activeTrip.IsFinished ? 'liveMap.lastTrip' : 'liveMap.activeTrip') }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5 text-xs text-gray-600 truncate">
          <EnvironmentOutlined class="text-green-500" />
          <span class="truncate">{{ activeTrip.StartAddress || '—' }}</span>
          <span class="text-gray-300 mx-1">→</span>
          <EnvironmentOutlined class="text-red-500" />
          <span class="truncate">{{ activeTrip.FinishAddress || '—' }}</span>
        </div>
      </div>
      <div class="flex items-center gap-3 shrink-0 text-xs text-gray-500">
        <span>{{ (Number(activeTrip.TotalDistance) || 0).toFixed(1) }} km</span>
        <span
          v-if="activeTrip.DriverName?.trim()"
          class="text-gray-400"
        >
          {{ activeTrip.DriverName.trim() }}
        </span>
      </div>
    </div>
  </div>
</template>
