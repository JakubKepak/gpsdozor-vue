<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Layout, Menu, Select } from 'ant-design-vue'
import {
  DashboardOutlined,
  CarOutlined,
  EnvironmentOutlined,
  ToolOutlined,
  RobotOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue'
import { useLocale } from '@/composables/useLocale'
import { provideChatStore } from '@/stores/chatStore'
import ChatPanel from '@/views/ai/ChatPanel.vue'

const collapsed = ref(true)
const chatOpen = ref(false)

provideChatStore()
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

const localeFlags: Record<string, string> = { cs: '\ud83c\udde8\ud83c\uddff', en: '\ud83c\uddec\ud83c\udde7' }
const localeOptions = [
  { value: 'cs', label: `${localeFlags.cs} CZ` },
  { value: 'en', label: `${localeFlags.en} EN` },
]
</script>

<script lang="ts">
import { h } from 'vue'
export default {}
</script>

<template>
  <Layout
    class="min-h-screen"
    style="flex-direction: row"
  >
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
          <div
            v-if="!collapsed"
            class="overflow-hidden"
          >
            <div class="text-white font-semibold text-sm leading-tight">
              GPS Dozor
            </div>
            <div class="text-blue-300/60 text-xs leading-tight">
              {{ t('app.subtitle') }}
            </div>
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
          <!-- Locale selector -->
          <div :class="['flex items-center mt-2', collapsed ? 'justify-center' : 'px-1']">
            <Select
              v-if="!collapsed"
              :value="locale"
              size="small"
              variant="borderless"
              :options="localeOptions"
              class="w-22 locale-select"
              :popup-match-select-width="false"
              @update:value="(val: unknown) => changeLocale(String(val))"
            />
            <button
              v-else
              class="bg-transparent border-0 cursor-pointer text-base p-0 leading-none"
              @click="changeLocale(locale === 'cs' ? 'en' : 'cs')"
            >
              {{ localeFlags[locale] ?? localeFlags.cs }}
            </button>
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

    <!-- Chat bubble -->
    <button
      class="fixed z-50 flex items-center justify-center w-14 h-14 rounded-full border-0 cursor-pointer shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
      :style="{ right: '24px', bottom: '24px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }"
      :aria-label="t('ai.title')"
      @click="chatOpen = !chatOpen"
    >
      <CloseOutlined
        v-if="chatOpen"
        class="text-white text-lg"
      />
      <RobotOutlined
        v-else
        class="text-white text-xl"
      />
    </button>

    <!-- Chat popup -->
    <div
      v-if="chatOpen"
      class="fixed z-40 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
      :style="{ right: '24px', bottom: '96px', width: '380px', height: '520px', border: '1px solid rgba(0,0,0,0.08)' }"
    >
      <div
        class="flex items-center gap-3 px-4 py-3 shrink-0"
        style="background: linear-gradient(135deg, #7c3aed, #2563eb)"
      >
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
          <RobotOutlined class="text-white text-sm" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-white font-semibold text-sm">
            {{ t('ai.title') }}
          </div>
          <div class="text-white/70 text-xs">
            {{ t('ai.subtitle') }}
          </div>
        </div>
      </div>
      <ChatPanel />
    </div>
  </Layout>
</template>

<style scoped>
.locale-select :deep(.ant-select-selector) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 6px !important;
}
.locale-select :deep(.ant-select-selection-item) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-weight: 500;
  font-size: 12px;
}
.locale-select :deep(.ant-select-arrow) {
  color: rgba(255, 255, 255, 0.35);
}
</style>
