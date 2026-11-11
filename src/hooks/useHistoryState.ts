import { useCallback, useState } from "react";

/**
 * State hook that tracks navigation history for a single value.
 * Each time the value changes via the setter, the previous value is pushed
 * onto an internal stack. `back()` pops the stack and restores the prior value.
 */
export function useHistoryState<T>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [stack, setStack] = useState<T[]>([]);

  const set = useCallback((next: T) => {
    setValue((prev) => {
      if (!Object.is(prev, next)) setStack((s) => [...s, prev]);
      return next;
    });
  }, []);

  const back = useCallback(() => {
    setStack((s) => {
      if (s.length === 0) return s;
      setValue(s[s.length - 1]);
      return s.slice(0, -1);
    });
  }, []);

  return [value, set, back, stack.length > 0] as const;
}
