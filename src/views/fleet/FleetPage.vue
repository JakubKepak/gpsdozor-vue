<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Alert, DatePicker, Select, Row, Col } from 'ant-design-vue'
import {
  CarOutlined,
  UserOutlined,
  DashboardOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { useGroups, useVehicles, useAllVehicleTrips } from '@/api/composables'
import type { TripWithVehicle } from '@/api/composables/useAllVehicleTrips'
import { useQueryParam, useSetQueryParams } from '@/composables/useQueryParam'
import StatCard from '@/components/StatCard.vue'
import AIInsightsButton from '@/components/AIInsightsButton.vue'
import InsightCards from '@/components/InsightCards.vue'
import TripTable from '@/views/fleet/TripTable.vue'

const { RangePicker } = DatePicker

const MAX_RANGE_DAYS = 30
const DATE_FORMAT = 'YYYY-MM-DD'
const n = (v: unknown): number => Number(v) || 0

const { t } = useI18n()

const showInsights = ref(false)

// --- URL state ---
const { value: vehiclesParam, set: setVehiclesParam } = useQueryParam('vehicles')
const { value: fromParam } = useQueryParam('from')
const { value: toParam } = useQueryParam('to')
const setQueryParams = useSetQueryParams()

// --- Date range ---
function parseDateRange(): [Dayjs, Dayjs] {
  const from = fromParam.value ? dayjs(fromParam.value, DATE_FORMAT, true) : null
  const to = toParam.value ? dayjs(toParam.value, DATE_FORMAT, true) : null

  if (from?.isValid() && to?.isValid() && to.diff(from, 'day') <= MAX_RANGE_DAYS) {
    return [from, to]
  }
  return [dayjs().subtract(7, 'day'), dayjs()]
}

const dateRange = computed(() => parseDateRange())

// Ensure URL has date params on mount
onMounted(() => {
  if (!fromParam.value || !toParam.value) {
    const [from, to] = parseDateRange()
    setQueryParams({
      from: from.format(DATE_FORMAT),
      to: to.format(DATE_FORMAT),
    })
  }
})

function onDateRangeChange(dates: unknown) {
  if (Array.isArray(dates) && dates[0] && dates[1]) {
    const from = dayjs(dates[0])
    const to = dayjs(dates[1])
    if (from.isValid() && to.isValid()) {
      setQueryParams({
        from: from.format(DATE_FORMAT),
        to: to.format(DATE_FORMAT),
      })
    }
  }
  pickerDates.value = [null, null]
}

const pickerDates = ref<[Dayjs | null, Dayjs | null]>([null, null])

function disabledDate(current: Dayjs): boolean {
  if (current.isAfter(dayjs())) return true
  const selected = pickerDates.value[0] ?? pickerDates.value[1]
  if (!selected) return false
  return Math.abs(current.diff(selected, 'day')) > MAX_RANGE_DAYS
}

// --- Vehicle selection ---
const { data: groups, isLoading: groupsLoading } = useGroups()
const groupCode = computed(() => groups.value?.[0]?.Code ?? '')
const { data: vehicles, isLoading: vehiclesLoading } = useVehicles(groupCode)

const selectedCodes = computed(() => {
  if (vehiclesParam.value) {
    const codes = vehiclesParam.value.split(',').filter(Boolean)
    if (codes.length > 0) return codes
  }
  const first = vehicles.value?.[0]?.Code
  return first ? [first] : []
})

function setSelectedCodes(codes: unknown) {
  if (!Array.isArray(codes)) return
  setVehiclesParam(codes.length > 0 ? codes.join(',') : '')
}

const vehicleOptions = computed(() =>
  (vehicles.value ?? []).map((v) => ({ value: v.Code, label: `${v.Name} (${v.SPZ})` })),
)

// --- Trip data ---
const selectedVehicles = computed(() =>
  (vehicles.value ?? []).filter((v) => selectedCodes.value.includes(v.Code)),
)

const from = computed(() => dateRange.value[0].format('YYYY-MM-DDTHH:mm:ss'))
const to = computed(() => dateRange.value[1].format('YYYY-MM-DDTHH:mm:ss'))

const tripsResult = useAllVehicleTrips(selectedVehicles, from, to)

const trips = computed(() => tripsResult.value.data)
const tripsLoading = computed(() => tripsResult.value.isLoading)
const error = computed(() => tripsResult.value.error)

const isLoading = computed(() => groupsLoading.value || vehiclesLoading.value || tripsLoading.value)

const tripList = computed(() => trips.value ?? [])
const totalDistance = computed(() =>
  tripList.value.reduce((sum: number, t: TripWithVehicle) => sum + n(t.TotalDistance), 0),
)
const uniqueDrivers = computed(
  () =>
    new Set(tripList.value.map((t: TripWithVehicle) => (t.DriverName ?? '').trim()).filter(Boolean))
      .size,
)
const uniqueVehicles = computed(
  () => new Set(tripList.value.map((t: TripWithVehicle) => t.vehicleCode)).size,
)

// --- AI insights ---
const insightData = computed(() => ({
  trips: tripList.value.length,
  totalDistance: totalDistance.value,
  uniqueVehicles: uniqueVehicles.value,
  uniqueDrivers: uniqueDrivers.value,
  vehicles: selectedVehicles.value.map((v) => {
    const vTrips = tripList.value.filter((t: TripWithVehicle) => t.vehicleCode === v.Code)
    return {
      name: v.Name,
      trips: vTrips.length,
      totalDistance: vTrips.reduce((s: number, t: TripWithVehicle) => s + n(t.TotalDistance), 0),
      avgSpeed:
        vTrips.length > 0
          ? vTrips.reduce((s: number, t: TripWithVehicle) => s + n(t.AverageSpeed), 0) /
            vTrips.length
          : 0,
    }
  }),
}))
</script>

<template>
  <Alert
    v-if="error"
    type="error"
    :message="t('fleet.loadError')"
    :description="String(error)"
  />

  <div
    v-else
    class="flex flex-col gap-6"
  >
    <!-- Header -->
    <div class="flex items-start justify-between flex-wrap gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 m-0">
          {{ t('fleet.title') }}
        </h1>
        <p class="text-gray-500 text-sm mt-1 mb-0">
          {{ t('fleet.subtitle') }}
        </p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <AIInsightsButton
          :active="showInsights"
          @click="showInsights = !showInsights"
        />
        <Select
          mode="multiple"
          :value="selectedCodes"
          class="min-w-55 max-w-100"
          max-tag-count="responsive"
          :placeholder="t('fleet.selectVehicles')"
          :options="vehicleOptions"
          @update:value="setSelectedCodes"
        />
        <RangePicker
          :value="dateRange"
          :allow-clear="false"
          :disabled-date="disabledDate"
          @calendar-change="
            (dates: unknown) => {
              if (Array.isArray(dates)) pickerDates = [dates[0] ?? null, dates[1] ?? null]
              else pickerDates = [null, null]
            }
          "
          @change="onDateRangeChange"
        />
      </div>
    </div>

    <!-- Stat cards -->
    <Row :gutter="[16, 16]">
      <Col
        :xs="12"
        :sm="6"
      >
        <StatCard
          :label="t('fleet.statTrips')"
          :value="String(tripList.length)"
          color-class="text-brand-primary"
          bg-color-class="bg-severity-info-bg"
          compact
        >
          <template #icon>
            <NodeIndexOutlined />
          </template>
        </StatCard>
      </Col>
      <Col
        :xs="12"
        :sm="6"
      >
        <StatCard
          :label="t('fleet.statDistance')"
          :value="`${totalDistance.toFixed(0)} km`"
          color-class="text-status-active"
          bg-color-class="bg-severity-positive-bg"
          compact
        >
          <template #icon>
            <DashboardOutlined />
          </template>
        </StatCard>
      </Col>
      <Col
        :xs="12"
        :sm="6"
      >
        <StatCard
          :label="t('fleet.statVehicles')"
          :value="String(uniqueVehicles)"
          color-class="text-status-idle"
          bg-color-class="bg-severity-warning-bg"
          compact
        >
          <template #icon>
            <CarOutlined />
          </template>
        </StatCard>
      </Col>
      <Col
        :xs="12"
        :sm="6"
      >
        <StatCard
          :label="t('fleet.statDrivers')"
          :value="String(uniqueDrivers)"
          color-class="text-accent-violet"
          bg-color-class="bg-accent-violet-bg"
          compact
        >
          <template #icon>
            <UserOutlined />
          </template>
        </StatCard>
      </Col>
    </Row>

    <!-- AI Insights -->
    <InsightCards
      module="fleet"
      :visible="showInsights"
      :data="insightData"
    />

    <!-- Trip table -->
    <TripTable
      :trips="tripList"
      :loading="isLoading"
    />
  </div>
</template>
