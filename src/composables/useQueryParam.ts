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

/** Batch-update multiple query params in a single router.replace() call. */
export function useSetQueryParams() {
  const route = useRoute()
  const router = useRouter()

  return (params: Record<string, string | undefined>) => {
    const query = { ...route.query }
    for (const [k, v] of Object.entries(params)) {
      if (v) {
        query[k] = v
      } else {
        delete query[k]
      }
    }
    router.replace({ query })
  }
}
