<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input } from 'ant-design-vue'
import { SearchOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import type { Vehicle } from '@/types/api'
import { getEffectiveSpeed } from '@/utils/vehicle'

const collapsed = defineModel<boolean>('collapsed', { default: false })

const { vehicles, selectedCode = null } = defineProps<{
  vehicles: Vehicle[]
  selectedCode?: string | null
}>()

const emit = defineEmits<{
  selectVehicle: [code: string]
}>()

const { t } = useI18n()
const search = ref('')

const openGroups = reactive<Record<string, boolean>>({
  driving: true,
  parked: false,
  offline: false,
})

const filtered = computed(() => {
  if (!search.value.trim()) return vehicles
  const q = search.value.toLowerCase()
  return vehicles.filter((v) => v.Name.toLowerCase().includes(q) || v.SPZ.toLowerCase().includes(q))
})

interface StatusGroup {
  key: string
  labelId: string
  bgClass: string
  vehicles: Vehicle[]
}

const groups = computed<StatusGroup[]>(() => [
  {
    key: 'driving',
    labelId: 'liveMap.driving',
    bgClass: 'bg-status-active',
    vehicles: filtered.value.filter((v) => getEffectiveSpeed(v) > 0),
  },
  {
    key: 'parked',
    labelId: 'liveMap.parked',
    bgClass: 'bg-status-idle',
    vehicles: filtered.value.filter((v) => getEffectiveSpeed(v) === 0 && v.IsActive),
  },
  {
    key: 'offline',
    labelId: 'liveMap.offline',
    bgClass: 'bg-status-offline',
    vehicles: filtered.value.filter((v) => !v.IsActive),
  },
])

function toggleGroup(key: string) {
  openGroups[key] = !openGroups[key]
}
</script>

<template>
  <!-- Collapsed: expand button -->
  <button
    v-if="collapsed"
    class="absolute top-4 left-4 z-10 flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-lg border-0 cursor-pointer hover:bg-gray-50 transition-colors"
    :aria-label="t('liveMap.expandPanel')"
    @click="collapsed = false"
  >
    <RightOutlined class="text-gray-600 text-xs" />
  </button>

  <!-- Expanded panel -->
  <div
    v-else
    class="absolute top-4 left-4 z-10 flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden w-80 max-h-[calc(100%-32px)] border border-black/8"
  >
    <!-- Header -->
    <div class="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 shrink-0">
      <Input
        v-model:value="search"
        :placeholder="t('liveMap.searchPlaceholder')"
        allow-clear
        size="small"
        variant="borderless"
        class="flex-1"
      >
        <template #prefix>
          <SearchOutlined class="text-gray-400" />
        </template>
      </Input>
      <button
        class="flex items-center justify-center w-7 h-7 rounded bg-transparent border-0 cursor-pointer hover:bg-gray-100 transition-colors shrink-0"
        :aria-label="t('liveMap.collapsePanel')"
        @click="collapsed = true"
      >
        <LeftOutlined class="text-gray-400 text-xs" />
      </button>
    </div>

    <!-- Groups -->
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="group in groups"
        :key="group.key"
      >
        <button
          class="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 border-0 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors text-left"
          @click="toggleGroup(group.key)"
        >
          <div :class="['w-2.5 h-2.5 rounded-full shrink-0', group.bgClass]" />
          <span class="text-xs font-semibold text-gray-700 flex-1">{{ t(group.labelId) }}</span>
          <span class="text-xs font-semibold text-gray-400">{{ group.vehicles.length }}</span>
          <span class="text-gray-400 text-[10px]">{{ openGroups[group.key] ? '▾' : '▸' }}</span>
        </button>

        <template v-if="openGroups[group.key]">
          <button
            v-for="v in group.vehicles"
            :key="v.Code"
            :class="[
              'w-full flex items-center gap-2.5 px-3 py-2 border-0 cursor-pointer transition-colors text-left',
              selectedCode === v.Code ? 'bg-blue-50' : 'bg-white hover:bg-gray-50',
            ]"
            @click="emit('selectVehicle', v.Code)"
          >
            <div :class="['w-2 h-2 rounded-full shrink-0', group.bgClass]" />
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900 truncate">
                {{ v.Name }}
              </div>
              <div class="text-xs text-gray-400">
                {{ v.SPZ }}
              </div>
            </div>
            <span
              v-if="getEffectiveSpeed(v) > 0"
              class="text-xs font-medium text-green-600 shrink-0"
            >
              {{ getEffectiveSpeed(v) }} km/h
            </span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>
