<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { Input, Button } from 'ant-design-vue'
import { SendOutlined, DeleteOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useChatStore } from '@/stores/chatStore'
import ChatBlocks from '@/views/ai/ChatBlocks.vue'
import type { ChatBlock } from '@/types/chat'

const { t } = useI18n()
const { messages, isLoading, sendMessage, clearChat } = useChatStore()

const input = ref('')
const messagesEndRef = ref<HTMLDivElement | null>(null)

const SUGGESTED_PROMPTS_KEYS = [
  'ai.suggestStatus',
  'ai.suggestMileage',
  'ai.suggestFuel',
] as const

// Auto-scroll on new messages
watch([messages, isLoading], () => {
  nextTick(() => {
    messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
  })
})

function handleSend() {
  const text = input.value.trim()
  if (!text || isLoading.value) return
  input.value = ''
  sendMessage(text)
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleSuggest(key: string) {
  sendMessage(t(key))
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Messages area -->
    <div class="flex-1 overflow-y-auto px-4 py-4">
      <!-- Empty state -->
      <div
        v-if="messages.length === 0 && !isLoading"
        class="flex flex-col items-center justify-center h-full text-center"
      >
        <div
          class="flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style="background: linear-gradient(135deg, #7c3aed, #2563eb)"
        >
          <RobotOutlined class="text-2xl text-white" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 m-0 mb-1">
          {{ t('ai.welcomeTitle') }}
        </h3>
        <p class="text-sm text-gray-500 mb-6 max-w-sm">
          {{ t('ai.welcomeSubtitle') }}
        </p>
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            v-for="key in SUGGESTED_PROMPTS_KEYS"
            :key="key"
            class="px-3 py-1.5 text-xs rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
            @click="handleSuggest(key)"
          >
            {{ t(key) }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-else
        class="flex flex-col gap-4"
      >
        <template
          v-for="(msg, i) in messages"
          :key="i"
        >
          <!-- User message -->
          <div
            v-if="msg.role === 'user'"
            class="flex justify-end"
          >
            <div class="flex items-start gap-2 max-w-[80%]">
              <div class="bg-blue-500 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm">
                {{ msg.content }}
              </div>
              <div class="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                <UserOutlined class="text-xs" />
              </div>
            </div>
          </div>

          <!-- Assistant message -->
          <div
            v-else
            class="flex justify-start"
          >
            <div class="flex items-start gap-2 max-w-[85%]">
              <div
                class="flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5"
                style="background: linear-gradient(135deg, #7c3aed, #2563eb)"
              >
                <RobotOutlined class="text-xs text-white" />
              </div>
              <div class="flex flex-col gap-2 min-w-0">
                <ChatBlocks
                  v-for="(block, j) in (msg.content as ChatBlock[])"
                  :key="j"
                  :block="block"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Loading dots -->
        <div
          v-if="isLoading"
          class="flex justify-start"
        >
          <div class="flex items-start gap-2">
            <div
              class="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
              style="background: linear-gradient(135deg, #7c3aed, #2563eb)"
            >
              <RobotOutlined class="text-xs text-white" />
            </div>
            <div class="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div class="flex gap-1.5">
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 0ms"
                />
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 150ms"
                />
                <div
                  class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style="animation-delay: 300ms"
                />
              </div>
            </div>
          </div>
        </div>

        <div ref="messagesEndRef" />
      </div>
    </div>

    <!-- Input area -->
    <div class="border-t border-gray-200 p-3">
      <div class="flex gap-2">
        <Button
          v-if="messages.length > 0"
          size="small"
          class="shrink-0 self-end"
          :title="t('ai.clear')"
          @click="clearChat"
        >
          <template #icon>
            <DeleteOutlined />
          </template>
        </Button>
        <Input.TextArea
          v-model:value="input"
          :placeholder="t('ai.placeholder')"
          :auto-size="{ minRows: 1, maxRows: 4 }"
          class="flex-1"
          @keydown="handleKeyDown"
        />
        <Button
          type="primary"
          class="shrink-0 self-end"
          :loading="isLoading"
          :disabled="!input.trim()"
          :style="{ background: input.trim() ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : undefined }"
          @click="handleSend"
        >
          <template #icon>
            <SendOutlined />
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>
