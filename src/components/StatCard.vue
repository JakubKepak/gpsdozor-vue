<script setup lang="ts">
import { Card } from 'ant-design-vue'

const {
  label,
  value,
  subtitle,
  colorClass,
  bgColorClass,
  compact = false,
} = defineProps<{
  label: string
  value: string | number
  subtitle?: string
  colorClass: string
  bgColorClass: string
  compact?: boolean
}>()
</script>

<template>
  <Card
    class="h-full"
    :body-style="{ padding: compact ? '16px' : '20px' }"
  >
    <div :class="['flex gap-3', compact ? 'items-center' : 'items-start']">
      <div
        :class="['flex items-center justify-center rounded-lg shrink-0', compact ? 'w-9 h-9 text-base' : 'w-10 h-10 text-lg', colorClass, bgColorClass]"
      >
        <slot name="icon" />
      </div>
      <div class="min-w-0">
        <div class="text-gray-500 text-xs font-medium">
          {{ label }}
        </div>
        <div :class="['font-bold text-gray-900 leading-tight', compact ? 'text-lg' : 'text-2xl mt-0.5']">
          {{ value }}
        </div>
        <div
          v-if="subtitle"
          class="text-gray-400 text-xs mt-0.5"
        >
          {{ subtitle }}
        </div>
      </div>
    </div>
  </Card>
</template>
