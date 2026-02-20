<script setup lang="ts">
import { h, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, Row, Col, Skeleton, Alert } from 'ant-design-vue'
import {
  BulbOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue'
import { useAIInsights } from '@/api/composables/useAIInsights'
import type { InsightModule, InsightSeverity } from '@/types/insights'

const { module, data, visible } = defineProps<{
  module: InsightModule
  data: Record<string, unknown> | null
  visible: boolean
}>()

const { t } = useI18n()
const dataRef = computed(() => data)
const visibleRef = computed(() => visible)
const { data: response, isLoading, error } = useAIInsights(module, dataRef, visibleRef)

const severityConfig: Record<InsightSeverity, { color: string; bgColor: string; icon: () => ReturnType<typeof h> }> = {
  info:     { color: '#3b82f6', bgColor: '#eff6ff',  icon: () => h(BulbOutlined) },
  warning:  { color: '#f59e0b', bgColor: '#fffbeb',  icon: () => h(WarningOutlined) },
  critical: { color: '#ef4444', bgColor: '#fef2f2',  icon: () => h(CloseCircleOutlined) },
  positive: { color: '#22c55e', bgColor: '#f0fdf4',  icon: () => h(CheckCircleOutlined) },
}
</script>

<template>
  <div v-if="visible && data">
    <!-- Loading -->
    <Row
      v-if="isLoading"
      :gutter="[16, 16]"
    >
      <Col
        v-for="i in 2"
        :key="i"
        :xs="24"
        :lg="12"
      >
        <Card :body-style="{ padding: '16px' }">
          <Skeleton
            active
            :title="{ width: '40%' }"
            :paragraph="{ rows: 3, width: ['100%', '80%', '60%'] }"
          />
        </Card>
      </Col>
    </Row>

    <!-- Error -->
    <Alert
      v-else-if="error"
      type="info"
      :message="t('insights.error')"
      show-icon
      closable
    />

    <!-- Results -->
    <div v-else-if="response?.insights?.length">
      <div class="flex items-center gap-2 mb-3">
        <BulbOutlined class="text-blue-500" />
        <span class="text-sm font-medium text-gray-500">{{ t('insights.title') }}</span>
      </div>
      <Row :gutter="[16, 16]">
        <Col
          v-for="(insight, i) in response.insights"
          :key="i"
          :xs="24"
          :lg="12"
        >
          <Card
            class="h-full"
            :body-style="{ padding: '16px', borderLeft: `3px solid ${(severityConfig[insight.severity] ?? severityConfig.info).color}` }"
          >
            <div class="flex items-start gap-3">
              <div
                class="flex items-center justify-center w-8 h-8 rounded-lg text-sm shrink-0"
                :style="{
                  color: (severityConfig[insight.severity] ?? severityConfig.info).color,
                  backgroundColor: (severityConfig[insight.severity] ?? severityConfig.info).bgColor,
                }"
              >
                <component :is="(severityConfig[insight.severity] ?? severityConfig.info).icon" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="text-sm font-semibold text-gray-900">
                  {{ insight.title }}
                </div>
                <div class="text-xs text-gray-600 mt-1">
                  {{ insight.description }}
                </div>
                <ul
                  v-if="insight.recommendations.length"
                  class="mt-2 space-y-1"
                >
                  <li
                    v-for="(rec, j) in insight.recommendations"
                    :key="j"
                    class="text-xs text-gray-500 flex items-start gap-1.5"
                  >
                    <span class="shrink-0 mt-1 w-1 h-1 rounded-full bg-gray-400" />
                    {{ rec }}
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  </div>
</template>
