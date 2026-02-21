<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { CustomMarker, InfoWindow } from 'vue3-google-map'
import { Tag } from 'ant-design-vue'
import dayjs from 'dayjs'
import { EcoDrivingEventType, EcoDrivingSeverity } from '@/types/api'
import { INT_MIN, EVENT_TYPE_COLORS, eventKey as makeEventKey, type EcoEventWithVehicle } from './constants'

const { event, selected = false } = defineProps<{
  event: EcoEventWithVehicle
  selected?: boolean
}>()

const emit = defineEmits<{
  select: [key: string | null]
}>()

const { t } = useI18n()

const eventKey = computed(() => makeEventKey(event))

const bgColor = computed(() => EVENT_TYPE_COLORS[event.EventType] ?? '#6b7280')

const sizeClass = computed(() => {
  if (event.EventSeverity === 3) return 'w-4 h-4'
  if (event.EventSeverity === 2) return 'w-3 h-3'
  return 'w-2.5 h-2.5'
})

function eventTypeName(type: number): string {
  return EcoDrivingEventType[type] ?? 'Unknown'
}

function severityName(sev: number): string {
  return EcoDrivingSeverity[sev] ?? 'None'
}

function severityColor(sev: number): string {
  if (sev === 3) return 'red'
  if (sev === 2) return 'orange'
  if (sev === 1) return 'green'
  return 'default'
}

function formatSpeed(speed: number): string {
  if (speed === INT_MIN || speed < 0) return '—'
  return `${speed} km/h`
}

const infoWindowOptions = computed(() => ({
  position: { lat: event.Position.Latitude, lng: event.Position.Longitude },
  ...(typeof google !== 'undefined' && google.maps
    ? { pixelOffset: new google.maps.Size(0, -10) }
    : {}),
}))
</script>

<template>
  <CustomMarker
    :options="{
      position: { lat: event.Position.Latitude, lng: event.Position.Longitude },
      anchorPoint: 'CENTER',
    }"
    @click="emit('select', eventKey)"
  >
    <div class="flex items-center justify-center cursor-pointer">
      <div
        :class="[sizeClass, 'rounded-full border-2 border-white shadow-md']"
        :style="{ backgroundColor: bgColor }"
      />
    </div>
  </CustomMarker>

  <InfoWindow
    v-if="selected"
    :options="infoWindowOptions"
    @close-click="emit('select', null)"
  >
    <div class="eco-marker-popover relative min-w-40 pr-6">
      <button
        class="absolute -top-0.5 right-0 flex items-center justify-center w-5 h-5 rounded-full bg-transparent border-0 cursor-pointer text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs leading-none"
        aria-label="Close"
        @click="emit('select', null)"
      >
        ✕
      </button>
      <div class="font-semibold text-sm">
        {{ event.vehicleName }}
      </div>
      <div class="text-xs text-gray-400 mt-0.5">
        {{ event.vehicleSPZ }}
      </div>
      <div class="flex items-center gap-1.5 mt-2">
        <Tag
          :color="bgColor"
          class="m-0"
        >
          {{ t(`ecoDriving.type.${eventTypeName(event.EventType)}`) }}
        </Tag>
        <Tag
          :color="severityColor(event.EventSeverity)"
          class="m-0"
        >
          {{ t(`ecoDriving.severity.${severityName(event.EventSeverity)}`) }}
        </Tag>
      </div>
      <div
        v-if="formatSpeed(event.Speed) !== '—'"
        class="text-xs text-gray-600 mt-1.5"
      >
        {{ t('ecoDriving.colSpeed') }}: {{ formatSpeed(event.Speed) }}
      </div>
      <div class="text-xs text-gray-400 mt-1">
        {{ dayjs(event.Timestamp).format('DD.MM.YYYY HH:mm:ss') }}
      </div>
    </div>
  </InfoWindow>
</template>
