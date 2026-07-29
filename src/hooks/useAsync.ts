import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Minimal data-fetching hook: runs `fn` on mount and whenever `deps` change. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const alive = useRef(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    alive.current = true;
    setLoading(true);
    setError(null);

    fnRef
      .current()
      .then((result) => {
        if (alive.current) setData(result);
      })
      .catch((err: unknown) => {
        if (alive.current) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });

    return () => {
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, reload };
}
