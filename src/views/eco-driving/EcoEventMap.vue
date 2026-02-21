<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { GoogleMap } from 'vue3-google-map'
import { EnvironmentOutlined } from '@ant-design/icons-vue'
import { EcoDrivingEventType } from '@/types/api'
import { EVENT_TYPE_COLORS, eventKey, type EcoEventWithVehicle } from './constants'
import EcoEventMarker from './EcoEventMarker.vue'

const { events, selectedKey = null } = defineProps<{
  events: EcoEventWithVehicle[]
  selectedKey?: string | null
}>()

const emit = defineEmits<{
  'update:selectedKey': [key: string | null]
}>()

const { t } = useI18n()

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string

const mapRef = ref<InstanceType<typeof GoogleMap> | null>(null)
const hasFitted = ref(false)

const center = { lat: 50.08, lng: 14.43 }

const validEvents = computed(() =>
  events.filter((e) => e.Position.Latitude !== 0 || e.Position.Longitude !== 0),
)

// Fit bounds when map is ready
watch(
  () => mapRef.value?.ready,
  (ready) => {
    if (!ready || hasFitted.value || validEvents.value.length === 0) return
    fitToEvents()
  },
)

// Re-fit when events change (slider / filter)
watch(
  () => validEvents.value.length,
  () => {
    hasFitted.value = false
    if (mapRef.value?.ready && validEvents.value.length > 0) {
      fitToEvents()
    }
  },
)

function fitToEvents() {
  const map = mapRef.value?.map
  if (!map) return

  const bounds = new google.maps.LatLngBounds()
  for (const e of validEvents.value) {
    bounds.extend({ lat: e.Position.Latitude, lng: e.Position.Longitude })
  }
  map.fitBounds(bounds, 50)
  hasFitted.value = true
}

function onMarkerSelect(key: string | null) {
  emit('update:selectedKey', key)
}

// Pan to selected event (e.g. from table click)
watch(
  () => selectedKey,
  (key) => {
    if (!key) return
    const map = mapRef.value?.map
    if (!map) return
    const event = validEvents.value.find((e) => eventKey(e) === key)
    if (event) {
      map.panTo({ lat: event.Position.Latitude, lng: event.Position.Longitude })
      if (map.getZoom()! < 12) map.setZoom(14)
    }
  },
)

// Legend: only show event types present in data
const legendItems = computed(() => {
  const types = new Set(validEvents.value.map((e) => e.EventType))
  return [...types]
    .sort((a, b) => a - b)
    .map((type) => [type, EcoDrivingEventType[type] ?? 'Unknown'] as const)
})
</script>

<template>
  <!-- No API key placeholder -->
  <div
    v-if="!MAPS_API_KEY"
    class="h-[500px] bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center text-center p-6"
  >
    <EnvironmentOutlined class="text-4xl text-blue-300 mb-3" />
    <div class="text-gray-600 font-medium">
      {{ t('map.placeholder') }}
    </div>
    <div class="text-gray-400 text-sm mt-1">
      {{ t('map.placeholderHint') }}
    </div>
  </div>

  <!-- Map -->
  <div
    v-else
    class="h-[500px] relative"
  >
    <GoogleMap
      ref="mapRef"
      :api-key="MAPS_API_KEY"
      :center="center"
      :zoom="6"
      class="w-full h-full"
      :gesture-handling="'greedy'"
      :disable-default-ui="true"
      :zoom-control="true"
    >
      <EcoEventMarker
        v-for="e in validEvents"
        :key="eventKey(e)"
        :event="e"
        :selected="selectedKey === eventKey(e)"
        @select="onMarkerSelect"
      />
    </GoogleMap>

    <!-- Legend -->
    <div class="absolute top-3 right-3 bg-white rounded-lg shadow-md px-3 py-2.5 text-xs max-h-[460px] overflow-y-auto">
      <div class="font-medium text-gray-700 mb-1.5">
        {{ t('ecoDriving.mapLegend') }}
      </div>
      <div class="flex flex-col gap-1">
        <div
          v-for="[type, name] in legendItems"
          :key="type"
          class="flex items-center gap-2"
        >
          <div
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: EVENT_TYPE_COLORS[type] ?? '#6b7280' }"
          />
          <span class="text-gray-600">{{ t(`ecoDriving.type.${name}`) }}</span>
        </div>
      </div>

      <!-- Severity size sub-legend -->
      <div class="font-medium text-gray-700 mt-2.5 mb-1.5">
        {{ t('ecoDriving.mapSeveritySize') }}
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 rounded-full bg-gray-400 border-2 border-white shadow-sm shrink-0" />
          <span class="text-gray-600">{{ t('ecoDriving.severity.High') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow-sm shrink-0" />
          <span class="text-gray-600">{{ t('ecoDriving.severity.Medium') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-2.5 h-2.5 rounded-full bg-gray-400 border-2 border-white shadow-sm shrink-0" />
          <span class="text-gray-600">{{ t('ecoDriving.severity.Low') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
