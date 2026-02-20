import { computed, type MaybeRef, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useI18n } from 'vue-i18n'
import { insightKeys } from '@/api/queryKeys'
import type { InsightModule, InsightResponse } from '@/types/insights'

function hashData(data: Record<string, unknown>): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(36)
}

async function fetchInsights(
  module: InsightModule,
  data: Record<string, unknown>,
  locale: string,
): Promise<InsightResponse> {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ module, data, locale }),
  })
  if (!response.ok) {
    throw new Error(`AI insight error: ${response.status}`)
  }
  return response.json()
}

export function useAIInsights(
  module: InsightModule,
  data: MaybeRef<Record<string, unknown> | null>,
  enabled: MaybeRef<boolean> = true,
) {
  const { locale } = useI18n()

  const dataHash = computed(() => {
    const d = toValue(data)
    return d ? hashData(d) : ''
  })

  return useQuery({
    queryKey: computed(() => insightKeys.byModule(module, dataHash.value)),
    queryFn: () => fetchInsights(module, toValue(data)!, locale.value),
    enabled: computed(() => {
      const d = toValue(data)
      return toValue(enabled) && !!d && Object.keys(d).length > 0
    }),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  })
}
