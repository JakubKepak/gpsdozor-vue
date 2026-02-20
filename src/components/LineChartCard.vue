<script setup lang="ts">
import { computed } from 'vue'
import { Card } from 'ant-design-vue'
import VChart from 'vue-echarts'

const {
  title,
  data,
  xKey = 'date',
  yKey = 'value',
  color = '#3b82f6',
  yUnit = '',
  xFormatter,
  height = 260,
} = defineProps<{
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[]
  xKey?: string
  yKey?: string
  color?: string
  yUnit?: string
  xFormatter?: (val: string) => string
  height?: number
}>()

const option = computed(() => ({
  grid: { top: 20, right: 16, bottom: 24, left: 48 },
  xAxis: {
    type: 'category' as const,
    data: data.map(d => d[xKey] as string),
    axisLabel: {
      fontSize: 11,
      formatter: xFormatter ?? ((v: string) => v.slice(5)),
    },
    axisLine: { lineStyle: { color: '#e5e7eb' } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value' as const,
    axisLabel: { fontSize: 11, formatter: yUnit ? `{value} ${yUnit}` : '{value}' },
    splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' as const } },
  },
  tooltip: {
    trigger: 'axis' as const,
  },
  series: [
    {
      type: 'line' as const,
      data: data.map(d => d[yKey]),
      smooth: true,
      lineStyle: { color, width: 2 },
      itemStyle: { color },
      symbolSize: 6,
      areaStyle: { color: `${color}15` },
    },
  ],
}))
</script>

<template>
  <Card :body-style="{ padding: '20px' }">
    <h3 class="text-sm font-semibold text-gray-900 m-0 mb-4">
      {{ title }}
    </h3>
    <!-- height inline style justified: dynamic numeric prop from parent -->
    <VChart
      :option="option"
      class="w-full"
      :style="{ height: `${height}px` }"
      autoresize
    />
  </Card>
</template>
