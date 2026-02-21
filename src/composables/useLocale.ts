import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const DATE_FORMATS: Record<string, string> = {
  cs: 'DD.MM.YYYY',
  en: 'YYYY-MM-DD',
}

export function useLocale() {
  const { locale } = useI18n()

  const dateFormat = computed(() => DATE_FORMATS[locale.value] ?? DATE_FORMATS.en)

  function changeLocale(newLocale: string) {
    locale.value = newLocale
  }

  watch(locale, (val) => {
    localStorage.setItem('locale', val)
  })

  return { locale, changeLocale, dateFormat }
}
