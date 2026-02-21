<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { GoogleMap, Marker } from 'vue3-google-map'
import { EnvironmentOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { TripWithVehicle } from '@/api/composables/useAllVehicleTrips'
import type { PositionPoint } from '@/types/api'
import { useSpeedPolyline } from '@/composables/useSpeedPolyline'

const {
  trip = null,
  positions = [],
  loading = false,
} = defineProps<{
  trip: TripWithVehicle | null
  positions: PositionPoint[]
  loading?: boolean
}>()

const { t } = useI18n()

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null)
const center = { lat: 50.08, lng: 14.43 }

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const startIconUrl = svgDataUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><circle cx="9" cy="9" r="7" fill="#22c55e" stroke="white" stroke-width="2.5"/></svg>',
)

const endIconUrl = svgDataUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42">
    <filter id="s"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-opacity="0.3"/></filter>
    <g filter="url(#s)">
      <path d="M15 1C7.27 1 1 7.27 1 15c0 10.5 14 25 14 25s14-14.5 14-25C29 7.27 22.73 1 15 1z" fill="#1f2937"/>
      <circle cx="15" cy="15" r="10" fill="white"/>
      <defs><clipPath id="fc"><circle cx="15" cy="15" r="9"/></clipPath></defs>
      <g clip-path="url(#fc)">
        <rect x="6" y="6" width="4.5" height="4.5" fill="#1f2937"/>
        <rect x="10.5" y="6" width="4.5" height="4.5" fill="white"/>
        <rect x="15" y="6" width="4.5" height="4.5" fill="#1f2937"/>
        <rect x="19.5" y="6" width="4.5" height="4.5" fill="white"/>
        <rect x="6" y="10.5" width="4.5" height="4.5" fill="white"/>
        <rect x="10.5" y="10.5" width="4.5" height="4.5" fill="#1f2937"/>
        <rect x="15" y="10.5" width="4.5" height="4.5" fill="white"/>
        <rect x="19.5" y="10.5" width="4.5" height="4.5" fill="#1f2937"/>
        <rect x="6" y="15" width="4.5" height="4.5" fill="#1f2937"/>
        <rect x="10.5" y="15" width="4.5" height="4.5" fill="white"/>
        <rect x="15" y="15" width="4.5" height="4.5" fill="#1f2937"/>
        <rect x="19.5" y="15" width="4.5" height="4.5" fill="white"/>
        <rect x="6" y="19.5" width="4.5" height="4.5" fill="white"/>
        <rect x="10.5" y="19.5" width="4.5" height="4.5" fill="#1f2937"/>
        <rect x="15" y="19.5" width="4.5" height="4.5" fill="white"/>
        <rect x="19.5" y="19.5" width="4.5" height="4.5" fill="#1f2937"/>
      </g>
    </g>
  </svg>`,
)

const validPositions = computed(() =>
  positions.filter((p) => {
    const lat = parseFloat(p.Lat)
    const lng = parseFloat(p.Lng)
    return !isNaN(lat) && !isNaN(lng) && !(lat === 0 && lng === 0)
  }),
)

const polylinePath = computed(() =>
  validPositions.value.map((p) => ({
    lat: parseFloat(p.Lat),
    lng: parseFloat(p.Lng),
  })),
)

const startPos = computed(() => polylinePath.value[0] ?? null)
const endPos = computed(() =>
  polylinePath.value.length > 1 ? polylinePath.value[polylinePath.value.length - 1] : null,
)

const startMarkerOptions = computed(() =>
  startPos.value
    ? { position: startPos.value, icon: startIconUrl, zIndex: 10 }
    : null,
)

const endMarkerOptions = computed(() =>
  endPos.value
    ? { position: endPos.value, icon: endIconUrl, zIndex: 10 }
    : null,
)

// Speed-colored polyline (same as Map module)
useSpeedPolyline(mapRef, computed(() => validPositions.value))

// Fit bounds when positions load or change
watch(
  [() => mapRef.value?.ready, () => polylinePath.value.length],
  ([ready]) => {
    if (!ready || polylinePath.value.length === 0) return
    const map = mapRef.value?.map
    if (!map) return

    const bounds = new google.maps.LatLngBounds()
    for (const p of polylinePath.value) {
      bounds.extend(p)
    }
    map.fitBounds(bounds, 50)
  },
)
</script>

<template>
  <!-- No API key placeholder -->
  <div
    v-if="!MAPS_API_KEY"
    class="h-[400px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex flex-col items-center justify-center text-center p-6"
  >
    <EnvironmentOutlined class="text-4xl text-blue-300 mb-3" />
    <div class="text-gray-600 font-medium">
      {{ t('fleet.tripMap') }}
    </div>
    <div class="text-gray-400 text-sm mt-1">
      {{ t('map.placeholderHint') }}
    </div>
  </div>

  <!-- Map -->
  <div
    v-else
    class="h-[400px] relative"
  >
    <GoogleMap
      ref="mapRef"
      :api-key="MAPS_API_KEY"
      :center="center"
      :zoom="7"
      class="w-full h-full rounded-lg"
      :gesture-handling="'greedy'"
      :disable-default-ui="true"
      :zoom-control="true"
    >
      <!-- Start marker -->
      <Marker
        v-if="startMarkerOptions"
        :options="startMarkerOptions"
      />

      <!-- End marker -->
      <Marker
        v-if="endMarkerOptions"
        :options="endMarkerOptions"
      />
    </GoogleMap>

    <!-- Overlay: no trip selected -->
    <div
      v-if="!trip"
      class="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center"
    >
      <div class="text-center">
        <EnvironmentOutlined class="text-3xl text-gray-300 mb-2" />
        <div class="text-gray-500 text-sm">
          {{ t('fleet.tripMapSubtitle') }}
        </div>
      </div>
    </div>

    <!-- Overlay: loading -->
    <div
      v-else-if="loading"
      class="absolute inset-0 bg-white/50 rounded-lg flex items-center justify-center"
    >
      <div class="text-center">
        <LoadingOutlined class="text-2xl text-blue-500 mb-2" />
        <div class="text-gray-500 text-sm">
          {{ t('fleet.tripMapLoading') }}
        </div>
      </div>
    </div>

    <!-- Overlay: no GPS data -->
    <div
      v-else-if="validPositions.length === 0"
      class="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center"
    >
      <div class="text-center">
        <EnvironmentOutlined class="text-3xl text-gray-300 mb-2" />
        <div class="text-gray-500 text-sm">
          {{ t('fleet.tripMapEmpty') }}
        </div>
      </div>
    </div>

    <!-- Trip info badge -->
    <div
      v-if="trip && !loading && validPositions.length > 0"
      class="absolute top-3 left-3 bg-white rounded-lg shadow-md px-3 py-2 text-xs"
    >
      <div class="font-medium text-gray-800">
        {{ trip.vehicleName }}
        <span class="text-gray-400 font-normal">{{ trip.vehicleSPZ }}</span>
      </div>
      <div class="text-gray-500 mt-0.5">
        {{ dayjs(trip.StartTime).format('DD.MM.YYYY HH:mm') }} –
        {{ dayjs(trip.FinishTime).format('HH:mm') }}
      </div>
    </div>

    <!-- Legend -->
    <div
      v-if="trip && !loading && validPositions.length > 0"
      class="absolute bottom-3 right-3 bg-white rounded-lg shadow-md px-3 py-2 text-xs"
    >
      <div class="flex flex-col gap-1.5">
        <!-- Route endpoints -->
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span class="text-gray-600">{{ trip.StartAddress || '—' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 shrink-0 rounded-sm checkerboard" />
          <span class="text-gray-600">{{ trip.FinishAddress || '—' }}</span>
        </div>

        <!-- Speed legend -->
        <div class="border-t border-gray-100 pt-1.5 mt-0.5">
          <div class="text-gray-400 font-medium mb-1">
            {{ t('fleet.speedLegend') }}
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-1 rounded bg-[#22c55e]" />
            <span class="text-gray-500">&le; 90 km/h</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-1 rounded bg-[#f59e0b]" />
            <span class="text-gray-500">90–130 km/h</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-5 h-1 rounded bg-[#ef4444]" />
            <span class="text-gray-500">&gt; 130 km/h</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkerboard {
  background-image:
    linear-gradient(45deg, #1f2937 25%, transparent 25%),
    linear-gradient(-45deg, #1f2937 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #1f2937 75%),
    linear-gradient(-45deg, transparent 75%, #1f2937 75%);
  background-size: 6px 6px;
  background-position: 0 0, 0 3px, 3px -3px, -3px 0;
}
</style>
