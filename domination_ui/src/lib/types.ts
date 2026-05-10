export interface CharacterBase {
  id: number
  name: string
  origem: string
  mediaType: MediaType
  media: string
  slug: string
  extras: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
  popularity: number
  sourceType: SourceType
  linkweb: string | null
  linkwebExpiresAt: string | null
  dislikes: number
  likes: number
  addby: Record<string, unknown> | null
}

export interface CharacterWaifu extends CharacterBase {
  WaifuEvent?: WaifuEvent[]
  WaifuRarity?: WaifuRarity[]
}

export interface CharacterHusbando extends CharacterBase {
  HusbandoEvent?: HusbandoEvent[]
  HusbandoRarity?: HusbandoRarity[]
}

export type Character = (CharacterWaifu | CharacterHusbando) & { type: 'waifu' | 'husbando' }

export interface Rarity {
  id: number
  code: string
  name: string
  emoji: string
  description: string | null
  emoji_id: string | null
}

export interface Event {
  id: number
  code: string
  name: string
  emoji: string
  description: string | null
  emoji_id: string | null
}

export interface WaifuEvent {
  characterId: number
  eventId: number
  Event: Event
}

export interface WaifuRarity {
  characterId: number
  rarityId: number
  Rarity: Rarity
}

export interface HusbandoEvent {
  characterId: number
  eventId: number
  Event: Event
}

export interface HusbandoRarity {
  characterId: number
  rarityId: number
  Rarity: Rarity
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export enum MediaType {
  IMAGE_URL = 'IMAGE_URL',
  IMAGE_FILEID = 'IMAGE_FILEID',
  VIDEO_URL = 'VIDEO_URL',
  VIDEO_FILEID = 'VIDEO_FILEID',
  VIDEO_LOCAL = 'VIDEO_LOCAL',
  IMAGE_LOCAL = 'IMAGE_LOCAL',
}

export enum SourceType {
  ANIME = 'ANIME',
  GAME = 'GAME',
  MANGA = 'MANGA',
  MOVIE = 'MOVIE',
}
