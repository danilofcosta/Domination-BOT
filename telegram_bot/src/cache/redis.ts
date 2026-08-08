import { createClient } from "redis";
import type { RedisClientType } from "redis";

function isValidRedisUrl(url: string | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "redis:" || u.protocol === "rediss:";
  } catch {
    return false;
  }
}

export const redisUrl = isValidRedisUrl(process.env.REDIS_URL)
  ? process.env.REDIS_URL
  : null;

console.log(
  redisUrl
    ? `[redis] REDIS_URL válida — usando Redis em ${redisUrl}`
    : "[redis] REDIS_URL ausente/inválida — usando armazenamento em memória",
);

let client: RedisClientType | null = null;
let connecting: Promise<RedisClientType> | null = null;

async function getClient(): Promise<RedisClientType> {
  if (client) return client;
  if (!connecting) {
    connecting = (async () => {
      const c = createClient({ url: redisUrl! });
      c.on("error", (err) => console.error("[redis] erro:", err.message));
      await c.connect();
      client = c;
      return c;
    })();
  }
  return connecting;
}

const dailyCounts = new Map<string, { count: number; resetAt: number }>();
const rlHits = new Map<string, { count: number; resetAt: number }>();

function getEndOfDayMs(): number {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() - now.getTime() + 1;
}

export const redis = {
  async incr(key: string): Promise<number> {
    if (redisUrl) return (await getClient()).incr(key);
    const now = Date.now();
    const entry = dailyCounts.get(key);
    if (!entry || now >= entry.resetAt) {
      dailyCounts.set(key, { count: 1, resetAt: now + getEndOfDayMs() });
      return 1;
    }
    entry.count += 1;
    return entry.count;
  },

  async pexpire(key: string, ms: number): Promise<void> {
    if (redisUrl) await (await getClient()).pExpire(key, ms);
  },

  async getCount(key: string): Promise<number> {
    if (redisUrl) {
      const raw = await (await getClient()).get(key);
      return raw ? Number(raw) : 0;
    }
    const now = Date.now();
    const entry = dailyCounts.get(key);
    if (!entry || now >= entry.resetAt) return 0;
    return entry.count;
  },

  async rateLimitExceeded(
    key: string,
    timeFrameMs: number,
    limit: number,
  ): Promise<boolean> {
    if (redisUrl) {
      const c = await getClient();
      const count = await c.incr(key);
      if (count === 1) await c.pExpire(key, timeFrameMs);
      return count > limit;
    }
    const now = Date.now();
    const entry = rlHits.get(key);
    if (!entry || now >= entry.resetAt) {
      rlHits.set(key, { count: 1, resetAt: now + timeFrameMs });
      return false;
    }
    entry.count += 1;
    return entry.count > limit;
  },
};

export async function checkDailyLimit(
  userId: number,
  maxLimit: number,
): Promise<boolean> {
  const key = `daily_dominar:${userId}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.pexpire(key, getEndOfDayMs());
  }
  return count <= maxLimit;
}

export async function getDailyCount(userId: number): Promise<number> {
  return redis.getCount(`daily_dominar:${userId}`);
}

export default redis;
