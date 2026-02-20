import { useQuery } from '@tanstack/vue-query'
import { apiGet } from '@/api/client'
import { groupKeys } from '@/api/queryKeys'
import type { Group } from '@/types/api'

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.all,
    queryFn: () => apiGet<Group[]>('/groups'),
  })
}
