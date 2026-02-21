<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, Row, Col, Statistic, Skeleton, Table, Tag, Alert, Empty } from 'ant-design-vue'
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { useEcoDriving } from '@/api/composables'
import { EcoDrivingEventType, EcoDrivingSeverity } from '@/types/api'
import type { Vehicle, EcoDrivingEvent } from '@/types/api'

const INT_MIN = -2147483648

type EcoRow = EcoDrivingEvent & { key: string }

const { vehicle, from, to } = defineProps<{
  vehicle: Vehicle
  from: string
  to: string
}>()

const { t } = useI18n()

const {
  data: events,
  isLoading,
  error,
} = useEcoDriving(
  computed(() => vehicle.Code),
  computed(() => from),
  computed(() => to),
  computed(() => vehicle.IsEcoDrivingEnabled),
)

// --- Summary stats ---
const totalEvents = computed(() => events.value?.length ?? 0)

const severityCounts = computed(() => {
  const counts = { high: 0, medium: 0, low: 0 }
  for (const e of events.value ?? []) {
    if (e.EventSeverity === 3) counts.high++
    else if (e.EventSeverity === 2) counts.medium++
    else if (e.EventSeverity === 1) counts.low++
  }
  return counts
})

// --- Distribution by event type ---
const distributionData = computed(() => {
  const map = new Map<number, number>()
  for (const e of events.value ?? []) {
    map.set(e.EventType, (map.get(e.EventType) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([type, count]) => ({
      type,
      label: EcoDrivingEventType[type] ?? 'Unknown',
      count,
    }))
    .sort((a, b) => b.count - a.count)
})

const maxDistribution = computed(() =>
  Math.max(...distributionData.value.map((d) => d.count), 1),
)

// --- Table ---
function eventTypeName(type: number): string {
  return EcoDrivingEventType[type] ?? 'Unknown'
}

function severityName(sev: number): string {
  return EcoDrivingSeverity[sev] ?? 'None'
}

function severityColor(sev: number): string {
  if (sev === 3) return 'red'
  if (sev === 2) return 'orange'
  if (sev === 1) return 'green'
  return 'default'
}

function formatSpeed(speed: number): string {
  if (speed === INT_MIN || speed < 0) return '—'
  return `${speed} km/h`
}

const EVENT_TYPE_COLORS: Record<number, string> = {
  0: '#6b7280', // Unknown - gray
  1: '#3b82f6', // CorneringLeft - blue
  2: '#3b82f6', // CorneringRight - blue
  3: '#3b82f6', // Cornering - blue
  4: '#ef4444', // Acceleration - red
  5: '#f59e0b', // Braking - amber
  6: '#8b5cf6', // Bump - purple
  7: '#6b7280', // LongClutch - gray
  8: '#6b7280', // DriveOnNeutral - gray
  9: '#6b7280', // LongFreeWheel - gray
}

const columns = computed(() => [
  {
    title: t('health.ecoDriving.colTime'),
    key: 'time',
    width: 140,
    sorter: (a: EcoRow, b: EcoRow) => dayjs(a.Timestamp).unix() - dayjs(b.Timestamp).unix(),
    defaultSortOrder: 'descend' as const,
  },
  {
    title: t('health.ecoDriving.colType'),
    key: 'type',
    width: 160,
    filters: distributionData.value.map((d) => ({
      text: t(`health.ecoDriving.type.${d.label}`),
      value: d.type,
    })),
    onFilter: (value: number, record: EcoRow) => record.EventType === value,
  },
  {
    title: t('health.ecoDriving.colSeverity'),
    key: 'severity',
    width: 100,
    filters: [
      { text: t('health.ecoDriving.severity.High'), value: 3 },
      { text: t('health.ecoDriving.severity.Medium'), value: 2 },
      { text: t('health.ecoDriving.severity.Low'), value: 1 },
    ],
    onFilter: (value: number, record: EcoRow) => record.EventSeverity === value,
    sorter: (a: EcoRow, b: EcoRow) => a.EventSeverity - b.EventSeverity,
  },
  {
    title: t('health.ecoDriving.colSpeed'),
    key: 'speed',
    width: 100,
    sorter: (a: EcoRow, b: EcoRow) => {
      const sa = a.Speed === INT_MIN ? -1 : a.Speed
      const sb = b.Speed === INT_MIN ? -1 : b.Speed
      return sa - sb
    },
  },
  {
    title: t('health.ecoDriving.colValue'),
    key: 'value',
    width: 80,
    sorter: (a: EcoRow, b: EcoRow) => a.EventValue - b.EventValue,
  },
])

const dataSource = computed(() =>
  (events.value ?? []).map((e, i) => ({ ...e, key: `${e.Timestamp}-${i}` })),
)
</script>

<template>
  <!-- Not enabled -->
  <Card
    v-if="!vehicle.IsEcoDrivingEnabled"
    :body-style="{ padding: '16px' }"
  >
    <h2 class="text-base font-semibold text-gray-900 m-0 mb-3">
      {{ t('health.ecoDriving.title') }}
    </h2>
    <Empty :description="t('health.ecoDriving.notEnabled')" />
  </Card>

  <!-- Loading -->
  <div
    v-else-if="isLoading"
    class="flex flex-col gap-4"
  >
    <h2 class="text-base font-semibold text-gray-900 m-0">
      {{ t('health.ecoDriving.title') }}
    </h2>
    <Row :gutter="[16, 16]">
      <Col
        v-for="i in 4"
        :key="i"
        :xs="12"
        :sm="12"
        :lg="6"
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

  <!-- Error -->
  <div v-else-if="error">
    <h2 class="text-base font-semibold text-gray-900 m-0 mb-3">
      {{ t('health.ecoDriving.title') }}
    </h2>
    <Alert
      type="error"
      :message="t('health.loadError')"
      :description="String(error)"
    />
  </div>

  <!-- Content -->
  <div
    v-else
    class="flex flex-col gap-4"
  >
    <h2 class="text-base font-semibold text-gray-900 m-0">
      {{ t('health.ecoDriving.title') }}
    </h2>

    <!-- No events -->
    <Card
      v-if="totalEvents === 0"
      :body-style="{ padding: '16px' }"
    >
      <Empty :description="t('health.ecoDriving.noEvents')" />
    </Card>

    <template v-else>
      <!-- Stat cards -->
      <Row :gutter="[16, 16]">
        <Col
          :xs="12"
          :sm="12"
          :lg="6"
        >
          <Card :body-style="{ padding: '16px' }">
            <Statistic
              :title="t('health.ecoDriving.totalEvents')"
              :value="totalEvents"
            />
          </Card>
        </Col>
        <Col
          :xs="12"
          :sm="12"
          :lg="6"
        >
          <Card :body-style="{ padding: '16px' }">
            <Statistic
              :title="t('health.ecoDriving.highSeverity')"
              :value="severityCounts.high"
              :value-style="{ color: severityCounts.high > 0 ? '#ef4444' : '#d1d5db' }"
            >
              <template #prefix>
                <WarningOutlined />
              </template>
            </Statistic>
          </Card>
        </Col>
        <Col
          :xs="12"
          :sm="12"
          :lg="6"
        >
          <Card :body-style="{ padding: '16px' }">
            <Statistic
              :title="t('health.ecoDriving.mediumSeverity')"
              :value="severityCounts.medium"
              :value-style="{ color: severityCounts.medium > 0 ? '#f59e0b' : '#d1d5db' }"
            >
              <template #prefix>
                <ExclamationCircleOutlined />
              </template>
            </Statistic>
          </Card>
        </Col>
        <Col
          :xs="12"
          :sm="12"
          :lg="6"
        >
          <Card :body-style="{ padding: '16px' }">
            <Statistic
              :title="t('health.ecoDriving.lowSeverity')"
              :value="severityCounts.low"
              :value-style="{ color: severityCounts.low > 0 ? '#22c55e' : '#d1d5db' }"
            >
              <template #prefix>
                <InfoCircleOutlined />
              </template>
            </Statistic>
          </Card>
        </Col>
      </Row>

      <!-- Distribution bar chart (CSS-only) -->
      <Card :body-style="{ padding: '20px' }">
        <h3 class="text-sm font-semibold text-gray-900 m-0 mb-4">
          {{ t('health.ecoDriving.distribution') }}
        </h3>
        <div class="flex flex-col gap-2.5">
          <div
            v-for="d in distributionData"
            :key="d.type"
            class="flex items-center gap-3"
          >
            <span class="text-sm text-gray-600 w-36 shrink-0 text-right">
              {{ t(`health.ecoDriving.type.${d.label}`) }}
            </span>
            <div class="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
              <div
                class="h-full rounded transition-all duration-300"
                :style="{
                  width: `${(d.count / maxDistribution) * 100}%`,
                  backgroundColor: EVENT_TYPE_COLORS[d.type] ?? '#6b7280',
                  minWidth: '24px',
                }"
              />
            </div>
            <span class="text-sm font-medium text-gray-700 w-8 text-right">
              {{ d.count }}
            </span>
          </div>
        </div>
      </Card>

      <!-- Event table -->
      <div>
        <h3 class="text-sm font-semibold text-gray-900 m-0 mb-3">
          {{ t('health.ecoDriving.eventList') }}
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
          :scroll="{ x: 600 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'time'">
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
                {{ t(`health.ecoDriving.type.${eventTypeName(record.EventType)}`) }}
              </Tag>
            </template>

            <template v-else-if="column.key === 'severity'">
              <Tag
                :color="severityColor(record.EventSeverity)"
                class="m-0"
              >
                {{ t(`health.ecoDriving.severity.${severityName(record.EventSeverity)}`) }}
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
      </div>
    </template>
  </div>
</template>
