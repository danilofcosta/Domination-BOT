import { createClient } from 'redis';

const client = await createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
}).connect();

export const redis = {
  incr: (key: string) => client.incr(key),
  pexpire: (key: string, ms: number) => client.pExpire(key, ms),
};

export async function checkDailyLimit(userId: number,  maxLimit: number): Promise<boolean> {
  const key = `daily_dominar:${userId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const msUntilMidnight = endOfDay.getTime() - now.getTime() + 1;
    await redis.pexpire(key, msUntilMidnight);
  }
  return count <= maxLimit;
}

export default redis;
