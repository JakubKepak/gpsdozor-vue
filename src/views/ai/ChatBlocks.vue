<script setup lang="ts">
import { Card, Tag } from 'ant-design-vue'
import { CarOutlined } from '@ant-design/icons-vue'
import type { ChatBlock } from '@/types/chat'

defineProps<{
  block: ChatBlock
}>()
</script>

<template>
  <!-- Text -->
  <div
    v-if="block.type === 'text'"
    class="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed"
  >
    {{ block.content }}
  </div>

  <!-- Vehicle cards -->
  <div
    v-else-if="block.type === 'vehicleCard'"
    class="flex flex-col gap-2"
  >
    <Card
      v-for="(v, i) in block.vehicles"
      :key="`${v.code}-${i}`"
      size="small"
      :body-style="{ padding: '12px 16px' }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-500">
            <CarOutlined />
          </div>
          <div>
            <div class="font-medium text-sm text-gray-900">
              {{ v.name }}
            </div>
            <div class="text-xs text-gray-400">
              {{ v.spz }}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs text-gray-500">{{ (v.odometer / 1000).toFixed(0) }}k km</span>
          <Tag
            v-if="v.speed > 0"
            color="green"
            class="m-0"
          >
            {{ v.speed }} km/h
          </Tag>
          <Tag
            v-else
            class="m-0"
          >
            {{ v.isActive ? 'Idle' : 'Inactive' }}
          </Tag>
        </div>
      </div>
    </Card>
  </div>

</template>
