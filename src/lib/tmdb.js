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

// ─── Page 1 ───────────────────────────────────────────────────────────────────
export const getNowPlaying = ()   => call("/movie/now_playing");
export const getPopular    = ()   => call("/movie/popular");
export const getTopRated   = ()   => call("/movie/top_rated");
export const getTVPopular  = ()   => call("/tv/popular");
export const getByGenre    = (id) => call("/discover/movie", { with_genres: id, sort_by: "popularity.desc" });

// ─── Paginated movies ──────────────────────────────────────────────────────────
export const getNowPlayingPage = (p)    => call("/movie/now_playing", { page: p });
export const getPopularPage    = (p)    => call("/movie/popular",     { page: p });
export const getTopRatedPage   = (p)    => call("/movie/top_rated",   { page: p });
export const getByGenrePage    = (id,p) => call("/discover/movie",    { with_genres: id, sort_by: "popularity.desc", page: p });

// ─── Paginated TV ─────────────────────────────────────────────────────────────
export const getTVPopularPage     = (p) => call("/tv/popular",      { page: p });
export const getTVTopRatedPage    = (p) => call("/tv/top_rated",    { page: p });
export const getTVAiringPage      = (p) => call("/tv/on_the_air",   { page: p });
export const getTVByGenrePage     = (id,p) => call("/discover/tv",  { with_genres: id, sort_by: "popularity.desc", page: p });

// ─── Extra movie categories ───────────────────────────────────────────────────
export const getClassicPage     = (p) => call("/discover/movie", { "primary_release_date.lte": "1979-12-31", sort_by: "vote_average.desc", "vote_count.gte": 1000, page: p });
export const getAwardPage       = (p) => call("/discover/movie", { sort_by: "vote_average.desc", "vote_count.gte": 3000, page: p });
export const getSpanishPage     = (p) => call("/discover/movie", { with_original_language: "es", sort_by: "popularity.desc", page: p });
export const getAsianPage       = (p) => call("/discover/movie", { with_original_language: "ko|ja|zh", sort_by: "popularity.desc", page: p });
export const getDocuPage        = (p) => call("/discover/movie", { with_genres: 99, sort_by: "vote_average.desc", "vote_count.gte": 200, page: p });
export const getCrimePage       = (p) => call("/discover/movie", { with_genres: "80", sort_by: "popularity.desc", page: p });
export const getFamilyPage      = (p) => call("/discover/movie", { with_genres: "10751", sort_by: "popularity.desc", page: p });
export const getHorrorPage      = (p) => call("/discover/movie", { with_genres: 27, sort_by: "vote_average.desc", "vote_count.gte": 500, page: p });

// ─── Extra TV categories ──────────────────────────────────────────────────────
export const getAnimePage       = (p) => call("/discover/tv", { with_genres: 16, sort_by: "popularity.desc", page: p });
export const getKDramaPage      = (p) => call("/discover/tv", { with_original_language: "ko", sort_by: "popularity.desc", page: p });
export const getTVDocuPage      = (p) => call("/discover/tv", { with_genres: 99, sort_by: "vote_average.desc", "vote_count.gte": 100, page: p });
export const getTVCrimePage     = (p) => call("/discover/tv", { with_genres: "80", sort_by: "popularity.desc", page: p });
export const getTVComedyPage    = (p) => call("/discover/tv", { with_genres: 35, sort_by: "vote_average.desc", "vote_count.gte": 300, page: p });
export const getTVScifiPage     = (p) => call("/discover/tv", { with_genres: "10765", sort_by: "popularity.desc", page: p });
export const getTVRealityPage   = (p) => call("/discover/tv", { with_genres: "10764", sort_by: "popularity.desc", page: p });
export const getTVMiniPage      = (p) => call("/discover/tv", { with_type: 2, sort_by: "vote_average.desc", "vote_count.gte": 200, page: p });

// ─── Detail & credits ─────────────────────────────────────────────────────────
export const getMovieDetail    = (id) => call(`/movie/${id}`);
export const getMovieCredits   = (id) => call(`/movie/${id}/credits`);
export const getMovieSimilar   = (id, p=1) => call(`/movie/${id}/similar`, { page: p });
export const getTVDetail       = (id) => call(`/tv/${id}`);
export const getTVCredits      = (id) => call(`/tv/${id}/credits`);
export const getTVSimilar      = (id, p=1) => call(`/tv/${id}/similar`, { page: p });

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchMulti = (query) => call("/search/multi", { query });

// ─── Image helpers ────────────────────────────────────────────────────────────
export const posterUrl   = (path, size="w342")  => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
export const backdropUrl = (path, size="w1280") => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
export const profileUrl  = (path, size="w185")  => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;
