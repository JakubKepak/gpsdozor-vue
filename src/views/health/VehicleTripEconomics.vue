<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, Row, Col, Statistic, Skeleton } from 'ant-design-vue'
import { useTrips } from '@/api/composables'
import type { Vehicle } from '@/types/api'
import { computeVehicleEconomics, computeDailyFuel } from '@/views/health/computeVehicleEconomics'
import LineChartCard from '@/components/LineChartCard.vue'
import EconomicsTripTable from '@/views/health/EconomicsTripTable.vue'

const { vehicle, from, to } = defineProps<{
  vehicle: Vehicle
  from: string
  to: string
}>()

const { t } = useI18n()

const { data: trips, isLoading } = useTrips(
  computed(() => vehicle.Code),
  computed(() => from),
  computed(() => to),
)

const economics = computed(() => {
  if (!trips.value) return null
  return computeVehicleEconomics(vehicle, trips.value)
})

const dailyData = computed(() => {
  if (!trips.value) return []
  return computeDailyFuel(trips.value)
})
</script>

<template>
  <!-- Loading state -->
  <div
    v-if="isLoading"
    class="flex flex-col gap-4"
  >
    <h2 class="text-base font-semibold text-gray-900 m-0">
      {{ t('health.tripEconomics') }}
    </h2>
    <Row :gutter="[16, 16]">
      <Col
        v-for="i in 6"
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
    </Row>
  </div>

  <!-- Content -->
  <div
    v-else-if="economics && economics.totalTrips > 0"
    class="flex flex-col gap-4"
  >
    <h2 class="text-base font-semibold text-gray-900 m-0">
      {{ t('health.tripEconomics') }}
    </h2>

    <!-- Stat cards -->
    <Row :gutter="[16, 16]">
      <Col
        :xs="12"
        :sm="8"
        :lg="4"
      >
        <Card :body-style="{ padding: '16px' }">
          <Statistic
            :title="t('health.totalTrips')"
            :value="economics.totalTrips"
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
            :title="t('health.colTotalDistance')"
            :value="economics.totalDistance.toFixed(0)"
            suffix="km"
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
            :title="t('health.totalFuelCard')"
            :value="economics.hasFuelData ? economics.totalFuel.toFixed(1) : '—'"
            :suffix="economics.hasFuelData ? 'L' : undefined"
            :value-style="!economics.hasFuelData ? { color: '#d1d5db' } : undefined"
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
            :title="t('health.fuelEfficiencyCard')"
            :value="economics.hasFuelData ? economics.fuelPer100km.toFixed(1) : '—'"
            :suffix="economics.hasFuelData ? 'L/100km' : undefined"
            :value-style="
              !economics.hasFuelData
                ? { color: '#d1d5db' }
                : {
                    color:
                      economics.fuelPer100km > 15
                        ? '#ef4444'
                        : economics.fuelPer100km > 10
                          ? '#f59e0b'
                          : '#22c55e',
                  }
            "
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
            :title="t('health.totalCostCard')"
            :value="economics.totalCost > 0 ? economics.totalCost.toFixed(0) : '—'"
            :suffix="economics.totalCost > 0 ? 'CZK' : undefined"
            :value-style="economics.totalCost === 0 ? { color: '#d1d5db' } : undefined"
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
            :title="t('health.driversCard')"
            :value="economics.drivers.length > 0 ? economics.drivers.join(', ') : '—'"
            :value-style="
              economics.drivers.length > 0 ? { fontSize: '16px' } : { color: '#d1d5db' }
            "
          />
        </Card>
      </Col>
    </Row>

    <!-- Trend charts -->
    <Row
      v-if="dailyData.length > 1"
      :gutter="[16, 16]"
    >
      <Col
        v-if="economics.hasFuelData"
        :xs="24"
        :lg="12"
      >
        <LineChartCard
          :title="t('health.fuelTrend')"
          :data="dailyData"
          y-key="efficiency"
          y-unit="L/100"
          color="#3b82f6"
        />
      </Col>
      <Col
        :xs="24"
        :lg="economics.hasFuelData ? 12 : 24"
      >
        <LineChartCard
          :title="t('health.distanceTrend')"
          :data="dailyData"
          y-key="distance"
          y-unit="km"
          color="#22c55e"
        />
      </Col>
    </Row>

    <!-- Trip table -->
    <EconomicsTripTable :trips="trips ?? []" />
  </div>
</template>
