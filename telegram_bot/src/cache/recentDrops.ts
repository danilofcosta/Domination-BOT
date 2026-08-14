import type { ChatType } from "../utils/customTypes.js";

const MAX_PER_CHAT = 20;

const recentDrops = new Map<string, number[]>();

function key(chatId: number, botType: ChatType): string {
  return `${chatId}:${botType}`;
}

export function trackDrop(chatId: number, botType: ChatType, characterId: number): void {
  const k = key(chatId, botType);
  const list = recentDrops.get(k) ?? [];
  list.push(characterId);
  if (list.length > MAX_PER_CHAT) list.shift();
  recentDrops.set(k, list);
}

export function getRecentDropIds(chatId: number, botType: ChatType): number[] {
  return recentDrops.get(key(chatId, botType)) ?? [];
}
