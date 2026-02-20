<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Table, Tag } from 'ant-design-vue'
import { EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { Trip } from '@/types/api'

const { trips } = defineProps<{
  trips: Trip[]
}>()

const { t } = useI18n()
const n = (v: unknown): number => Number(v) || 0

function formatDuration(start: string, finish: string): string {
  if (!start || !finish) return '—'
  const mins = dayjs(finish).diff(dayjs(start), 'minute')
  if (mins < 0) return '—'
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function truncateAddress(addr: string, maxLen = 30): string {
  if (!addr) return '—'
  return addr.length > maxLen ? addr.slice(0, maxLen) + '...' : addr
}

const columns = computed(() => [
  {
    title: t('health.colTripDate'),
    key: 'date',
    width: 140,
    sorter: (a: Trip, b: Trip) => dayjs(a.StartTime).unix() - dayjs(b.StartTime).unix(),
    defaultSortOrder: 'descend' as const,
  },
  {
    title: t('health.colTripRoute'),
    key: 'route',
    ellipsis: true,
  },
  {
    title: t('health.colTripDistance'),
    key: 'distance',
    width: 90,
    sorter: (a: Trip, b: Trip) => n(a.TotalDistance) - n(b.TotalDistance),
  },
  {
    title: t('health.colTripDuration'),
    key: 'duration',
    width: 80,
    sorter: (a: Trip, b: Trip) =>
      dayjs(a.FinishTime).diff(dayjs(a.StartTime)) - dayjs(b.FinishTime).diff(dayjs(b.StartTime)),
  },
  {
    title: t('health.colTripAvgSpeed'),
    key: 'avgSpeed',
    width: 80,
    sorter: (a: Trip, b: Trip) => n(a.AverageSpeed) - n(b.AverageSpeed),
  },
  {
    title: t('health.colTripMaxSpeed'),
    key: 'maxSpeed',
    width: 80,
    sorter: (a: Trip, b: Trip) => n(a.MaxSpeed) - n(b.MaxSpeed),
  },
  {
    title: t('health.colTripFuel'),
    key: 'fuel',
    width: 70,
    sorter: (a: Trip, b: Trip) => n(a.FuelConsumed?.Value) - n(b.FuelConsumed?.Value),
  },
  {
    title: t('health.colFuelEfficiency'),
    key: 'efficiency',
    width: 90,
    sorter: (a: Trip, b: Trip) => {
      const ea = n(a.TotalDistance) > 0 && n(a.FuelConsumed?.Value) > 0
        ? (n(a.FuelConsumed?.Value) / n(a.TotalDistance)) * 100 : 0
      const eb = n(b.TotalDistance) > 0 && n(b.FuelConsumed?.Value) > 0
        ? (n(b.FuelConsumed?.Value) / n(b.TotalDistance)) * 100 : 0
      return ea - eb
    },
  },
  {
    title: t('health.colTripCost'),
    key: 'cost',
    width: 80,
    sorter: (a: Trip, b: Trip) => n(a.TripCost?.Value) - n(b.TripCost?.Value),
  },
  {
    title: t('health.colTripDriver'),
    key: 'driver',
    width: 100,
  },
])

const dataSource = computed(() => trips.map(t => ({ ...t, key: t.Id })))
</script>

<template>
  <div>
    <h3 class="text-sm font-semibold text-gray-900 m-0 mb-3">
      {{ t('health.tripList') }}
    </h3>
    <Table
      :columns="columns"
      :data-source="dataSource"
      :pagination="{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50'],
        size: 'small',
      }"
      size="small"
      :scroll="{ x: 900 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'date'">
          <div class="text-sm">
            <div class="text-gray-900">
              {{ dayjs(record.StartTime).format('DD.MM.YYYY') }}
            </div>
            <div class="text-xs text-gray-400 flex items-center gap-1">
              <ClockCircleOutlined />
              {{ dayjs(record.StartTime).format('HH:mm') }} – {{ dayjs(record.FinishTime).format('HH:mm') }}
            </div>
          </div>
        </template>

        <template v-else-if="column.key === 'route'">
          <div class="text-sm space-y-0.5">
            <div class="flex items-center gap-1.5">
              <EnvironmentOutlined class="text-green-500 text-xs" />
              <span class="text-gray-700">{{ truncateAddress(record.StartAddress) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <EnvironmentOutlined class="text-red-500 text-xs" />
              <span class="text-gray-700">{{ truncateAddress(record.FinishAddress) }}</span>
            </div>
          </div>
        </template>

        <template v-else-if="column.key === 'distance'">
          <span class="text-sm font-medium text-gray-700">{{ n(record.TotalDistance).toFixed(1) }} km</span>
        </template>

        <template v-else-if="column.key === 'duration'">
          <span class="text-sm text-gray-600">{{ formatDuration(record.StartTime, record.FinishTime) }}</span>
        </template>

        <template v-else-if="column.key === 'avgSpeed'">
          <span class="text-sm text-gray-600">{{ n(record.AverageSpeed).toFixed(0) }} km/h</span>
        </template>

        <template v-else-if="column.key === 'maxSpeed'">
          <Tag
            :color="n(record.MaxSpeed) > 130 ? 'red' : n(record.MaxSpeed) > 100 ? 'orange' : 'default'"
            class="m-0"
          >
            {{ n(record.MaxSpeed).toFixed(0) }} km/h
          </Tag>
        </template>

        <template v-else-if="column.key === 'fuel'">
          <span
            v-if="n(record.FuelConsumed?.Value) > 0"
            class="text-sm text-gray-700"
          >
            {{ n(record.FuelConsumed?.Value).toFixed(1) }} L
          </span>
          <span
            v-else
            class="text-xs text-gray-300"
          >—</span>
        </template>

        <template v-else-if="column.key === 'efficiency'">
          <template v-if="n(record.FuelConsumed?.Value) > 0 && n(record.TotalDistance) > 0">
            <span
              class="text-sm font-medium"
              :style="{
                color: (n(record.FuelConsumed?.Value) / n(record.TotalDistance)) * 100 > 15
                  ? '#ef4444'
                  : (n(record.FuelConsumed?.Value) / n(record.TotalDistance)) * 100 > 10
                    ? '#f59e0b'
                    : '#22c55e',
              }"
            >
              {{ ((n(record.FuelConsumed?.Value) / n(record.TotalDistance)) * 100).toFixed(1) }} L/100
            </span>
          </template>
          <span
            v-else
            class="text-xs text-gray-300"
          >—</span>
        </template>

        <template v-else-if="column.key === 'cost'">
          <span
            v-if="n(record.TripCost?.Value) > 0"
            class="text-sm text-gray-700"
          >
            {{ n(record.TripCost?.Value).toFixed(0) }} CZK
          </span>
          <span
            v-else
            class="text-xs text-gray-300"
          >—</span>
        </template>

        <template v-else-if="column.key === 'driver'">
          <span
            v-if="(record.DriverName ?? '').trim()"
            class="text-sm text-gray-700"
          >
            {{ (record.DriverName ?? '').trim() }}
          </span>
          <span
            v-else
            class="text-xs text-gray-300"
          >—</span>
        </template>
      </template>
    </Table>
  </div>
</template>
