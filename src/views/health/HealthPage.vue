<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Alert, Input, Table, Tag } from 'ant-design-vue'
import { CheckOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { RouterLink } from 'vue-router'
import { useGroups, useVehicles } from '@/api/composables'
import AIInsightsButton from '@/components/AIInsightsButton.vue'
import InsightCards from '@/components/InsightCards.vue'
import type { Vehicle } from '@/types/api'

dayjs.extend(relativeTime)

const { t } = useI18n()
const search = ref('')
const showInsights = ref(false)

const { data: groups, isLoading: groupsLoading } = useGroups()
const groupCode = computed(() => groups.value?.[0]?.Code ?? '')
const { data: vehicles, isLoading: vehiclesLoading, error } = useVehicles(groupCode)

const filteredVehicles = computed(() => {
  const list = vehicles.value ?? []
  if (!search.value.trim()) return list
  const q = search.value.toLowerCase()
  return list.filter(
    v =>
      v.Name.toLowerCase().includes(q) ||
      v.SPZ.toLowerCase().includes(q) ||
      v.BranchName.toLowerCase().includes(q),
  )
})

const branches = computed(() =>
  [...new Set((vehicles.value ?? []).map(v => v.BranchName))].map(b => ({ text: b, value: b })),
)

const isLoading = computed(() => groupsLoading.value || vehiclesLoading.value)

const insightData = computed(() => ({
  vehicles: (vehicles.value ?? []).map(v => ({
    name: v.Name,
    spz: v.SPZ,
    branch: v.BranchName,
    odometer: v.Odometer,
    speed: v.Speed,
    isActive: v.IsActive,
    ecoDriving: v.IsEcoDrivingEnabled,
  })),
}))

const columns = computed(() => [
  {
    title: t('health.colVehicle'),
    key: 'vehicle',
    width: 180,
    sorter: (a: Vehicle, b: Vehicle) => a.Name.localeCompare(b.Name),
  },
  {
    title: t('health.colSPZ'),
    dataIndex: 'SPZ',
    key: 'spz',
    width: 120,
  },
  {
    title: t('health.colBranch'),
    dataIndex: 'BranchName',
    key: 'branch',
    width: 180,
    filters: branches.value,
    onFilter: (value: string | number | boolean, record: Vehicle) => record.BranchName === String(value),
  },
  {
    title: t('health.colOdometer'),
    key: 'odometer',
    width: 120,
    sorter: (a: Vehicle, b: Vehicle) => a.Odometer - b.Odometer,
  },
  {
    title: t('health.colActivity'),
    key: 'activity',
    width: 140,
    sorter: (a: Vehicle, b: Vehicle) => a.Speed - b.Speed,
  },
  {
    title: t('health.colStatus'),
    key: 'status',
    width: 100,
    filters: [
      { text: t('health.active'), value: 'true' },
      { text: t('health.inactive'), value: 'false' },
    ],
    onFilter: (value: string | number | boolean, record: Vehicle) => String(record.IsActive) === String(value),
  },
  {
    title: t('health.colEcoDriving'),
    key: 'ecoDriving',
    width: 100,
    align: 'center' as const,
  },
])

const dataSource = computed(() => filteredVehicles.value.map(v => ({ ...v, key: v.Code })))
</script>

<template>
  <Alert
    v-if="error"
    type="error"
    :message="t('health.loadError')"
    :description="String(error)"
  />

  <div
    v-else
    class="flex flex-col gap-6"
  >
    <div class="flex items-start justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 m-0">
          {{ t('health.title') }}
        </h1>
        <p class="text-gray-500 text-sm mt-1 mb-0">
          {{ t('health.subtitle') }}
        </p>
      </div>
      <AIInsightsButton
        :active="showInsights"
        @click="showInsights = !showInsights"
      />
    </div>

    <InsightCards
      module="health"
      :visible="showInsights"
      :data="insightData"
    />

    <div>
      <Input
        :placeholder="t('health.searchPlaceholder')"
        allow-clear
        class="mb-4 max-w-100"
        @update:value="(val: string) => search = val"
      />
      <Table
        :columns="columns"
        :data-source="dataSource"
        :loading="isLoading"
        :pagination="false"
        size="middle"
        :scroll="{ x: 900 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'vehicle'">
            <RouterLink
              :to="`/health/${record.Code}`"
              class="font-medium text-blue-600 hover:text-blue-800"
            >
              {{ record.Name }}
            </RouterLink>
          </template>

          <template v-else-if="column.key === 'odometer'">
            <span class="text-sm">{{ (record.Odometer / 1000).toFixed(0) }}k km</span>
          </template>

          <template v-else-if="column.key === 'activity'">
            <div class="text-sm">
              <span
                v-if="record.Speed > 0"
                class="text-green-600 font-medium"
              >
                {{ record.Speed }} km/h
              </span>
              <span
                v-else
                class="text-gray-400"
              >{{ t('health.parked') }}</span>
              <div class="text-xs text-gray-400">
                {{ dayjs(record.LastPositionTimestamp).fromNow() }}
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <Tag
              :color="record.IsActive ? 'green' : 'red'"
              class="m-0"
            >
              {{ t(record.IsActive ? 'health.active' : 'health.inactive') }}
            </Tag>
          </template>

          <template v-else-if="column.key === 'ecoDriving'">
            <CheckOutlined
              v-if="record.IsEcoDrivingEnabled"
              class="text-green-500"
            />
            <span
              v-else
              class="text-gray-300"
            >—</span>
          </template>
        </template>
      </Table>
    </div>
  </div>
</template>
