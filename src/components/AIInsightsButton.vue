<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button } from 'ant-design-vue'
import { BulbOutlined } from '@ant-design/icons-vue'

const { active = false } = defineProps<{
  active?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const { t } = useI18n()

const style = computed(() => {
  const base = {
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    borderColor: 'transparent',
    color: '#fff',
    fontWeight: 500,
  }
  if (active) {
    return {
      ...base,
      background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
      boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.3)',
    }
  }
  return base
})
</script>

<template>
  <Button
    :style="style"
    @click="emit('click')"
  >
    <template #icon>
      <BulbOutlined />
    </template>
    {{ t('insights.button') }}
  </Button>
</template>
