<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800">{{ t('dashboard.title') }}</h1>
    <p class="text-gray-500 mt-1">{{ t('dashboard.subtitle') }}</p>
  </div>
</template>
