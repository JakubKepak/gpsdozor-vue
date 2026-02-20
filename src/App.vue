<script setup lang="ts">
import { ConfigProvider } from 'ant-design-vue'
import { colors } from '@/theme/colors'

const theme = {
  token: {
    colorPrimary: colors.brand.primary,
  },
}
</script>

<template>
  <ConfigProvider :theme="theme">
    <router-view />
  </ConfigProvider>
</template>
