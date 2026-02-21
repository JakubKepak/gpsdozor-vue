<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Result } from 'ant-design-vue'

const { t } = useI18n()

const error = ref<Error | null>(null)
const isDev = import.meta.env.DEV

onErrorCaptured((err: Error) => {
  error.value = err
  console.error('[ErrorBoundary]', err)
  return false
})

function retry() {
  error.value = null
}

function reload() {
  window.location.reload()
}
</script>

<template>
  <div
    v-if="error"
    class="flex items-center justify-center h-full min-h-80"
  >
    <Result
      status="error"
      :title="t('error.title')"
      :sub-title="t('error.description')"
    >
      <template #extra>
        <div class="flex gap-3 justify-center">
          <Button
            type="primary"
            @click="retry"
          >
            {{ t('error.retry') }}
          </Button>
          <Button @click="reload">
            {{ t('error.reload') }}
          </Button>
        </div>
      </template>
      <div
        v-if="isDev"
        class="text-left bg-gray-50 rounded-lg p-4 max-w-xl mx-auto overflow-auto"
      >
        <p class="font-mono text-sm text-red-600 m-0">
          {{ error.message }}
        </p>
      </div>
    </Result>
  </div>
  <slot v-else />
</template>
