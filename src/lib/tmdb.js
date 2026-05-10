// All TMDB calls go through our Netlify Function proxy.
// This keeps the API key server-side and avoids CORS issues.

const PROXY = "/.netlify/functions/tmdb";

async function call(path, params = {}) {
  const url = new URL(PROXY, window.location.origin);
  url.searchParams.set("path", path);
  url.searchParams.set("language", "es-ES");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB proxy error ${res.status}`);
  return res.json();
}

// ─── Sections ─────────────────────────────────────────────────────────────────
export const getNowPlaying  = ()       => call("/movie/now_playing");
export const getPopular     = ()       => call("/movie/popular");
export const getTopRated    = ()       => call("/movie/top_rated");
export const getTVPopular   = ()       => call("/tv/popular");
export const getByGenre     = (id)     => call("/discover/movie", { with_genres: id, sort_by: "popularity.desc" });

// ─── Movie detail ─────────────────────────────────────────────────────────────
export const getMovieDetail  = (id)    => call(`/movie/${id}`);
export const getMovieCredits = (id)    => call(`/movie/${id}/credits`);
export const getMovieSimilar = (id)    => call(`/movie/${id}/similar`);
export const getTVDetail     = (id)    => call(`/tv/${id}`);
export const getTVCredits    = (id)    => call(`/tv/${id}/credits`);
export const getTVSimilar    = (id)    => call(`/tv/${id}/similar`);

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchMulti    = (query)  => call("/search/multi", { query });

// ─── Recommendations ──────────────────────────────────────────────────────────
export const getRecommendations = (id) => call(`/movie/${id}/recommendations`);

// ─── Image helpers ────────────────────────────────────────────────────────────
export const posterUrl   = (path, size = "w342")  => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
export const backdropUrl = (path, size = "w1280") => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
export const profileUrl  = (path, size = "w185")  => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
