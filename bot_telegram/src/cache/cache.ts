import { LRUCache } from "lru-cache";
import type { PreCharacter } from "../handlers/Comandos/admin_bot/manager_character/add/add_charecter.js";

export const haremCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 5,
});

export const characterCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 10,
});

export function getHarem(userId: number) {
  return haremCache.get(`harem:${userId}`);
}

export function setHarem(userId: number, data: any) {
  haremCache.set(`harem:${userId}`, data);
}

export function getCharacter(characterId: number): PreCharacter {
  return characterCache.get(`character:${characterId}`);
}

export function setCharacter(characterId: number, data: any) {
  characterCache.set(`character:${characterId}`, data);
}

export function SetGiftUser(id: number, data: any) {
  characterCache.set(`GiftUser:${id}`, data);
}

export function getGiftUser(id: number) {
  return characterCache.get(`GiftUser:${id}`);
}

export interface AddToCollectionData {
  userId: number;
  characterId: number;
  genero: string;
  from: any;
}

export function setAddToCollection(userId: number, characterId: number, data: AddToCollectionData) {
  characterCache.set(`addcolletion:${userId}:${characterId}`, data);
}

export function getAddToCollection(userId: number, characterId: number): AddToCollectionData | undefined {
  return characterCache.get(`addcolletion:${userId}:${characterId}`);
}

export interface AddToCollectionMultiData {
  userId: number;
  characterIds: number[];
  genero: string;
  from: any;
}

export function setAddToCollectionMulti(userId: number, data: AddToCollectionMultiData) {
  characterCache.set(`addcolletion:${userId}:multi`, data);
}

export function getAddToCollectionMulti(userId: number): AddToCollectionMultiData | undefined {
  return characterCache.get(`addcolletion:${userId}:multi`);
}

export interface CharListData {
  userId: number;
  characterIds: number[];
  genero: string;
}

export function setCharList(userId: number, genero: string, data: CharListData) {
  characterCache.set(`list_char_user_${userId}_${genero}`, data);
}

export function getCharList(userId: number, genero: string): CharListData | undefined {
  return characterCache.get(`list_char_user_${userId}_${genero}`);
}
