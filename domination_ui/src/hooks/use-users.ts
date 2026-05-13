import { useQuery } from '@tanstack/react-query'
import { fetchUsers } from '@/lib/api'
import type { PaginatedResponse, User } from '@/lib/types'

const USERS_KEY = 'users'

export function useUsers(page = 1, limit = 100) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: [USERS_KEY, page, limit],
    queryFn: () => fetchUsers(page, limit),
    staleTime: 30_000,
  })
}
