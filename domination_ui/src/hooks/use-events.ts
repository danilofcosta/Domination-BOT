import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchEvents, createEvent, updateEvent } from '@/lib/api'
import type { Event } from '@/lib/types'

const EVENTS_KEY = 'events'

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: [EVENTS_KEY],
    queryFn: fetchEvents,
    staleTime: 300_000,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateEvent>[1] }) =>
      updateEvent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EVENTS_KEY] }),
  })
}
