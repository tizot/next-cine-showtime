import { kv } from '@vercel/kv';
import { hoursToMilliseconds } from 'date-fns';

export const SIX_HOURS = hoursToMilliseconds(6);

export async function cache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMilliseconds: number = SIX_HOURS,
) {
  const cached = await kv.get<T>(key);
  if (cached) {
    return cached;
  }
  const result = await fn();
  await kv.set(key, result, { px: new Date().valueOf() + ttlMilliseconds });
  return result;
}
