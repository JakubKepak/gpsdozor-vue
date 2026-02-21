<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Alert, Card, DatePicker, Select, Row, Col, Empty } from 'ant-design-vue'
import {
  ThunderboltOutlined,
  WarningOutlined,
  CarOutlined,
  DashboardOutlined,
} from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { useGroups, useVehicles, useAllVehicleEcoDriving } from '@/api/composables'
import type { EcoEventWithVehicle } from './constants'
import { useQueryParam, useSetQueryParams } from '@/composables/useQueryParam'
import { useLocale } from '@/composables/useLocale'
import StatCard from '@/components/StatCard.vue'
import AIInsightsButton from '@/components/AIInsightsButton.vue'
import InsightCards from '@/components/InsightCards.vue'
import EcoRankingTable from '@/views/eco-driving/EcoRankingTable.vue'
import EcoDistributionChart from '@/views/eco-driving/EcoDistributionChart.vue'
import EcoEventLog from '@/views/eco-driving/EcoEventLog.vue'
import EcoEventMap from '@/views/eco-driving/EcoEventMap.vue'

const { RangePicker } = DatePicker

const MAX_RANGE_DAYS = 30
const DATE_FORMAT = 'YYYY-MM-DD'

const { t } = useI18n()
const { dateFormat } = useLocale()

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

onMounted(() => {
  if (!fromParam.value || !toParam.value) {
    const [from, to] = parseDateRange()
    setQueryParams({
      from: from.format(DATE_FORMAT),
      to: to.format(DATE_FORMAT),
    })
  }
})

const pickerDates = ref<[Dayjs | null, Dayjs | null]>([null, null])

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

const ecoEnabledVehicles = computed(() =>
  (vehicles.value ?? []).filter((v) => v.IsEcoDrivingEnabled),
)

const selectedCodes = computed(() => {
  if (vehiclesParam.value) {
    const codes = vehiclesParam.value.split(',').filter(Boolean)
    if (codes.length > 0) return codes
  }
  return ecoEnabledVehicles.value.map((v) => v.Code)
})

function setSelectedCodes(codes: unknown) {
  if (!Array.isArray(codes) || codes.length === 0) return
  setVehiclesParam(codes.join(','))
}

const vehicleOptions = computed(() =>
  ecoEnabledVehicles.value.map((v) => ({ value: v.Code, label: `${v.Name} (${v.SPZ})` })),
)

// --- Eco-driving data ---
const selectedVehicles = computed(() =>
  (vehicles.value ?? []).filter((v) => selectedCodes.value.includes(v.Code)),
)

const from = computed(() => dateRange.value[0].format('YYYY-MM-DDTHH:mm:ss'))
const to = computed(() => dateRange.value[1].format('YYYY-MM-DDTHH:mm:ss'))

const ecoResult = useAllVehicleEcoDriving(selectedVehicles, from, to)

const events = computed(() => ecoResult.value.data)
const ecoLoading = computed(() => ecoResult.value.isLoading)
const error = computed(() => ecoResult.value.error)

const isLoading = computed(() => groupsLoading.value || vehiclesLoading.value || ecoLoading.value)

// --- Stats ---
const totalEvents = computed(() => events.value.length)

const severityCounts = computed(() => {
  const counts = { high: 0, medium: 0, low: 0 }
  for (const e of events.value) {
    if (e.EventSeverity === 3) counts.high++
    else if (e.EventSeverity === 2) counts.medium++
    else if (e.EventSeverity === 1) counts.low++
  }
  return counts
})

const analyzedVehicleCount = computed(() =>
  new Set(events.value.map((e: EcoEventWithVehicle) => e.vehicleCode)).size,
)

// --- Scoring / Ranking ---
const vehicleRankings = computed(() => {
  const vehicleMap = new Map<
    string,
    {
      vehicleName: string
      vehicleSPZ: string
      vehicleCode: string
      total: number
      high: number
      medium: number
      low: number
      byType: Map<number, number>
    }
  >()

  for (const e of events.value) {
    let entry = vehicleMap.get(e.vehicleCode)
    if (!entry) {
      entry = {
        vehicleName: e.vehicleName,
        vehicleSPZ: e.vehicleSPZ,
        vehicleCode: e.vehicleCode,
        total: 0,
        high: 0,
        medium: 0,
        low: 0,
        byType: new Map(),
      }
      vehicleMap.set(e.vehicleCode, entry)
    }
    entry.total++
    if (e.EventSeverity === 3) entry.high++
    else if (e.EventSeverity === 2) entry.medium++
    else if (e.EventSeverity === 1) entry.low++
    entry.byType.set(e.EventType, (entry.byType.get(e.EventType) ?? 0) + 1)
  }

  return [...vehicleMap.values()]
    .map((v) => ({
      ...v,
      rawScore: v.high * 3 + v.medium * 2 + v.low * 1,
      byType: [...v.byType.entries()].map(([type, count]) => ({ type, count })),
    }))
    .sort((a, b) => a.rawScore - b.rawScore)
})

