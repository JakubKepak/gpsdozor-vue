<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Alert, Card, DatePicker, Row, Col, Statistic, Skeleton } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { useVehicle, useVehicleSensors } from '@/api/composables'
import type { SensorItem } from '@/types/api'
import LineChartCard from '@/components/LineChartCard.vue'
import VehicleTripEconomics from '@/views/health/VehicleTripEconomics.vue'

const { RangePicker } = DatePicker

const MAX_RANGE_DAYS = 30
const SENSOR_TYPES = [
  'ExternalBatteryVoltage',
  'CoolingLiquidTemperature',
  'Rpm',
  'Speed',
  'FuelConsumedTotal',
]

const SENSOR_COLORS: Record<string, string> = {
  ExternalBatteryVoltage: '#3b82f6',
  CoolingLiquidTemperature: '#ef4444',
  Rpm: '#f59e0b',
  Speed: '#22c55e',
  FuelConsumedTotal: '#8b5cf6',
}

const SENSOR_UNITS: Record<string, string> = {
  ExternalBatteryVoltage: 'V',
  CoolingLiquidTemperature: '°C',
  Rpm: 'RPM',
  Speed: 'km/h',
  FuelConsumedTotal: 'L',
}

function getGaugeColor(sensorName: string, value: number): string {
  switch (sensorName) {
    case 'ExternalBatteryVoltage':
      if (value < 12) return '#ef4444'
      if (value < 12.5) return '#f59e0b'
      return '#22c55e'
    case 'CoolingLiquidTemperature':
      if (value > 110) return '#ef4444'
      if (value > 100) return '#f59e0b'
      return '#22c55e'
    case 'Rpm':
      if (value > 3500) return '#ef4444'
      if (value > 2500) return '#f59e0b'
      return '#22c55e'
    default:
      return '#3b82f6'
  }
}

function getLastReading(sensor: SensorItem | undefined): number | null {
  if (!sensor || sensor.data.length === 0) return null
  return sensor.data[sensor.data.length - 1].v
}

const route = useRoute()
const { t } = useI18n()

const vehicleCode = computed(() => String(route.params.vehicleCode ?? ''))

// Date range
const dateRange = ref<[Dayjs, Dayjs]>([dayjs().subtract(7, 'day'), dayjs()])
const pickerDates = ref<[Dayjs | null, Dayjs | null]>([null, null])

