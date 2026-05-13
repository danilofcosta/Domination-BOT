import { useQuery } from '@tanstack/react-query'
import { fetchCollections } from '@/lib/api'
import type { PaginatedResponse, Collection } from '@/lib/types'

const COLLECTIONS_KEY = 'collections'

export function useCollections(page = 1, limit = 100) {
  return useQuery<PaginatedResponse<Collection>>({
    queryKey: [COLLECTIONS_KEY, page, limit],
    queryFn: () => fetchCollections(page, limit),
    staleTime: 30_000,
  })
}
