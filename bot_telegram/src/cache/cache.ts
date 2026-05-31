import { LRUCache } from "lru-cache";
import type { PreCharacter } from "../utils/customTypes.js";

export const haremCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 5,
});

export const characterCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 10,
});

export const rarityCache = new LRUCache<string, any>({
  max: 10,
  ttl: 1000 * 60 * 5,
});

export const eventCache = new LRUCache<string, any>({
  max: 10,
  ttl: 1000 * 60 * 5,
});

export const rankingCache = new LRUCache<string, any>({
  max: 10,
  ttl: 1000 * 60 * 5,
});

export const permissionCache = new LRUCache<string, { role: string }>({
  max: 2000,
  ttl: 1000 * 60 * 15,
});

export const adminGroupCache = new LRUCache<string, boolean>({
  max: 1000,
  ttl: 1000 * 60 * 2,
});

export const charCountCache = new LRUCache<string, number>({
  max: 10,
  ttl: 1000 * 60 * 5,
});

export const maxIdCache = new LRUCache<string, number>({
  max: 10,
  ttl: 1000 * 60 * 5,
});

export async function getOrSet<T>(
  cache: LRUCache<string, any>,
  key: string,
  fetch: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const value = await fetch();
  cache.set(key, value);
  return value;
}

//cache da coleão do user
export function getHarem(userId: number) {
  return haremCache.get(`harem:${userId}`);
}

export function setHarem(userId: number, data: any) {
  haremCache.set(`harem:${userId}`, data);
}

// usado para edit pre add persoge,
export function getCharacter(characterId: number): PreCharacter {
  return characterCache.get(`character:${characterId}`);
}

export function setCharacter(characterId: number, data: any) {
  characterCache.set(`character:${characterId}`, data);
}
//cache presenter outro user 
export function SetGiftUser(id: number, data: any) {
  characterCache.set(`GiftUser:${id}`, data);
}

export function getGiftUser(id: number) {
  return characterCache.get(`GiftUser:${id}`);
}

// cache add personagem a coleção de user
export interface AddToCollectionData {
  userId: number;
  characterId: number;
  genero: string;
  from: any;
}

export function setAddToCollection(userId: number, characterId: number, data: AddToCollectionData) {
  characterCache.set(`addCollection:${userId}:${characterId}`, data);
}

export function getAddToCollection(userId: number, characterId: number): AddToCollectionData | undefined {
  return characterCache.get(`addCollection:${userId}:${characterId}`);
}

export interface AddToCollectionMultiData {
  userId: number;
  characterIds: number[];
  genero: string;
  from: any;
}

export function setAddToCollectionMulti(userId: number, data: AddToCollectionMultiData) {
  characterCache.set(`addCollection:${userId}:multi`, data);
}

export function getAddToCollectionMulti(userId: number): AddToCollectionMultiData | undefined {
  return characterCache.get(`addCollection:${userId}:multi`);
}

export interface CharListData {
  userId: number;
  characterIds: number[];
  genero: string;
}


// cache do comando /animelista qu elista os personagem no db
export function setCharList(userId: number, genero: string, data: CharListData) {
  characterCache.set(`list_char_user_${userId}_${genero}`, data);
}

export function getCharList(userId: number, genero: string): CharListData | undefined {
  return characterCache.get(`list_char_user_${userId}_${genero}`);
}


// cache para cooldown de like/dislike (10 minutos)
export const reactionCooldown = new LRUCache<string, boolean>({
  max: 1000,
  ttl: 1000 * 60 * 10,
});

export interface SetBotPicData {
  fileId: string;
  userId: number;
  mediaType: 'photo' | 'video';
}

export function setBotPic(userId: number, data: SetBotPicData) {
  characterCache.set(`setbotpic:${userId}`, data);
}

export function getBotPic(userId: number): SetBotPicData | undefined {
  return characterCache.get(`setbotpic:${userId}`);
}

// usado para save para editar persogem
export function getCharacterEdit(characterId: number): PreCharacter {
  return characterCache.get(`characteredit:${characterId}`);
}

export function setCharacterEdit(characterId: number, data: any) {
  characterCache.set(`characteredit:${characterId}`, data);
}