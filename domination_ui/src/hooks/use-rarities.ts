import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchRarities, createRarity, updateRarity } from '@/lib/api'
import type { Rarity } from '@/lib/types'

const RARITIES_KEY = 'rarities'

export function useRarities() {
  return useQuery<Rarity[]>({
    queryKey: [RARITIES_KEY],
    queryFn: fetchRarities,
    staleTime: 300_000,
  })
}

export function useCreateRarity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createRarity,
    onSuccess: () => qc.invalidateQueries({ queryKey: [RARITIES_KEY] }),
  })
}

export function useUpdateRarity() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateRarity>[1] }) =>
      updateRarity(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [RARITIES_KEY] }),
  })
}
