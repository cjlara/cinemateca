// ─── Colour palette ───────────────────────────────────────────────────────────
export const C = {
  bg:      "#07070f",
  surface: "#0d0d1a",
  card:    "#12121f",
  border:  "rgba(255,255,255,0.07)",
  muted:   "#555",
  dim:     "#888",
  text:    "#e8e8f0",
  accent:  "#E50914",
  gold:    "#F5C518",
  green:   "#1DB954",
  blue:    "#01b4e4",
  rt:      "#FA320A",
  fa:      "#3CA84A",
  purple:  "#8B5CF6",
};

// ─── Streaming platforms ──────────────────────────────────────────────────────
export const PLATFORMS = {
  netflix: { name: "Netflix",     color: "#E50914", icon: "N",  base: "https://www.netflix.com/search?q=" },
  prime:   { name: "Prime Video", color: "#00A8E1", icon: "P",  base: "https://www.amazon.es/s?k=" },
  disney:  { name: "Disney+",     color: "#113CCF", icon: "D+", base: "https://www.disneyplus.com/search?q=" },
  hbo:     { name: "Max",         color: "#7B2FBE", icon: "M",  base: "https://play.max.com/search?q=" },
  apple:   { name: "Apple TV+",   color: "#555",    icon: "A",  base: "https://tv.apple.com/search?term=" },
  mubi:    { name: "MUBI",        color: "#003E5C", icon: "Mb", base: "https://mubi.com/films/" },
  filmin:  { name: "Filmin",      color: "#E8002E", icon: "Fi", base: "https://www.filmin.es/busca/" },
  cines:   { name: "En cines",    color: "#F5C518", icon: "🎦", base: "https://www.google.com/search?q=" },
};

// ─── Genre list ───────────────────────────────────────────────────────────────
export const GENRES_LIST = [
  { id: "Acción",          emoji: "💥" },
  { id: "Terror",          emoji: "👻" },
  { id: "Fantasía",        emoji: "🧙" },
  { id: "Comedia",         emoji: "😂" },
  { id: "Drama",           emoji: "🎭" },
  { id: "Romance",         emoji: "💕" },
  { id: "Ciencia Ficción", emoji: "🚀" },
  { id: "Thriller",        emoji: "🔪" },
  { id: "Animación",       emoji: "🎨" },
  { id: "Documental",      emoji: "📽️" },
];

// ─── TMDB genre ID map (for discover API) ─────────────────────────────────────
export const TMDB_GENRE_IDS = {
  "Acción":          28,
  "Terror":          27,
  "Fantasía":        14,
  "Comedia":         35,
  "Drama":           18,
  "Romance":         10749,
  "Ciencia Ficción": 878,
  "Thriller":        53,
  "Animación":       16,
  "Documental":      99,
};

export const TMDB_IMG = "https://image.tmdb.org/t/p";
