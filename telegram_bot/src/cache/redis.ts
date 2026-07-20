const dailyCounts = new Map<string, { count: number; resetAt: number }>();

function getEndOfDayMs(): number {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime() - now.getTime() + 1;
}

export async function checkDailyLimit(userId: number, maxLimit: number): Promise<boolean> {
  const key = `daily_dominar:${userId}`;
  const now = Date.now();
  const entry = dailyCounts.get(key);

  if (!entry || now >= entry.resetAt) {
    dailyCounts.set(key, { count: 1, resetAt: now + getEndOfDayMs() });
    return 1 <= maxLimit;
  }

  entry.count += 1;
  return entry.count <= maxLimit;
}
