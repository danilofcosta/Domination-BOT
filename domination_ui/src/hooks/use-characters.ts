import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCharacters,
  fetchCharacter,
  fetchCharacterBySlug,
  fetchAllCharacters,
  createCharacter,
  updateCharacter,
} from '@/lib/api'
import type { Character, PaginatedResponse } from '@/lib/types'

const CHARACTERS_KEY = 'characters'

export function useCharacters(type?: string, search?: string, page = 1, limit = 100) {
  return useQuery<PaginatedResponse<Character>>({
    queryKey: [CHARACTERS_KEY, 'list', type ?? 'all', search ?? '', page, limit],
    queryFn: () => fetchCharacters(type, search, page, limit),
    staleTime: 60_000,
  })
}

export function useAllCharacters() {
  return useQuery({
    queryKey: [CHARACTERS_KEY, 'all'],
    queryFn: fetchAllCharacters,
    staleTime: 60_000,
  })
}

export function useCharacter(id: number, type?: string) {
  return useQuery<Character>({
    queryKey: [CHARACTERS_KEY, 'detail', id, type ?? ''],
    queryFn: () => fetchCharacter(id, type),
    staleTime: 120_000,
  })
}

export function useCharacterBySlug(slug: string, type?: string) {
  return useQuery<Character>({
    queryKey: [CHARACTERS_KEY, 'slug', slug, type ?? ''],
    queryFn: () => fetchCharacterBySlug(slug, type),
    staleTime: 120_000,
  })
}

export function useInfiniteCharacters(type?: string, search?: string, limit = 30) {
  return useInfiniteQuery<PaginatedResponse<Character>>({
    queryKey: [CHARACTERS_KEY, 'infinite', type ?? 'all', search ?? '', limit],
    queryFn: ({ pageParam }) => fetchCharacters(type, search, pageParam as number, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length < limit) return undefined
      return lastPage.page + 1
    },
    staleTime: 60_000,
  })
}

export function useCreateCharacter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createCharacter,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CHARACTERS_KEY] })
    },
  })
}

export function useUpdateCharacter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, type, data }: { id: number; type: string; data: Parameters<typeof updateCharacter>[2] }) =>
      updateCharacter(id, type, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [CHARACTERS_KEY] })
    },
  })
}
