import type { MyContext } from "../uteis/CustomTypes.js";

export interface StoredListener {
  type: 'text';
  action: (ctx: MyContext) => Promise<any>;
}

const listenerMap = new Map<string, StoredListener>();
const listenerTimers = new Map<string, ReturnType<typeof setTimeout>>();

const LISTENER_TTL_MS = 2 * 60 * 1000;

function key(userId: number, chatId: number): string {
  return `${userId}:${chatId}`;
}

export function setListener(userId: number, chatId: number, listener: StoredListener): void {
  const k = key(userId, chatId);

  const existing = listenerTimers.get(k);
  if (existing) clearTimeout(existing);

  listenerMap.set(k, listener);

  const timer = setTimeout(() => {
    listenerMap.delete(k);
    listenerTimers.delete(k);
  }, LISTENER_TTL_MS);

  listenerTimers.set(k, timer);
}

export function getListener(userId: number, chatId: number): StoredListener | undefined {
  return listenerMap.get(key(userId, chatId));
}

export function clearListener(userId: number, chatId: number): void {
  listenerMap.delete(key(userId, chatId));
}
