import { addDays, addHours, hoursToMilliseconds, isBefore, startOfToday } from 'date-fns';
import { env } from '$env/dynamic/private';
import Redis from 'ioredis';

export const ONE_HOUR = hoursToMilliseconds(1);
const kv = new Redis({
  host: env.REDIS_HOST!,
  port: parseInt(env.REDIS_PORT!),
  username: env.REDIS_USERNAME!,
  password: env.REDIS_PASSWORD!,
  family: 6,
});

function getNextReset(hour: number): Date {
  const now = new Date();
  const hourToday = addHours(startOfToday(), hour);
  if (isBefore(now, hourToday)) {
    return hourToday;
  }
  return addDays(hourToday, 1);
}

export async function cache<T>(key: string, fn: () => Promise<T>, expiresAt?: Date) {
  const cachedString = await kv.get(key);
  const cachedValue = (cachedString ? JSON.parse(cachedString) : null) as T | null;
  if (cachedValue) {
    return cachedValue;
  }
  const result = await fn();
  expiresAt = expiresAt ?? getNextReset(5);
  await kv.set(key, JSON.stringify(result), 'PXAT', expiresAt.valueOf());
  return result;
}

export async function clearCache(prefix: string) {
  const keys = await kv.keys(`${prefix}:*`);
  const count = await kv.del(...keys);
  console.log(`Cleared ${count} keys for prefix ${prefix}`);
}
