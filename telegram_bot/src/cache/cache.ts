import { LRUCache } from "lru-cache";




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

export const rankingCache = new LRUCache<string, any>({
  max: 10,
  ttl: 1000 * 60 * 5,
});

export const permissionCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5,
});

export const maxIdCache = new LRUCache<string, number>({
  max: 10,
  ttl: 1000 * 60 * 5,
});

export const characterCache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 10,
});

export const rarityCache = new LRUCache<string, any>({
  max: 50,
  ttl: 1000 * 60 * 10,
});

export const eventCache = new LRUCache<string, any>({
  max: 50,
  ttl: 1000 * 60 * 10,
});

export function setCharacter(key: string | number, data: any) {
  characterCache.set(String(key), data);
}

export function getCharacter(key: string | number): any | undefined {
  return characterCache.get(String(key));
}

export interface CharListData {
  userId: number;
  characterIds: number[];
  genero: string;
}

const charListCache = new LRUCache<string, CharListData>({
  max: 100,
  ttl: 1000 * 60 * 5,
});

export function setCharList(userId: number, genero: string, data: CharListData) {
  charListCache.set(`list_char_user_${userId}_${genero}`, data);
}

export function getCharList(userId: number, genero: string): CharListData | undefined {
  return charListCache.get(`list_char_user_${userId}_${genero}`);
}

export interface LeaveGroupCacheState {
  groupId: number;
  groupName: string;
  membrers_clean_colletion: boolean;
  membrers_ban: boolean;
  send_message_to_group: boolean;
}

const leaveGroupStore = new LRUCache<string, LeaveGroupCacheState>({
  max: 50,
  ttl: 1000 * 60 * 60,
});

export function getLeaveGroupCache(chatId: number): LeaveGroupCacheState | undefined {
  return leaveGroupStore.get(String(chatId));
}

export function setLeaveGroupCache(chatId: number, state: LeaveGroupCacheState): void {
  leaveGroupStore.set(String(chatId), state);
}

export interface HaremCacheData {
  pages: string[];
  forceopen?: boolean;
}

const haremStore = new Map<number, HaremCacheData>();

export function setHarem(userId: number, data: HaremCacheData | null) {
  if (data === null) {
    haremStore.delete(userId);
  } else {
    haremStore.set(userId, data);
  }
}

export function getHarem(userId: number): HaremCacheData | undefined {
  return haremStore.get(userId);
}

export function clearAllCaches() {
  rankingCache.clear();
  permissionCache.clear();
  maxIdCache.clear();
  characterCache.clear();
  rarityCache.clear();
  eventCache.clear();
  charListCache.clear();
  leaveGroupStore.clear();
  haremStore.clear();
}
