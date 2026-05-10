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

// ─── Page 1 (used by home sections) ──────────────────────────────────────────
export const getNowPlaying  = ()            => call("/movie/now_playing");
export const getPopular     = ()            => call("/movie/popular");
export const getTopRated    = ()            => call("/movie/top_rated");
export const getTVPopular   = ()            => call("/tv/popular");
export const getByGenre     = (id)          => call("/discover/movie", { with_genres: id, sort_by: "popularity.desc" });

// ─── Paginated (infinite scroll in rows and category pages) ───────────────────
export const getNowPlayingPage  = (page)    => call("/movie/now_playing",  { page });
export const getPopularPage     = (page)    => call("/movie/popular",      { page });
export const getTopRatedPage    = (page)    => call("/movie/top_rated",    { page });
export const getTVPopularPage   = (page)    => call("/tv/popular",         { page });
export const getByGenrePage     = (id,page) => call("/discover/movie",     { with_genres: id, sort_by: "popularity.desc", page });

// ─── Extra category pages ─────────────────────────────────────────────────────
export const getAnimePage       = (page)    => call("/discover/tv",        { with_genres: 16, sort_by: "popularity.desc", page });
export const getClassicPage     = (page)    => call("/discover/movie",     { "primary_release_date.lte": "1979-12-31", sort_by: "vote_average.desc", "vote_count.gte": 1000, page });
export const getAwardPage       = (page)    => call("/discover/movie",     { sort_by: "vote_average.desc", "vote_count.gte": 3000, page });
export const getSpanishPage     = (page)    => call("/discover/movie",     { with_original_language: "es", sort_by: "popularity.desc", page });
export const getAsianPage       = (page)    => call("/discover/movie",     { region: "KR|JP|CN|TW|HK", sort_by: "popularity.desc", page });
export const getDocuPage        = (page)    => call("/discover/movie",     { with_genres: 99, sort_by: "vote_average.desc", "vote_count.gte": 200, page });
export const getTVDramaPage     = (page)    => call("/discover/tv",        { with_genres: 18, sort_by: "vote_average.desc", "vote_count.gte": 500, page });
export const getCrimePage       = (page)    => call("/discover/movie",     { with_genres: "80", sort_by: "popularity.desc", page });

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
