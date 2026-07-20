import { LRUCache } from "lru-cache";

const topicCache = new LRUCache<number, number>({
  max: 500,
  ttl: 1000 * 60 * 60,
});

export function getCachedTopic(chatId: number): number | undefined {
  return topicCache.get(chatId);
}

export function setCachedTopic(chatId: number, topicId: number): void {
  topicCache.set(chatId, topicId);
}
