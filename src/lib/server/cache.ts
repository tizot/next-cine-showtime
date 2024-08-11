import { kv } from '@vercel/kv';
import { hoursToMilliseconds } from 'date-fns';

export const ONE_HOUR = hoursToMilliseconds(1);

export async function cache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMilliseconds: number = ONE_HOUR,
) {
  const cached = await kv.get<T>(key);
  if (cached) {
    return cached;
  }
  const result = await fn();
  await kv.set(key, result, { px: new Date().valueOf() + ttlMilliseconds });
  return result;
}

export async function clearCache(prefix: string) {
  const keys = await kv.keys(`${prefix}:*`);
  const count = await kv.del(...keys);
  console.log(`Cleared ${count} keys for prefix ${prefix}`);
}
