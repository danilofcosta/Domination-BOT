import type { Character, Rarity, Event, PaginatedResponse, User, Collection } from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000'

async function fetchJson<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function fetchCharacters(
  type?: string,
  search?: string,
  page = 1,
  limit = 100,
): Promise<PaginatedResponse<Character>> {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (search) params.set('search', search)
  params.set('page', String(page))
  params.set('limit', String(limit))
  return fetchJson<PaginatedResponse<Character>>(`/character?${params.toString()}`)
}

export async function fetchCharacter(id: number, type?: string): Promise<Character> {
  const params = type ? `?type=${type}` : ''
  return fetchJson<Character>(`/character/${id}${params}`)
}

export async function fetchCharacterBySlug(slug: string, type?: string): Promise<Character> {
  const params = type ? `?type=${type}` : ''
  return fetchJson<Character>(`/character/slug/${slug}${params}`)
}

export async function fetchRarities(): Promise<Rarity[]> {
  return fetchJson<Rarity[]>('/rarity')
}

export async function fetchEvents(): Promise<Event[]> {
  return fetchJson<Event[]>('/event')
}

export async function fetchUsers(page = 1, limit = 100): Promise<PaginatedResponse<User>> {
  return fetchJson<PaginatedResponse<User>>(`/user?page=${page}&limit=${limit}`)
}

export async function fetchCollections(page = 1, limit = 100): Promise<PaginatedResponse<Collection>> {
  return fetchJson<PaginatedResponse<Collection>>(`/collection?page=${page}&limit=${limit}`)
}

export async function createCharacter(
  data: { type: string; nome: string; origem: string; sourceType?: string; media: string; mediaType: string; rarities?: string[]; events?: string[] },
): Promise<Character> {
  return fetchJson<Character>('/character/create', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCharacter(
  id: number,
  type: string,
  data: { nome?: string; origem?: string; sourceType?: string; media?: string; mediaType?: string; rarities?: string[]; events?: string[] },
): Promise<Character> {
  return fetchJson<Character>(`/character/${id}?type=${type}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function createRarity(
  data: { code: string; name: string; emoji: string; description?: string; emoji_id?: string },
): Promise<Rarity> {
  return fetchJson<Rarity>('/rarity', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateRarity(
  id: number,
  data: { code?: string; name?: string; emoji?: string; description?: string; emoji_id?: string },
): Promise<Rarity> {
  return fetchJson<Rarity>(`/rarity/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function createEvent(
  data: { code: string; name: string; emoji: string; description?: string; emoji_id?: string },
): Promise<Event> {
  return fetchJson<Event>('/event', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateEvent(
  id: number,
  data: { code?: string; name?: string; emoji?: string; description?: string; emoji_id?: string },
): Promise<Event> {
  return fetchJson<Event>(`/event/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function fetchAllCharacters(): Promise<{ waifus: Character[]; husbandos: Character[]; totalWaifus: number; totalHusbandos: number }> {
  const [waifuRes, husbandoRes] = await Promise.all([
    fetchCharacters('waifu', undefined, 1, 1000),
    fetchCharacters('husbando', undefined, 1, 1000),
  ])
  return {
    waifus: waifuRes.data,
    husbandos: husbandoRes.data,
    totalWaifus: waifuRes.total,
    totalHusbandos: husbandoRes.total,
  }
}
