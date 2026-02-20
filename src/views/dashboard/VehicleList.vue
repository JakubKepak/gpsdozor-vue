<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Card, Tag, Tooltip } from 'ant-design-vue'
import { CarOutlined, DashboardOutlined, AimOutlined, NodeIndexOutlined } from '@ant-design/icons-vue'
import type { Vehicle } from '@/types/api'
import { getEffectiveSpeed } from '@/utils/vehicle'

const { vehicles } = defineProps<{
  vehicles: Vehicle[]
}>()

const emit = defineEmits<{
  locate: [vehicleCode: string]
}>()

const router = useRouter()
const { t } = useI18n()

function getStatusDotColor(vehicle: Vehicle): string {
  if (getEffectiveSpeed(vehicle) > 0) return '#22c55e'
  if (vehicle.IsActive) return '#f59e0b'
  return '#ef4444'
}

function getStatusTag(vehicle: Vehicle): { color: string; label: string } {
  if (getEffectiveSpeed(vehicle) > 0) return { color: 'green', label: t('vehicles.active') }
  if (vehicle.IsActive) return { color: 'orange', label: t('vehicles.idle') }
  return { color: 'red', label: t('vehicles.offline') }
}
</script>

<template>
  <Card :body-style="{ padding: '16px' }">
    <h3 class="text-sm font-semibold text-gray-900 m-0 mb-3">{{ t('vehicles.title') }}</h3>
    <div class="flex flex-col">
      <div
        v-for="v in vehicles"
        :key="v.Code"
        class="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0"
      >
        <div
          class="w-2 h-2 rounded-full shrink-0"
          :style="{ backgroundColor: getStatusDotColor(v) }"
        />
        <div class="min-w-0 flex-1">
          <div class="text-sm font-medium text-gray-900 truncate">{{ v.Name }}</div>
          <div class="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
            <span class="flex items-center gap-1">
              <CarOutlined />
              {{ v.SPZ }}
            </span>
            <span v-if="getEffectiveSpeed(v) > 0" class="flex items-center gap-1">
              <DashboardOutlined />
              {{ getEffectiveSpeed(v) }} km/h
            </span>
          </div>
        </div>
        <Tag :color="getStatusTag(v).color">{{ getStatusTag(v).label }}</Tag>
        <Tooltip :title="t('vehicles.tripLog')">
          <button
            class="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer bg-transparent border-0 shrink-0"
            @click="router.push(`/fleet?vehicles=${v.Code}`)"
          >
            <NodeIndexOutlined />
          </button>
        </Tooltip>
        <Tooltip :title="t('vehicles.locate')">
          <button
            class="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer bg-transparent border-0 shrink-0"
            @click="emit('locate', v.Code)"
          >
            <AimOutlined />
          </button>
        </Tooltip>
      </div>
    </div>
  </Card>
</template>
