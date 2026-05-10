import { useState, useEffect, useRef } from "react";

// Simple in-memory cache to avoid redundant API calls
const cache = new Map();

export function useTMDB(fetcher, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const key = deps.join("|");

  useEffect(() => {
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
