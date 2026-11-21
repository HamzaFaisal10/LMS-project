import { useCallback, useEffect, useState } from 'react';
import { api } from './lib/api';

// Fetch helper with loading/error state and a reload function. Re-fetches when `path` changes.
export function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    try {
      setData(await api(path));
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    load();
  }, [load]);
  return { data, loading, error, reload: load, setData };
}
