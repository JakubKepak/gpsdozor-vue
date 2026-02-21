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
  ThunderboltOutlined,
  RobotOutlined,
  CloseOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import { useLocale } from '@/composables/useLocale'
import { provideChatStore } from '@/stores/chatStore'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import ChatPanel from '@/views/ai/ChatPanel.vue'

const STORAGE_KEY = 'gpsdozor-chat-bubble-hidden'

const collapsed = ref(true)
const chatOpen = ref(false)

/* ── Hideable chat bubble ── */
const bubbleHidden = ref(localStorage.getItem(STORAGE_KEY) === '1')

function hideBubble() {
  bubbleHidden.value = true
  chatOpen.value = false
  localStorage.setItem(STORAGE_KEY, '1')
}

function restoreBubble() {
  bubbleHidden.value = false
  localStorage.removeItem(STORAGE_KEY)
}

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
  { key: '/eco-driving', icon: () => h(ThunderboltOutlined), label: t('nav.ecoDriving') },
])

const selectedKeys = computed(() => {
  if (route.path.startsWith('/health')) return ['/health']
  if (route.path.startsWith('/eco-driving')) return ['/eco-driving']
  return [route.path]
})

function onMenuClick({ key }: { key: string | number }) {
  router.push(String(key))
}

const localeFlags: Record<string, string> = {
  cs: '\ud83c\udde8\ud83c\uddff',
  en: '\ud83c\uddec\ud83c\udde7',
}
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
  <Layout class="h-screen overflow-hidden flex-row">
    <Layout.Sider
      v-model:collapsed="collapsed"
      collapsible
      :width="220"
      :collapsed-width="64"
      :trigger="null"
      class="bg-sidebar h-full overflow-auto"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="flex items-center gap-3 px-4 h-16 border-b border-white/10">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white font-bold text-sm shrink-0"
          >
            GD
          </div>
          <div
            v-if="!collapsed"
            class="overflow-hidden"
          >
            <div class="text-white font-semibold text-sm leading-tight">GPS Dozor</div>
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
          class="border-none mt-2 flex-1 bg-transparent!"
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
      <Layout.Content :class="isMapPage ? 'overflow-hidden' : 'p-6 bg-gray-50 overflow-auto'">
        <router-view v-slot="{ Component }">
          <ErrorBoundary :key="$route.path">
            <component :is="Component" />
          </ErrorBoundary>
        </router-view>
      </Layout.Content>
    </Layout>

    <!-- Chat bubble with hover dismiss -->
    <div
      v-if="!bubbleHidden"
      class="fixed z-50 right-6 bottom-6 group"
    >
      <!-- Dismiss badge (appears on hover) -->
      <button
        class="absolute -top-1 -right-1 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-black/60 text-white border-0 cursor-pointer opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 group-focus-within:opacity-100 group-focus-within:scale-100 transition-all duration-200 hover:bg-black/80"
        aria-label="Hide chat"
        @click.stop="hideBubble"
      >
        <RightOutlined class="text-[10px]" />
      </button>

      <!-- Main bubble -->
      <button
        :class="[
          'flex items-center justify-center w-14 h-14 rounded-full border-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 bg-linear-to-br from-brand-gradient-from to-brand-gradient-to',
          !chatOpen ? 'chat-bubble-glow' : 'shadow-lg',
        ]"
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
    </div>

    <!-- Hidden state: small tab peeking from right edge -->
    <button
      v-else
      class="fixed z-50 right-0 bottom-6 flex items-center justify-center w-10 h-14 rounded-l-full border-0 cursor-pointer shadow-md bg-linear-to-br from-brand-gradient-from to-brand-gradient-to opacity-50 hover:opacity-100 hover:w-12 transition-all duration-200"
      aria-label="Show chat"
      @click="restoreBubble"
    >
      <RobotOutlined class="text-white text-xs" />
    </button>

    <!-- Chat popup -->
    <div
      v-if="chatOpen && !bubbleHidden"
      class="fixed z-40 right-6 bottom-24 w-95 h-130 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden border border-black/8"
    >
      <div
        class="flex items-center gap-3 px-4 py-3 shrink-0 bg-linear-to-br from-brand-gradient-from to-brand-gradient-to"
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
