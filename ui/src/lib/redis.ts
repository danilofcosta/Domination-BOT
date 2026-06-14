import { createClient } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: any | undefined;
};

export async function getRedis() {
  if (globalForRedis.redis) {
    if (!globalForRedis.redis.isOpen) {
      await globalForRedis.redis.connect();
    }
    return globalForRedis.redis as any;
  }
  const client = createClient({ url: process.env.REDIS_URL });
  client.on("error", (err) => console.error("Redis error:", err));
  await client.connect();
  globalForRedis.redis = client;
  return client;
}
