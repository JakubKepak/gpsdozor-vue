<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Alert, Card, Row, Col } from 'ant-design-vue'
import { CarOutlined, PauseCircleOutlined, ToolOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { useGroups } from '@/api/composables/useGroups'
import { useVehicles } from '@/api/composables/useVehicles'
import { getEffectiveSpeed } from '@/utils/vehicle'
import StatCard from '@/components/StatCard.vue'
import AIInsightsButton from '@/components/AIInsightsButton.vue'
import InsightCards from '@/components/InsightCards.vue'
import DashboardSkeleton from './DashboardSkeleton.vue'
import FleetMap from './FleetMap.vue'
import RecentAlerts from './RecentAlerts.vue'
import VehicleList from './VehicleList.vue'

const { t } = useI18n()

const focusedVehicleCode = ref<string | null>(null)
const showInsights = ref(false)

const { data: groups, isLoading: groupsLoading } = useGroups()
const groupCode = computed(() => groups.value?.[0]?.Code ?? '')
const { data: vehicles, isLoading: vehiclesLoading, error } = useVehicles(groupCode)

const stats = computed(() => {
  const list = vehicles.value ?? []
  const active = list.filter((v) => getEffectiveSpeed(v) > 0).length
  const idle = list.filter((v) => getEffectiveSpeed(v) === 0 && v.IsActive).length
  const inactive = list.filter((v) => !v.IsActive).length
  return { active, idle, inactive, total: list.length }
})

const insightData = computed(() => ({
  active: stats.value.active,
  idle: stats.value.idle,
  inactive: stats.value.inactive,
  total: stats.value.total,
}))
</script>

<template>
  <DashboardSkeleton v-if="groupsLoading || vehiclesLoading" />

  <Alert
    v-else-if="error"
    type="error"
    :message="t('dashboard.loadError')"
    :description="String(error)"
  />

  <div
    v-else
    class="flex flex-col h-[calc(100vh-3rem)]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between flex-wrap gap-4 mb-6 shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 m-0">
          {{ t('dashboard.title') }}
        </h1>
        <p class="text-gray-500 text-sm mt-1 mb-0">
          {{ t('dashboard.subtitle') }}
        </p>
      </div>
      <AIInsightsButton
        :active="showInsights"
        @click="showInsights = !showInsights"
      />
    </div>

    <!-- Stat cards -->
    <Row
      :gutter="[16, 16]"
      class="shrink-0"
    >
      <Col
        :xs="12"
        :sm="12"
        :lg="6"
      >
        <StatCard
          :label="t('dashboard.activeVehicles')"
          :value="stats.active"
          :subtitle="t('dashboard.activeSubtitle')"
          color-class="text-status-active"
          bg-color-class="bg-severity-positive-bg"
        >
          <template #icon>
            <CarOutlined />
          </template>
        </StatCard>
      </Col>
      <Col
        :xs="12"
        :sm="12"
        :lg="6"
      >
        <StatCard
          :label="t('dashboard.idleVehicles')"
          :value="stats.idle"
          :subtitle="t('dashboard.idleSubtitle')"
          color-class="text-status-idle"
          bg-color-class="bg-severity-warning-bg"
        >
          <template #icon>
            <PauseCircleOutlined />
          </template>
        </StatCard>
      </Col>
      <Col
        :xs="12"
        :sm="12"
        :lg="6"
      >
        <StatCard
          :label="t('dashboard.maintenance')"
          :value="stats.inactive"
          :subtitle="t('dashboard.maintenanceSubtitle')"
          color-class="text-status-offline"
          bg-color-class="bg-severity-critical-bg"
        >
          <template #icon>
            <ToolOutlined />
          </template>
        </StatCard>
      </Col>
      <Col
        :xs="12"
        :sm="12"
        :lg="6"
      >
        <StatCard
          :label="t('dashboard.totalFleet')"
          :value="stats.total"
          :subtitle="t('dashboard.totalSubtitle')"
          color-class="text-brand-primary"
          bg-color-class="bg-severity-info-bg"
        >
          <template #icon>
            <TeamOutlined />
          </template>
        </StatCard>
      </Col>
    </Row>

    <!-- AI Insights -->
    <div
      v-if="showInsights"
      class="mt-6 shrink-0"
    >
      <InsightCards
        module="dashboard"
        :data="insightData"
        :visible="showInsights"
        @close="showInsights = false"
      />
    </div>

    <!-- Map + Sidebar -->
    <Row
      :gutter="[16, 16]"
      class="mt-6 flex-1 min-h-0"
    >
      <Col
        :xs="24"
        :lg="16"
        class="h-full"
      >
        <Card
          class="h-full"
          :body-style="{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }"
        >
          <div class="px-4 pt-4 pb-2 shrink-0">
            <h2 class="text-base font-semibold text-gray-900 m-0">
              {{ t('dashboard.liveMap') }}
            </h2>
            <p class="text-gray-400 text-xs mt-0.5 mb-0">
              {{ t('dashboard.liveMapSubtitle') }}
            </p>
          </div>
          <div class="flex-1 min-h-0 px-4 pb-4">
            <FleetMap
              :vehicles="vehicles ?? []"
              :focused-vehicle-code="focusedVehicleCode"
              @focus-handled="focusedVehicleCode = null"
            />
          </div>
        </Card>
      </Col>
      <Col
        :xs="24"
        :lg="8"
        class="h-full"
      >
        <div class="flex flex-col gap-4 h-full overflow-auto">
          <RecentAlerts :vehicles="vehicles ?? []" />
          <VehicleList
            :vehicles="vehicles ?? []"
            @locate="focusedVehicleCode = $event"
          />
        </div>
      </Col>
    </Row>
  </div>
</template>
