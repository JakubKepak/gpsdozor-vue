<script setup lang="ts">
import { computed, watch } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import csAntd from 'ant-design-vue/es/locale/cs_CZ'
import enAntd from 'ant-design-vue/es/locale/en_US'
import dayjs from 'dayjs'
import 'dayjs/locale/cs'
import { colors } from '@/theme/colors'
import { useLocale } from '@/composables/useLocale'

const { locale } = useLocale()

watch(
  locale,
  (val) => dayjs.locale(val === 'cs' ? 'cs' : 'en'),
  { immediate: true },
)

const antdLocale = computed(() => (locale.value === 'cs' ? csAntd : enAntd))

const theme = {
  token: {
    colorPrimary: colors.brand.primary,
  },
}
</script>

<template>
  <ConfigProvider
    :theme="theme"
    :locale="antdLocale"
  >
    <router-view />
  </ConfigProvider>
</template>
