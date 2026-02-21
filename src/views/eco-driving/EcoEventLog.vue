<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, Table, Tag } from 'ant-design-vue'
import dayjs from 'dayjs'
import { EcoDrivingEventType } from '@/types/api'
import { INT_MIN, EVENT_TYPE_COLORS, eventTypeName, severityName, severityColor, formatSpeed, type EcoEventWithVehicle } from './constants'

type EcoRow = EcoEventWithVehicle & { key: string }

const { events, loading = false } = defineProps<{
  events: EcoEventWithVehicle[]
  loading?: boolean
}>()

const emit = defineEmits<{
  selectEvent: [event: EcoEventWithVehicle]
}>()

const { t } = useI18n()

const distributionTypes = computed(() => {
  const map = new Map<number, string>()
  for (const e of events) {
    if (!map.has(e.EventType)) {
      map.set(e.EventType, EcoDrivingEventType[e.EventType] ?? 'Unknown')
    }
  }
  return [...map.entries()].map(([type, label]) => ({
    text: t(`ecoDriving.type.${label}`),
    value: type,
  }))
})

const columns = computed(() => [
  {
    title: t('ecoDriving.colVehicle'),
    key: 'vehicle',
    width: 150,
    sorter: (a: EcoRow, b: EcoRow) => a.vehicleName.localeCompare(b.vehicleName),
  },
  {
    title: t('ecoDriving.colTime'),
    key: 'time',
    width: 140,
    sorter: (a: EcoRow, b: EcoRow) => dayjs(a.Timestamp).unix() - dayjs(b.Timestamp).unix(),
    defaultSortOrder: 'descend' as const,
  },
  {
    title: t('ecoDriving.colType'),
    key: 'type',
    width: 160,
    filters: distributionTypes.value,
    onFilter: (value: number, record: EcoRow) => record.EventType === value,
  },
  {
    title: t('ecoDriving.colSeverity'),
    key: 'severity',
    width: 100,
    filters: [
      { text: t('ecoDriving.severity.High'), value: 3 },
      { text: t('ecoDriving.severity.Medium'), value: 2 },
      { text: t('ecoDriving.severity.Low'), value: 1 },
    ],
    onFilter: (value: number, record: EcoRow) => record.EventSeverity === value,
    sorter: (a: EcoRow, b: EcoRow) => a.EventSeverity - b.EventSeverity,
  },
  {
    title: t('ecoDriving.colSpeed'),
    key: 'speed',
    width: 100,
    sorter: (a: EcoRow, b: EcoRow) => {
      const sa = a.Speed === INT_MIN ? -1 : a.Speed
      const sb = b.Speed === INT_MIN ? -1 : b.Speed
      return sa - sb
    },
  },
  {
    title: t('ecoDriving.colValue'),
    key: 'value',
    width: 80,
    sorter: (a: EcoRow, b: EcoRow) => a.EventValue - b.EventValue,
  },
])

const dataSource = computed(() =>
  events.map((e, i) => ({ ...e, key: `${e.vehicleCode}-${e.Timestamp}-${i}` })),
)
</script>

<template>
  <Card :body-style="{ padding: '20px' }">
    <h3 class="text-sm font-semibold text-gray-900 m-0 mb-3">
      {{ t('ecoDriving.eventLog') }}
    </h3>
    <Table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="{
        defaultPageSize: 20,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        size: 'small',
      }"
      size="small"
      :scroll="{ x: 750 }"
      :custom-row="(record: EcoRow) => ({
        onClick: () => emit('selectEvent', record),
        class: 'cursor-pointer',
      })"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'vehicle'">
          <div>
            <div class="font-medium text-gray-900 text-sm">
              {{ record.vehicleName }}
            </div>
            <div class="text-xs text-gray-400">
              {{ record.vehicleSPZ }}
            </div>
          </div>
        </template>

        <template v-else-if="column.key === 'time'">
          <div class="text-sm">
            <div class="text-gray-900">
              {{ dayjs(record.Timestamp).format('DD.MM.YYYY') }}
            </div>
            <div class="text-xs text-gray-400">
              {{ dayjs(record.Timestamp).format('HH:mm:ss') }}
            </div>
          </div>
        </template>

        <template v-else-if="column.key === 'type'">
          <Tag
            :color="EVENT_TYPE_COLORS[record.EventType] ?? '#6b7280'"
            class="m-0"
          >
            {{ t(`ecoDriving.type.${eventTypeName(record.EventType)}`) }}
          </Tag>
        </template>

        <template v-else-if="column.key === 'severity'">
          <Tag
            :color="severityColor(record.EventSeverity)"
            class="m-0"
          >
            {{ t(`ecoDriving.severity.${severityName(record.EventSeverity)}`) }}
          </Tag>
        </template>

        <template v-else-if="column.key === 'speed'">
          <span class="text-sm text-gray-700">
            {{ formatSpeed(record.Speed) }}
          </span>
        </template>

        <template v-else-if="column.key === 'value'">
          <span class="text-sm text-gray-700">
            {{ record.EventValue }}
          </span>
        </template>
      </template>
    </Table>
  </Card>
</template>
