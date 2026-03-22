import { LRUCache } from 'lru-cache';
import type { PreCharacter } from '../handlers/Comandos/admin/add_charecter.js';


export const haremCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 5
});


export const characterCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 10
});

export function getHarem(userId: number) {
  return haremCache.get(`harem:${userId}`);
}

export function setHarem(userId: number, data: any) {
  haremCache.set(`harem:${userId}`, data);
}


export function getCharacter(characterId: number ):PreCharacter  {
  return characterCache.get(`character:${characterId}`);
}

export function setCharacter(characterId: number, data: any) {
  characterCache.set(`character:${characterId}`, data);
}