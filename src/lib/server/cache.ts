import { add, hoursToMilliseconds, isBefore } from 'date-fns';

export const ONE_HOUR = hoursToMilliseconds(1);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cache = <F extends (...args: any[]) => any>(fn: F, ttlMilliseconds = ONE_HOUR) => {
  let store: Record<string, [Awaited<ReturnType<F>>, Date]> = {};
  const memoized = async (...args: Parameters<F>): Promise<Awaited<ReturnType<F>>> => {
    const key = JSON.stringify(args);
    const now = new Date();
    if (key in store) {
      const [result, eviction] = store[key];
      if (isBefore(now, eviction)) {
        return result;
      }
    }
    const result = await fn(...args);
    store[key] = [result, add(now, { seconds: ttlMilliseconds / 1000 })];
    return result;
  };
  memoized.evictAll = () => {
    console.log(`Evicting cache for ${fn.name}`);
    store = {};
  };

  return memoized;
};
