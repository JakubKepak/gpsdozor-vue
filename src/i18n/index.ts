import { createI18n } from 'vue-i18n'
import cs from './cs.json'
import en from './en.json'

const savedLocale = localStorage.getItem('locale') ?? 'cs'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: { cs, en },
})
