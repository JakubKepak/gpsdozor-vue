import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function useQueryParam(key: string, defaultValue = '') {
  const route = useRoute()
  const router = useRouter()

  const value = computed(() => {
    const raw = route.query[key]
    if (Array.isArray(raw)) return raw[0] ?? defaultValue
    return raw ?? defaultValue
  })

  function set(newValue: string) {
    const query = { ...route.query }
    if (newValue && newValue !== defaultValue) {
      query[key] = newValue
    } else {
      delete query[key]
    }
    router.replace({ query })
  }

  return { value, set }
}