const avgScore = computed(() => {
  if (vehicleRankings.value.length === 0) return 0
  const total = vehicleRankings.value.reduce((sum, v) => sum + v.rawScore, 0)
  return Math.round((total / vehicleRankings.value.length) * 10) / 10
})

// --- AI Insights ---
const insightData = computed(() => ({
  totalEvents: totalEvents.value,
  severityCounts: severityCounts.value,
  analyzedVehicles: analyzedVehicleCount.value,
  avgScore: avgScore.value,
  rankings: vehicleRankings.value.map((v) => ({
    name: v.vehicleName,
    spz: v.vehicleSPZ,
    total: v.total,
    high: v.high,
    medium: v.medium,
    low: v.low,
    score: v.rawScore,
  })),
}))
</script>

<template>
  <Alert
    v-if="error"
    type="error"
    :message="t('ecoDriving.loadError')"
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
          {{ t('ecoDriving.title') }}
        </h1>
        <p class="text-gray-500 text-sm mt-1 mb-0">
          {{ t('ecoDriving.subtitle') }}
        </p>
      </div>
      <AIInsightsButton
        :active="showInsights"
        @click="showInsights = !showInsights"
      />
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-3 flex-wrap">
      <Select
        mode="multiple"
        :value="selectedCodes"
        :class="['min-w-60 flex-1', { 'hide-tag-close': selectedCodes.length <= 1 }]"
        max-tag-count="responsive"
        option-filter-prop="label"
        :placeholder="t('ecoDriving.selectVehicles')"
        :options="vehicleOptions"
        @update:value="setSelectedCodes"
      />
      <RangePicker
        :value="dateRange"
        :format="dateFormat"
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

    <!-- Hero event map -->
    <Card
      v-if="totalEvents > 0"
      :body-style="{ padding: 0 }"
    >
      <div class="px-5 pt-5 pb-2">
        <h3 class="text-sm font-semibold text-gray-900 m-0">
          {{ t('ecoDriving.eventMap') }}
        </h3>
        <p class="text-xs text-gray-400 mt-0.5 mb-0">
          {{ t('ecoDriving.eventMapSubtitle') }}
        </p>
      </div>

      <div class="px-5 pb-5">
        <EcoEventMap :events="events" />
      </div>
    </Card>

    <!-- Stat cards -->
    <Row :gutter="[16, 16]">
      <Col
        :xs="12"
        :sm="6"
      >
        <StatCard
          :label="t('ecoDriving.statTotalEvents')"
          :value="String(totalEvents)"
          color-class="text-severity-critical"
          bg-color-class="bg-severity-critical-bg"
          compact
        >
          <template #icon>
            <ThunderboltOutlined />
          </template>
        </StatCard>
      </Col>
      <Col
        :xs="12"
        :sm="6"
      >
        <StatCard
          :label="t('ecoDriving.statHighSeverity')"
          :value="String(severityCounts.high)"
          color-class="text-status-offline"
          bg-color-class="bg-severity-critical-bg"
          compact
        >
          <template #icon>
            <WarningOutlined />
          </template>
        </StatCard>
      </Col>
      <Col
        :xs="12"
        :sm="6"
      >
        <StatCard
          :label="t('ecoDriving.statVehicles')"
          :value="String(analyzedVehicleCount)"
          color-class="text-brand-primary"
          bg-color-class="bg-severity-info-bg"
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
          :label="t('ecoDriving.statAvgScore')"
          :value="String(avgScore)"
          color-class="text-status-active"
          bg-color-class="bg-severity-positive-bg"
          compact
        >
          <template #icon>
            <DashboardOutlined />
          </template>
        </StatCard>
      </Col>
    </Row>

    <!-- AI Insights -->
    <InsightCards
      module="eco-driving"
      :visible="showInsights"
      :data="insightData"
      @close="showInsights = false"
    />

    <!-- No events -->
    <Empty
      v-if="!isLoading && totalEvents === 0"
      :description="t('ecoDriving.noEvents')"
    />

    <template v-if="totalEvents > 0">
      <!-- Vehicle ranking -->
      <EcoRankingTable
        :rankings="vehicleRankings"
        :loading="isLoading"
      />

      <!-- Fleet distribution -->
      <EcoDistributionChart :events="events" />

      <!-- Combined event log -->
      <EcoEventLog
        :events="events"
        :loading="isLoading"
      />
    </template>
  </div>
</template>

<style scoped>
.hide-tag-close :deep(.ant-select-selection-item-remove) {
  display: none;
}
</style>
