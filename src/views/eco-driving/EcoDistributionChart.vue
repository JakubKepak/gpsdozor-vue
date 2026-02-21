<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card } from 'ant-design-vue'
import { EcoDrivingEventType } from '@/types/api'
import { EVENT_TYPE_COLORS, type EcoEventWithVehicle } from './constants'

const { events } = defineProps<{
  events: EcoEventWithVehicle[]
}>()

const { t } = useI18n()

const distributionData = computed(() => {
  const map = new Map<number, number>()
  for (const e of events) {
    map.set(e.EventType, (map.get(e.EventType) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([type, count]) => ({
      type,
      label: EcoDrivingEventType[type] ?? 'Unknown',
      count,
    }))
    .sort((a, b) => b.count - a.count)
})

const maxDistribution = computed(() =>
  Math.max(...distributionData.value.map((d) => d.count), 1),
)
</script>

<template>
  <Card :body-style="{ padding: '20px' }">
    <h3 class="text-sm font-semibold text-gray-900 m-0 mb-4">
      {{ t('ecoDriving.fleetDistribution') }}
    </h3>
    <div class="flex flex-col gap-2.5">
      <div
        v-for="d in distributionData"
        :key="d.type"
        class="flex items-center gap-3"
      >
        <span class="text-sm text-gray-600 w-36 shrink-0 text-right">
          {{ t(`ecoDriving.type.${d.label}`) }}
        </span>
        <div class="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
          <div
            class="h-full rounded transition-all duration-300"
            :style="{
              width: `${(d.count / maxDistribution) * 100}%`,
              backgroundColor: EVENT_TYPE_COLORS[d.type] ?? '#6b7280',
              minWidth: '24px',
            }"
          />
        </div>
        <span class="text-sm font-medium text-gray-700 w-8 text-right">
          {{ d.count }}
        </span>
      </div>
    </div>
  </Card>
</template>
