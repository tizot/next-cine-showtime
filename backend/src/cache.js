import { add, hoursToMilliseconds, isBefore } from "date-fns";

export const ONE_HOUR = hoursToMilliseconds(1);

export const cache = (ttlMilliseconds = ONE_HOUR) => {
  let store = {};

  const memoize = (fn) => {
    const memoized = (...args) => {
      const key = JSON.stringify(args);
      const now = new Date();
      if (key in store) {
        const [result, eviction] = store[key];
        if (isBefore(now, eviction)) {
          return result;
        }
      }
      const result = fn(...args);
      store[key] = [result, add(now, { seconds: ttlMilliseconds / 1000 })];
      return result;
    };

    memoized.evictAll = () => {
      store = {};
    };

    return memoized;
  };

  return memoize;
};
