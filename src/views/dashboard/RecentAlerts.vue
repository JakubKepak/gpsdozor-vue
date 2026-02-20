<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card } from 'ant-design-vue'
import { WarningOutlined } from '@ant-design/icons-vue'
import type { Vehicle } from '@/types/api'
import { getEffectiveSpeed } from '@/utils/vehicle'

const { vehicles } = defineProps<{ vehicles: Vehicle[] }>()
const { t } = useI18n()

interface VehicleAlert {
  vehicleName: string
  messageId: string
  messageValues?: Record<string, string | number>
  timestamp: string
  severity: 'high' | 'medium' | 'low'
}

const severityColors: Record<string, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#3b82f6',
}

function hoursSince(timestamp: string): number {
  return (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60)
}

function formatTimeSince(timestamp: string): string {
  const mins = Math.floor((Date.now() - new Date(timestamp).getTime()) / (1000 * 60))
  if (mins < 60) return t('alerts.minutesAgo', { mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('alerts.hoursAgo', { hours })
  return t('alerts.daysAgo', { days: Math.floor(hours / 24) })
}

const alerts = computed<VehicleAlert[]>(() => {
  const result: VehicleAlert[] = []
  for (const v of vehicles) {
    const speed = getEffectiveSpeed(v)
    if (speed > 120) {
      result.push({
        vehicleName: v.Name,
        messageId: 'alerts.speeding',
        messageValues: { speed },
        timestamp: v.LastPositionTimestamp,
        severity: 'high',
      })
    }
    if (!v.IsActive) {
      result.push({
        vehicleName: v.Name,
        messageId: 'alerts.offline',
        timestamp: v.LastPositionTimestamp,
        severity: 'medium',
      })
    }
    if (speed === 0 && v.IsActive) {
      const hours = hoursSince(v.LastPositionTimestamp)
      if (hours > 2) {
        result.push({
          vehicleName: v.Name,
          messageId: 'alerts.idle',
          messageValues: { hours: Math.round(hours) },
          timestamp: v.LastPositionTimestamp,
          severity: 'low',
        })
      }
    }
  }
  return result.slice(0, 5)
})
</script>

<template>
  <Card :body-style="{ padding: '16px' }">
    <h3 class="text-sm font-semibold text-gray-900 m-0 mb-3">{{ t('alerts.title') }}</h3>

    <div v-if="alerts.length === 0" class="text-center py-4 text-gray-400 text-sm">
      {{ t('alerts.empty') }}
    </div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="(alert, i) in alerts"
        :key="i"
        class="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50"
        :style="{ borderLeft: `3px solid ${severityColors[alert.severity]}` }"
      >
        <WarningOutlined
          class="text-sm mt-0.5 shrink-0"
          :style="{ color: severityColors[alert.severity] }"
        />
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-gray-900 truncate">{{ alert.vehicleName }}</div>
          <div class="text-xs text-gray-500 mt-0.5">
            {{ t(alert.messageId, alert.messageValues ?? {}) }}
          </div>
          <div class="text-xs text-gray-400 mt-0.5">{{ formatTimeSince(alert.timestamp) }}</div>
        </div>
      </div>
    </div>
  </Card>
</template>
