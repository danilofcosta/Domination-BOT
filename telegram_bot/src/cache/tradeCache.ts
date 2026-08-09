import { LRUCache } from "lru-cache";

export interface TradeSession {
    chatId: number;
    transmitterId: number;
    receiverId: number;
    transmitterCharacterId?: number;
    receiverCharacterId?: number;
    menuInitMessageId?: number | undefined;
    menuChatId?: number | undefined;
}

const tradeCache = new LRUCache<string, TradeSession>({
    max: 100,
    ttl: 1000 * 60 * 10,
});

export function setTradeSession(chatId: number, userId: number, data: TradeSession): string {
    const key = `${chatId}:${userId}`;
    tradeCache.set(key, data);
    return key;
}

export function getTradeSession(key: string): TradeSession | undefined {
    return tradeCache.get(key);
}

export function updateTradeSession(key: string, partial: Partial<TradeSession>): void {
    const existing = tradeCache.get(key);
    if (existing) {
        tradeCache.set(key, { ...existing, ...partial });
    }
}

export function deleteTradeSession(key: string): void {
    tradeCache.delete(key);
}

export function clearTradeCache(): void {
    tradeCache.clear();
}
