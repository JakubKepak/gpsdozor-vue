<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Layout, Menu, Badge, Select } from 'ant-design-vue'
import {
  DashboardOutlined,
  CarOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  GlobalOutlined,
} from '@ant-design/icons-vue'
import { useLocale } from '@/composables/useLocale'

const collapsed = ref(false)
const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { locale, changeLocale } = useLocale()

const isMapPage = computed(() => route.path === '/map')

const menuItems = computed(() => [
  { key: '/', icon: () => h(DashboardOutlined), label: t('nav.dashboard') },
  { key: '/fleet', icon: () => h(CarOutlined), label: t('nav.fleet') },
  { key: '/map', icon: () => h(EnvironmentOutlined), label: t('nav.map') },
  { key: '/health', icon: () => h(ToolOutlined), label: t('nav.health') },
])

const selectedKeys = computed(() => {
  if (route.path.startsWith('/health')) return ['/health']
  return [route.path]
})

function onMenuClick({ key }: { key: string | number }) {
  router.push(String(key))
}

const localeOptions = [
  { value: 'cs', label: 'CZ' },
  { value: 'en', label: 'EN' },
]
</script>

<script lang="ts">
import { h } from 'vue'
export default {}
</script>

<template>
  <Layout class="min-h-screen" style="flex-direction: row">
    <Layout.Sider
      v-model:collapsed="collapsed"
      collapsible
      :width="220"
      :collapsed-width="64"
      :trigger="null"
      :style="{ background: '#0a1628', position: 'sticky', top: 0, height: '100vh', overflow: 'auto' }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center gap-3 px-4 h-16 border-b border-white/10">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white font-bold text-sm shrink-0">
            GD
          </div>
          <div v-if="!collapsed" class="overflow-hidden">
            <div class="text-white font-semibold text-sm leading-tight">GPS Dozor</div>
            <div class="text-blue-300/60 text-xs leading-tight">{{ t('app.subtitle') }}</div>
          </div>
        </div>

        <!-- Navigation -->
        <Menu
          mode="inline"
          :selected-keys="selectedKeys"
          :items="menuItems"
          theme="dark"
          class="border-none mt-2 flex-1"
          :style="{ background: 'transparent' }"
          @click="onMenuClick"
        />

        <!-- Footer -->
        <div class="border-t border-white/10 p-3">
          <!-- Fleet status -->
          <div v-if="!collapsed" class="rounded-lg bg-white/5 p-3">
            <div class="flex items-center justify-between mb-1">
              <span class="text-blue-300/80 text-xs font-medium">{{ t('sidebar.fleetStatus') }}</span>
              <Badge status="processing" />
            </div>
            <div class="text-white text-sm">
              {{ t('sidebar.activeVehicles') }}
              <span class="font-semibold text-green-400">–</span>
              <span class="text-white/40">/–</span>
            </div>
          </div>
          <div v-else class="flex justify-center">
            <Badge :count="0" size="small" color="green" />
          </div>

          <!-- Locale selector -->
          <div :class="['flex items-center mt-2', collapsed ? 'justify-center' : 'gap-2 px-1']">
            <GlobalOutlined class="text-white/50 text-xs" />
            <Select
              v-if="!collapsed"
              :value="locale"
              size="small"
              variant="borderless"
              :options="localeOptions"
              class="w-16"
              :popup-match-select-width="false"
              :style="{ color: 'rgba(255,255,255,0.6)' }"
              @update:value="(val: unknown) => changeLocale(String(val))"
            />
          </div>

          <!-- Collapse button -->
          <button
            class="w-full mt-2 py-1.5 text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-0"
            @click="collapsed = !collapsed"
          >
            {{ collapsed ? '→' : t('sidebar.collapse') }}
          </button>
        </div>
      </div>
    </Layout.Sider>

    <Layout>
      <Layout.Content :class="isMapPage ? 'overflow-hidden' : 'p-6 bg-gray-50 min-h-screen'">
        <router-view />
      </Layout.Content>
    </Layout>
  </Layout>
</template>
