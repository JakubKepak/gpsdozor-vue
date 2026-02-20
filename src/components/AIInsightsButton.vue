<script setup lang="ts">
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
</script>

<template>
  <Button
    :class="[
      'inline-flex! items-center! gap-1.5! border-transparent! bg-linear-to-br! text-white! font-medium!',
      active
        ? 'from-violet-600! to-indigo-600! shadow-[0_0_0_2px_rgba(139,92,246,0.3)]!'
        : 'from-violet-500! to-indigo-500!',
    ]"
    @click="emit('click')"
  >
    <BulbOutlined />
    {{ t('insights.button') }}
  </Button>
</template>
