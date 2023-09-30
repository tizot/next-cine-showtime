import { useState } from "react";

export default function useStoredArray<T>(key: string, initial: T[] = []) {
  const [values, _setValues] = useState<T[]>(() => {
    const stored = localStorage.getItem(key);
    if (stored == null) return initial;
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return initial;
      }
      return parsed;
    } catch (_error) {
      return initial;
    }
  });

  const setValues = (vals: T[]) => {
    localStorage.setItem(key, JSON.stringify(vals));
    _setValues(vals);
  };

  return [values, setValues] as const;
}
