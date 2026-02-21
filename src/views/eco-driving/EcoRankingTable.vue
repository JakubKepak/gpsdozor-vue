<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, Table, Tag } from 'ant-design-vue'
import { EcoDrivingEventType } from '@/types/api'
import { EVENT_TYPE_COLORS, type VehicleRanking } from './constants'

type RankingRow = VehicleRanking & { key: string; rank: number }

const { rankings, loading = false } = defineProps<{
  rankings: VehicleRanking[]
  loading?: boolean
}>()

const { t } = useI18n()

function scoreColor(score: number): string {
  if (score < 10) return 'green'
  if (score < 30) return 'orange'
  return 'red'
}

const columns = computed(() => [
  { title: t('ecoDriving.colRank'), key: 'rank', width: 60 },
  {
    title: t('ecoDriving.colVehicle'),
    key: 'vehicle',
    width: 180,
    sorter: (a: RankingRow, b: RankingRow) => a.vehicleName.localeCompare(b.vehicleName),
  },
  {
    title: t('ecoDriving.colTotalEvents'),
    key: 'total',
    width: 80,
    sorter: (a: RankingRow, b: RankingRow) => a.total - b.total,
  },
  {
    title: t('ecoDriving.colHigh'),
    key: 'high',
    width: 70,
    sorter: (a: RankingRow, b: RankingRow) => a.high - b.high,
  },
  {
    title: t('ecoDriving.colMedium'),
    key: 'medium',
    width: 80,
    sorter: (a: RankingRow, b: RankingRow) => a.medium - b.medium,
  },
  {
    title: t('ecoDriving.colLow'),
    key: 'low',
    width: 70,
    sorter: (a: RankingRow, b: RankingRow) => a.low - b.low,
  },
  {
    title: t('ecoDriving.colScore'),
    key: 'score',
    width: 100,
    sorter: (a: RankingRow, b: RankingRow) => a.rawScore - b.rawScore,
    defaultSortOrder: 'ascend' as const,
  },
  { title: t('ecoDriving.colDistribution'), key: 'distribution', width: 160 },
])

const dataSource = computed(() =>
  rankings.map((r, i) => ({ ...r, key: r.vehicleCode, rank: i + 1 })),
)
</script>

<template>
  <Card :body-style="{ padding: '20px' }">
    <h3 class="text-sm font-semibold text-gray-900 m-0 mb-4">
      {{ t('ecoDriving.rankingTitle') }}
    </h3>
    <Table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="false"
      size="small"
      :scroll="{ x: 800 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'rank'">
          <span class="text-sm font-medium text-gray-500">{{ record.rank }}</span>
        </template>

        <template v-else-if="column.key === 'vehicle'">
          <div>
            <div class="font-medium text-gray-900 text-sm">
              {{ record.vehicleName }}
            </div>
            <div class="text-xs text-gray-400">
              {{ record.vehicleSPZ }}
            </div>
          </div>
        </template>

        <template v-else-if="column.key === 'total'">
          <span class="text-sm">{{ record.total }}</span>
        </template>

        <template v-else-if="column.key === 'high'">
          <span :class="['text-sm', record.high > 0 ? 'text-red-500 font-medium' : 'text-gray-400']">
            {{ record.high }}
          </span>
        </template>

        <template v-else-if="column.key === 'medium'">
          <span :class="['text-sm', record.medium > 0 ? 'text-amber-500 font-medium' : 'text-gray-400']">
            {{ record.medium }}
          </span>
        </template>

        <template v-else-if="column.key === 'low'">
          <span :class="['text-sm', record.low > 0 ? 'text-green-500 font-medium' : 'text-gray-400']">
            {{ record.low }}
          </span>
        </template>

        <template v-else-if="column.key === 'score'">
          <Tag
            :color="scoreColor(record.rawScore)"
            class="m-0"
          >
            {{ record.rawScore }}
          </Tag>
        </template>

        <template v-else-if="column.key === 'distribution'">
          <div
            v-if="record.total > 0"
            class="flex h-4 rounded overflow-hidden bg-gray-100 min-w-24"
          >
            <div
              v-for="seg in record.byType"
              :key="seg.type"
              :style="{
                width: `${(seg.count / record.total) * 100}%`,
                backgroundColor: EVENT_TYPE_COLORS[seg.type] ?? '#6b7280',
              }"
              :title="`${t(`ecoDriving.type.${EcoDrivingEventType[seg.type] ?? 'Unknown'}`)} : ${seg.count}`"
            />
          </div>
          <span
            v-else
            class="text-gray-300"
          >—</span>
        </template>
      </template>
    </Table>
  </Card>
</template>
