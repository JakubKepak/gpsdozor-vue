<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Table, Tag } from 'ant-design-vue'
import { EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import type { TripWithVehicle } from '@/api/composables/useAllVehicleTrips'

const { trips, loading = false } = defineProps<{
  trips: TripWithVehicle[]
  loading?: boolean
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

function truncateAddress(addr: string, maxLen = 35): string {
  if (!addr) return '—'
  return addr.length > maxLen ? addr.slice(0, maxLen) + '...' : addr
}

const driverFilters = computed(() =>
  [...new Set(trips.map((t) => (t.DriverName ?? '').trim()).filter(Boolean))].map((name) => ({
    text: name,
    value: name,
  })),
)

const columns = computed(() => [
  {
    title: t('fleet.colVehicle'),
    key: 'vehicle',
    width: 150,
  },
  {
    title: t('fleet.colDriver'),
    key: 'driver',
    width: 120,
    filters: driverFilters.value,
    onFilter: (value: string | number | boolean, record: TripWithVehicle) =>
      (record.DriverName ?? '').trim() === String(value),
  },
  {
    title: t('fleet.colDate'),
    key: 'date',
    width: 150,
    sorter: (a: TripWithVehicle, b: TripWithVehicle) =>
      dayjs(a.StartTime).unix() - dayjs(b.StartTime).unix(),
    defaultSortOrder: 'descend' as const,
  },
  {
    title: t('fleet.colRoute'),
    key: 'route',
    width: 250,
    ellipsis: true,
  },
  {
    title: t('fleet.colDistance'),
    key: 'distance',
    width: 100,
    sorter: (a: TripWithVehicle, b: TripWithVehicle) => n(a.TotalDistance) - n(b.TotalDistance),
  },
  {
    title: t('fleet.colDuration'),
    key: 'duration',
    width: 90,
    sorter: (a: TripWithVehicle, b: TripWithVehicle) =>
      dayjs(a.FinishTime).diff(dayjs(a.StartTime)) - dayjs(b.FinishTime).diff(dayjs(b.StartTime)),
  },
  {
    title: t('fleet.colAvgSpeed'),
    key: 'avgSpeed',
    width: 110,
    sorter: (a: TripWithVehicle, b: TripWithVehicle) => n(a.AverageSpeed) - n(b.AverageSpeed),
  },
  {
    title: t('fleet.colMaxSpeed'),
    key: 'maxSpeed',
    width: 110,
    sorter: (a: TripWithVehicle, b: TripWithVehicle) => n(a.MaxSpeed) - n(b.MaxSpeed),
  },
  {
    title: t('fleet.colFuel'),
    key: 'fuel',
    width: 80,
    sorter: (a: TripWithVehicle, b: TripWithVehicle) =>
      n(a.FuelConsumed?.Value) - n(b.FuelConsumed?.Value),
  },
  {
    title: t('fleet.colCost'),
    key: 'cost',
    width: 90,
    sorter: (a: TripWithVehicle, b: TripWithVehicle) => n(a.TripCost?.Value) - n(b.TripCost?.Value),
  },
])

const dataSource = computed(() => trips.map((t) => ({ ...t, key: t.Id })))
</script>

<template>
  <Table
    :columns="columns"
    :data-source="dataSource"
    :loading="loading"
    :pagination="{
      defaultPageSize: 20,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50'],
      showTotal: (total: number, range: [number, number]) =>
        t('fleet.pagination', { from: range[0], to: range[1], total }),
    }"
    size="middle"
    :scroll="{ x: 1100 }"
  >
    <template #bodyCell="{ column, record }">
      <!-- Vehicle -->
      <template v-if="column.key === 'vehicle'">
        <div class="font-medium text-gray-900 text-sm">
          {{ record.vehicleName }}
        </div>
        <div class="text-xs text-gray-400">
          {{ record.vehicleSPZ }}
        </div>
      </template>

      <!-- Driver -->
      <template v-else-if="column.key === 'driver'">
        <span
          v-if="(record.DriverName ?? '').trim()"
          class="text-sm text-gray-700"
        >
          {{ (record.DriverName ?? '').trim() }}
        </span>
        <span
          v-else
          class="text-xs text-gray-300 italic"
        >
          —
        </span>
      </template>

      <!-- Date -->
      <template v-else-if="column.key === 'date'">
        <div class="text-sm">
          <div class="text-gray-900">
            {{ dayjs(record.StartTime).format('DD.MM.YYYY') }}
          </div>
          <div class="text-xs text-gray-400 flex items-center gap-1">
            <ClockCircleOutlined />
            {{ dayjs(record.StartTime).format('HH:mm') }} –
            {{ dayjs(record.FinishTime).format('HH:mm') }}
          </div>
        </div>
      </template>

      <!-- Route -->
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

      <!-- Distance -->
      <template v-else-if="column.key === 'distance'">
        <span class="text-sm font-medium text-gray-700">
          {{ n(record.TotalDistance).toFixed(1) }} km
        </span>
      </template>

      <!-- Duration -->
      <template v-else-if="column.key === 'duration'">
        <span class="text-sm text-gray-600">
          {{ formatDuration(record.StartTime, record.FinishTime) }}
        </span>
      </template>

      <!-- Avg Speed -->
      <template v-else-if="column.key === 'avgSpeed'">
        <span class="text-sm text-gray-600">{{ n(record.AverageSpeed).toFixed(0) }} km/h</span>
      </template>

      <!-- Max Speed -->
      <template v-else-if="column.key === 'maxSpeed'">
        <Tag
          :color="
            n(record.MaxSpeed) > 130 ? 'red' : n(record.MaxSpeed) > 100 ? 'orange' : 'default'
          "
          class="m-0"
        >
          {{ n(record.MaxSpeed).toFixed(0) }} km/h
        </Tag>
      </template>

      <!-- Fuel -->
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
        >
          —
        </span>
      </template>

      <!-- Cost -->
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
        >
          —
        </span>
      </template>
    </template>
  </Table>
</template>
