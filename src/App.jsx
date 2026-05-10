import { useState, useEffect, useCallback } from "react";
import { C, GENRES_LIST, TMDB_GENRE_IDS } from "./lib/constants.js";
import { useUserdata } from "./hooks/useUserdata.js";
import { useTMDB }     from "./hooks/useTMDB.js";
import * as TMDB       from "./lib/tmdb.js";

import Nav            from "./components/Nav.jsx";
import HeroBanner     from "./components/HeroBanner.jsx";
import MovieRow       from "./components/MovieRow.jsx";
import MovieModal     from "./components/MovieModal.jsx";
import { SearchOverlay, AiPanel, PersonOverlay, CollectionTab } from "./components/index.js";
import SkeletonRow    from "./components/SkeletonRow.jsx";

// ─── Sections definition ──────────────────────────────────────────────────────
function useSection(fetcher, key) {
  const { data, loading } = useTMDB(fetcher, [key]);
  return { movies: data?.results || [], loading };
}

export default function App() {
  const { userdata, toggleField, setRating } = useUserdata();

  const [selectedMovie, setMovie]  = useState(null);
  const [showSearch,    setSearch] = useState(false);
  const [showAI,        setAI]     = useState(false);
  const [activeTab,     setTab]    = useState("home");
  const [menuOpen,      setMenu]   = useState(false);
  const [person,        setPerson] = useState(null); // { name, role }

  // ── Data sections ──────────────────────────────────────────────────────────
  const nowPlaying = useSection(TMDB.getNowPlaying,  "nowPlaying");
  const streaming  = useSection(TMDB.getPopular,     "popular");
  const topRated   = useSection(TMDB.getTopRated,    "topRated");
  const tvPopular  = useSection(TMDB.getTVPopular,   "tvPopular");

  // Genre sections (fetch first 6 genres)
  const genreSections = GENRES_LIST.slice(0, 6).map(g => ({
    ...g,
    ...useSection(() => TMDB.getByGenre(TMDB_GENRE_IDS[g.id]), `genre_${g.id}`), // eslint-disable-line
  }));

  // ── Collections from userdata ──────────────────────────────────────────────
  // These are movie IDs only; we store minimal info in LS.
  // For the collection tabs we show what we have cached.
  const watchlistIds = Object.entries(userdata).filter(([,v])=>v.watchLater).map(([id])=>id);
  const favoriteIds  = Object.entries(userdata).filter(([,v])=>v.favorite  ).map(([id])=>id);
  const watchedIds   = Object.entries(userdata).filter(([,v])=>v.watched   ).map(([id])=>id);

  // Keyboard shortcuts
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") { setSearch(false); setMovie(null); setPerson(null); setMenu(false); setAI(false); }
      if (e.key === "/" && !showSearch && !selectedMovie) { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [showSearch, selectedMovie]);

  const openPerson = useCallback((name, role) => { setMovie(null); setPerson({ name, role }); }, []);

  // Featured film: highest-rated unwatched, falling back to most popular
  const allMovies = [...nowPlaying.movies, ...streaming.movies, ...topRated.movies];
  const uniqueAll = [...new Map(allMovies.map(m=>[m.id,m])).values()];
  const ratedIds  = Object.entries(userdata).filter(([,v])=>v.rating>=4).map(([id])=>Number(id));
  const featured  = ratedIds.length > 0
    ? uniqueAll.find(m => !userdata[m.id]?.watched && m.vote_average > 7) || uniqueAll[0]
    : uniqueAll[0];

  const TABS = [
    { key:"home",      label:"Inicio" },
    { key:"watchlist", label:"Ver después", count: watchlistIds.length, bg:C.gold,   fg:"#000" },
    { key:"favorites", label:"Favoritas",   count: favoriteIds.length,  bg:C.accent, fg:"#fff" },
    { key:"watched",   label:"Vistas",      count: watchedIds.length,   bg:C.green,  fg:"#000" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>

      <Nav
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={t => { setTab(t); setMenu(false); }}
        menuOpen={menuOpen}
        onMenuToggle={() => setMenu(v=>!v)}
        onSearch={() => setSearch(true)}
        onAI={() => setAI(true)}
      />

      <main style={{ padding:"24px 16px", maxWidth:1360, margin:"0 auto" }} className="fade-in">

        {activeTab === "home" && (
          <>
            {featured
              ? <HeroBanner movie={featured} label="✨ Recomendación de la semana" onOpen={setMovie} />
              : <div className="skeleton" style={{ height:380, borderRadius:18, marginBottom:48 }} />
            }

            {nowPlaying.loading
              ? <SkeletonRow title="🎦 Ahora en cines" />
              : <MovieRow title="🎦 Ahora en cines" movies={nowPlaying.movies} userdata={userdata} onOpen={setMovie} />
            }
            {streaming.loading
              ? <SkeletonRow title="📺 Novedades en plataformas" />
              : <MovieRow title="📺 Novedades en plataformas" movies={streaming.movies} userdata={userdata} onOpen={setMovie} />
            }
            {topRated.loading
              ? <SkeletonRow title="⭐ Las mejor valoradas" />
              : <MovieRow title="⭐ Las mejor valoradas" movies={topRated.movies} userdata={userdata} onOpen={setMovie} />
            }
            {tvPopular.loading
              ? <SkeletonRow title="📡 Series populares" />
              : <MovieRow title="📡 Series populares" movies={tvPopular.movies} userdata={userdata} onOpen={setMovie} />
            }

            {genreSections.map(g => (
              g.loading
                ? <SkeletonRow key={g.id} title={`${g.emoji} ${g.id}`} />
                : <MovieRow   key={g.id} title={`${g.emoji} ${g.id}`} movies={g.movies} userdata={userdata} onOpen={setMovie} />
            ))}
          </>
        )}

        {activeTab === "watchlist" && (
          <CollectionTab
            title="Ver después" icon="+"
            ids={watchlistIds} userdata={userdata}
            onOpen={setMovie}
            emptyText='Pulsa + en cualquier película para añadirla a tu lista de pendientes.'
          />
        )}
        {activeTab === "favorites" && (
          <CollectionTab
            title="Favoritas" icon="♥"
            ids={favoriteIds} userdata={userdata}
            onOpen={setMovie}
            emptyText="Abre una película y pulsa Favorita para guardarla aquí."
          />
        )}
        {activeTab === "watched" && (
          <CollectionTab
            title="Vistas" icon="✓"
            ids={watchedIds} userdata={userdata}
            onOpen={setMovie}
            emptyText="Marca películas como vistas desde su ficha."
          />
        )}
      </main>

      {/* ── Overlays ── */}
      {showSearch && (
        <SearchOverlay
          userdata={userdata}
          onOpen={m => { setSearch(false); setMovie(m); }}
          onClose={() => setSearch(false)}
        />
      )}

      {showAI && (
        <AiPanel
          userdata={userdata}
          onClose={() => setAI(false)}
        />
      )}

      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          userdata={userdata}
          onClose={() => setMovie(null)}
          onToggle={toggleField}
          onRate={setRating}
          onPersonSelect={openPerson}
          onOpenMovie={setMovie}
        />
      )}

      {person && (
        <PersonOverlay
          person={person.name}
          role={person.role}
          onClose={() => setPerson(null)}
          onOpen={m => { setPerson(null); setMovie(m); }}
        />
      )}
    </div>
  );
}