function handleDateChange(dates: unknown) {
  if (Array.isArray(dates) && dates[0] && dates[1]) {
    const from = dayjs(dates[0])
    const to = dayjs(dates[1])
    if (from.isValid() && to.isValid()) {
      dateRange.value = [from, to]
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
const { data: vehicle, isLoading: vehicleLoading, error: vehicleError } = useVehicle(vehicleCode)

const from = computed(() => dateRange.value[0].format('YYYY-MM-DDTHH:mm:ss'))
const to = computed(() => dateRange.value[1].format('YYYY-MM-DDTHH:mm:ss'))

const { data: sensorResponse, isLoading: sensorsLoading } = useVehicleSensors(
  vehicleCode,
  SENSOR_TYPES,
  from,
  to,
)

const sensors = computed(() => sensorResponse.value?.items ?? [])

const gaugeCards = computed(() => {
  const items: { name: string; value: number | null; unit: string }[] = []
  for (const name of SENSOR_TYPES) {
    const sensor = sensors.value.find(s => s.name === name)
    items.push({
      name,
      value: getLastReading(sensor),
      unit: SENSOR_UNITS[name] ?? '',
    })
  }
  return items
})
</script>

<template>
  <Alert
    v-if="vehicleError"
    type="error"
    :message="t('health.loadError')"
    :description="String(vehicleError)"
  />

  <div
    v-else
    class="flex flex-col gap-6"
  >
    <!-- Header -->
    <div>
      <RouterLink
        to="/health"
        class="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-3"
      >
        <ArrowLeftOutlined class="text-xs" />
        {{ t('health.backToList') }}
      </RouterLink>
      <div class="flex items-start justify-between flex-wrap gap-4">
        <Skeleton
          v-if="vehicleLoading"
          active
          :paragraph="{ rows: 1 }"
        />
        <div v-else-if="vehicle">
          <h1 class="text-2xl font-bold text-gray-900 m-0">
            {{ vehicle.Name }}
          </h1>
          <p class="text-gray-500 text-sm mt-1 mb-0">
            {{ vehicle.SPZ }} · {{ vehicle.BranchName }}
          </p>
        </div>
        <RangePicker
          :value="dateRange"
          :allow-clear="false"
          :disabled-date="disabledDate"
          @calendar-change="(dates: unknown) => { if (Array.isArray(dates)) pickerDates = [dates[0] ?? null, dates[1] ?? null]; else pickerDates = [null, null] }"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- Gauge cards -->
    <Row :gutter="[16, 16]">
      <template v-if="vehicleLoading">
        <Col
          v-for="i in 5"
          :key="i"
          :xs="12"
          :sm="8"
          :lg="4"
        >
          <Card :body-style="{ padding: '16px' }">
            <Skeleton
              active
              :paragraph="{ rows: 1 }"
            />
          </Card>
        </Col>
      </template>
      <template v-else>
        <Col
          :xs="12"
          :sm="8"
          :lg="4"
        >
          <Card :body-style="{ padding: '16px' }">
            <Statistic
              :title="t('health.colOdometer')"
              :value="vehicle ? (vehicle.Odometer / 1000).toFixed(0) : 0"
              suffix="k km"
            />
          </Card>
        </Col>
        <Col
          :xs="12"
          :sm="8"
          :lg="4"
        >
          <Card :body-style="{ padding: '16px' }">
            <Statistic
              :title="t('health.sensor.Speed')"
              :value="vehicle?.Speed ?? 0"
              suffix="km/h"
              :value-style="vehicle && vehicle.Speed > 0 ? { color: '#22c55e' } : undefined"
            />
          </Card>
        </Col>
        <Col
          v-for="g in gaugeCards"
          :key="g.name"
          :xs="12"
          :sm="8"
          :lg="4"
        >
          <Card :body-style="{ padding: '16px' }">
            <Skeleton
              v-if="sensorsLoading"
              active
              :paragraph="{ rows: 1 }"
            />
            <Statistic
              v-else
              :title="t(`health.sensor.${g.name}`)"
              :value="g.value ?? '—'"
              :suffix="g.value !== null ? g.unit : undefined"
              :value-style="g.value !== null ? { color: getGaugeColor(g.name, g.value) } : { color: '#d1d5db' }"
            />
          </Card>
        </Col>
      </template>
    </Row>

    <!-- Trip economics -->
    <VehicleTripEconomics
      v-if="vehicle"
      :vehicle="vehicle"
      :from="from"
      :to="to"
    />

    <!-- Sensor charts -->
    <h2 class="text-base font-semibold text-gray-900 m-0">
      {{ t('health.sensorHistory') }}
    </h2>

    <Row
      v-if="sensorsLoading"
      :gutter="[16, 16]"
    >
      <Col
        v-for="i in 4"
        :key="i"
        :xs="24"
        :lg="12"
      >
        <Card :body-style="{ padding: '20px' }">
          <div class="h-4 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
          <div class="h-48 bg-gray-100 rounded animate-pulse" />
        </Card>
      </Col>
    </Row>

    <Row
      v-else
      :gutter="[16, 16]"
    >
      <Col
        v-for="name in SENSOR_TYPES"
        :key="name"
        :xs="24"
        :lg="12"
      >
        <template v-if="sensors.find(s => s.name === name)?.data.length">
          <LineChartCard
            :title="t(`health.sensor.${name}`)"
            :data="sensors.find(s => s.name === name)!.data.map(d => ({ time: d.t, value: d.v }))"
            x-key="time"
            y-key="value"
            :y-unit="SENSOR_UNITS[name] ?? ''"
            :color="SENSOR_COLORS[name] ?? '#3b82f6'"
            :x-formatter="(v: string) => dayjs(v).format('MM-DD HH:mm')"
          />
        </template>
        <Card
          v-else
          :body-style="{ padding: '20px' }"
        >
          <h3 class="text-sm font-semibold text-gray-900 m-0 mb-4">
            {{ t(`health.sensor.${name}`) }}
          </h3>
          <div class="h-48 flex items-center justify-center text-gray-400 text-sm">
            {{ t('health.noSensorData') }}
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>
