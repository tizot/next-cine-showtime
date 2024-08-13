import { hoursToMilliseconds } from 'date-fns';
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

export async function cache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMilliseconds: number = ONE_HOUR,
) {
  // TODO: check that expired values are not returned
  const cached = await kv.get(key);
  const cachedValue = (cached ? JSON.parse(cached) : null) as T | null;
  if (cachedValue) {
    return cachedValue;
  }
  const result = await fn();
  await kv.set(key, JSON.stringify(result), 'PX', new Date().valueOf() + ttlMilliseconds);
  return result;
}

export async function clearCache(prefix: string) {
  const keys = await kv.keys(`${prefix}:*`);
  const count = await kv.del(...keys);
  console.log(`Cleared ${count} keys for prefix ${prefix}`);
}
