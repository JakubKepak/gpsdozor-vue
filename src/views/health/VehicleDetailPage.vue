<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-800">{{ t('health.vehicleInfo') }}</h1>
    <p class="text-gray-500 mt-1">{{ route.params.vehicleCode }}</p>
  </div>
</template>
