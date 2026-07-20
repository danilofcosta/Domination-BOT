import { LRUCache } from "lru-cache";

const localeCache = new LRUCache<number, string>({
  max: 2000,
  ttl: 1000 * 60 * 60,
});

export function getCachedLocale(scopeId: number): string | undefined {
  return localeCache.get(scopeId);
}

export function setCachedLocale(scopeId: number, locale: string): void {
  localeCache.set(scopeId, locale);
}
