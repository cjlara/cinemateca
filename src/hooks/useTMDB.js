import { useState, useEffect } from "react";

const cache = new Map();

export function useTMDB(fetcher, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(!!fetcher); // false if no fetcher
  const [error,   setError]   = useState(null);
  const key = deps.join("|");

  useEffect(() => {
    // Don't fetch if no fetcher provided (lazy sections not yet visible)
    if (!fetcher) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    if (cache.has(key)) {
      setData(cache.get(key));
      setLoading(false);
      return;
    }

    setLoading(true);
    fetcher()
      .then(d => {
        if (!cancelled) {
          cache.set(key, d);
          setData(d);
          setLoading(false);
        }
      })
      .catch(e => {
        if (!cancelled) { setError(e.message); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line

  return { data, loading, error };
}
