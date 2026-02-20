import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

export function useLocale() {
  const { locale } = useI18n()

  function changeLocale(newLocale: string) {
    locale.value = newLocale
  }

  watch(locale, (val) => {
    localStorage.setItem('locale', val)
  })

  return { locale, changeLocale }
}
