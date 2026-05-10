import { useState, useCallback } from "react";
import { loadUserdata, saveUserdata } from "../lib/storage.js";

export function useUserdata() {
  const [userdata, setUserdata] = useState(() => loadUserdata());

  const updateMovie = useCallback((movieId, patch) => {
    setUserdata(prev => {
      const next = { ...prev, [movieId]: { ...(prev[movieId] || {}), ...patch } };
      saveUserdata(next);
      return next;
    });
  }, []);

  const toggleField = useCallback((movieId, field) => {
    setUserdata(prev => {
      const current = prev[movieId] || {};
      const next = { ...prev, [movieId]: { ...current, [field]: !current[field] } };
      saveUserdata(next);
      return next;
    });
  }, []);

  const setRating = useCallback((movieId, rating) => {
    updateMovie(movieId, { rating });
  }, [updateMovie]);

  return { userdata, updateMovie, toggleField, setRating };
}
