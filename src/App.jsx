import { useState, useEffect, useCallback } from "react";
import { C, GENRES_LIST, TMDB_GENRE_IDS } from "./lib/constants.js";
import { useUserdata } from "./hooks/useUserdata.js";
import { useTMDB }     from "./hooks/useTMDB.js";
import * as TMDB       from "./lib/tmdb.js";

import Nav           from "./components/Nav.jsx";
import HeroBanner    from "./components/HeroBanner.jsx";
import MovieRow      from "./components/MovieRow.jsx";
import MovieModal    from "./components/MovieModal.jsx";
import CategoryPage  from "./components/CategoryPage.jsx";
import SkeletonRow   from "./components/SkeletonRow.jsx";
import { SearchOverlay, AiPanel, PersonOverlay, CollectionTab } from "./components/index.js";

// ─── Section hook ─────────────────────────────────────────────────────────────
function useSection(fetcher, key) {
  const { data, loading } = useTMDB(fetcher, [key]);
  return { movies: data?.results || [], loading };
}

// ─── All sections definition ──────────────────────────────────────────────────
// Each entry: { key, title, fetcher (page1), fetchMore (page n), emoji? }
const EXTRA_SECTIONS = [
  { key:"anime",    title:"🎌 Anime",              fetchPage: p => TMDB.getAnimePage(p)    },
  { key:"classic",  title:"🎞️ Cine clásico",        fetchPage: p => TMDB.getClassicPage(p)  },
  { key:"awards",   title:"🏆 Las más premiadas",   fetchPage: p => TMDB.getAwardPage(p)    },
  { key:"spanish",  title:"🇪🇸 Cine español",        fetchPage: p => TMDB.getSpanishPage(p)  },
  { key:"asian",    title:"🌏 Cine asiático",        fetchPage: p => TMDB.getAsianPage(p)    },
  { key:"docu",     title:"📽️ Documentales",         fetchPage: p => TMDB.getDocuPage(p)     },
  { key:"tvdrama",  title:"📺 Series de drama",      fetchPage: p => TMDB.getTVDramaPage(p)  },
  { key:"crime",    title:"🔫 Crimen y thriller",    fetchPage: p => TMDB.getCrimePage(p)    },
];

// Row sections (fixed TMDB endpoints)
const ROW_SECTIONS = [
  { key:"nowPlaying", title:"🎦 Ahora en cines",           fetcher: TMDB.getNowPlaying, fetchMore: p => TMDB.getNowPlayingPage(p) },
  { key:"popular",    title:"📺 Novedades en plataformas",  fetcher: TMDB.getPopular,    fetchMore: p => TMDB.getPopularPage(p)    },
  { key:"topRated",   title:"⭐ Las mejor valoradas",        fetcher: TMDB.getTopRated,   fetchMore: p => TMDB.getTopRatedPage(p)   },
  { key:"tvPopular",  title:"📡 Series populares",           fetcher: TMDB.getTVPopular,  fetchMore: p => TMDB.getTVPopularPage(p)  },
];

// Hook to load a single extra section (page 1 only for the row preview)
function useExtraSection(sectionKey, fetchPage) {
  const { data, loading } = useTMDB(() => fetchPage(1), [sectionKey]);
  return { movies: data?.results || [], loading };
}

export default function App() {
  const { userdata, toggleField, setRating } = useUserdata();

  const [selectedMovie, setMovie]   = useState(null);
  const [showSearch,    setSearch]  = useState(false);
  const [showAI,        setAI]      = useState(false);
  const [activeTab,     setTab]     = useState("home");
  const [menuOpen,      setMenu]    = useState(false);
  const [person,        setPerson]  = useState(null);
  const [categoryPage,  setCategory] = useState(null); // { title, fetchPage }

  // ── Fixed row sections ────────────────────────────────────────────────────
  const rowData = ROW_SECTIONS.map(s => ({  // eslint-disable-line
    ...s,
    ...useSection(s.fetcher, s.key),
  }));

  // ── Genre sections ────────────────────────────────────────────────────────
  const genreData = GENRES_LIST.map(g => ({  // eslint-disable-line
    ...g,
    ...useSection(() => TMDB.getByGenre(TMDB_GENRE_IDS[g.id]), `genre_${g.id}`),
    fetchMore: p => TMDB.getByGenrePage(TMDB_GENRE_IDS[g.id], p),
  }));

  // ── Extra sections (anime, clásico, etc.) ─────────────────────────────────
  const extraData = EXTRA_SECTIONS.map(s => ({  // eslint-disable-line
    ...s,
    ...useExtraSection(s.key, s.fetchPage),
  }));

  // ── Collections ───────────────────────────────────────────────────────────
  const watchlistIds = Object.entries(userdata).filter(([,v])=>v.watchLater).map(([id])=>id);
  const favoriteIds  = Object.entries(userdata).filter(([,v])=>v.favorite  ).map(([id])=>id);
  const watchedIds   = Object.entries(userdata).filter(([,v])=>v.watched   ).map(([id])=>id);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const h = e => {
      if (e.key === "Escape") {
        if (categoryPage) { setCategory(null); return; }
        setSearch(false); setMovie(null); setPerson(null); setMenu(false); setAI(false);
      }
      if (e.key === "/" && !showSearch && !selectedMovie) { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [showSearch, selectedMovie, categoryPage]);

  const openPerson = useCallback((name, role) => { setMovie(null); setPerson({ name, role }); }, []);

  // ── Featured film ─────────────────────────────────────────────────────────
  const allMovies = rowData.flatMap(s => s.movies);
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

  const openCategory = useCallback((title, fetchPage) => {
    setCategory({ title, fetchPage });
  }, []);

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
            {/* Hero */}
            {featured
              ? <HeroBanner movie={featured} label="✨ Recomendación de la semana" onOpen={setMovie} />
              : <div className="skeleton" style={{ height:380, borderRadius:18, marginBottom:48 }} />
            }

            {/* Fixed rows */}
            {rowData.map(s => s.loading
              ? <SkeletonRow key={s.key} title={s.title} />
              : <MovieRow
                  key={s.key}
                  title={s.title}
                  movies={s.movies}
                  userdata={userdata}
                  onOpen={setMovie}
                  fetchMore={s.fetchMore}
                  onTitleClick={() => openCategory(s.title, s.fetchMore)}
                />
            )}

            {/* Genre rows */}
            {genreData.map(g => g.loading
              ? <SkeletonRow key={g.id} title={`${g.emoji} ${g.id}`} />
              : <MovieRow
                  key={g.id}
                  title={`${g.emoji} ${g.id}`}
                  movies={g.movies}
                  userdata={userdata}
                  onOpen={setMovie}
                  fetchMore={g.fetchMore}
                  onTitleClick={() => openCategory(`${g.emoji} ${g.id}`, g.fetchMore)}
                />
            )}

            {/* Extra sections divider */}
            <div style={{ display:"flex", alignItems:"center", gap:16, margin:"16px 0 40px" }}>
              <div style={{ flex:1, height:1, background:C.border }} />
              <span style={{ color:C.muted, fontSize:12, letterSpacing:1.5, textTransform:"uppercase" }}>Más categorías</span>
              <div style={{ flex:1, height:1, background:C.border }} />
            </div>

            {/* Extra category rows */}
            {extraData.map(s => s.loading
              ? <SkeletonRow key={s.key} title={s.title} />
              : <MovieRow
                  key={s.key}
                  title={s.title}
                  movies={s.movies}
                  userdata={userdata}
                  onOpen={setMovie}
                  fetchMore={s.fetchPage}
                  onTitleClick={() => openCategory(s.title, s.fetchPage)}
                />
            )}
          </>
        )}

        {activeTab === "watchlist" && (
          <CollectionTab title="Ver después" icon="+" ids={watchlistIds} userdata={userdata}
            onOpen={setMovie} emptyText="Pulsa + en cualquier película para añadirla a tu lista de pendientes." />
        )}
        {activeTab === "favorites" && (
          <CollectionTab title="Favoritas" icon="♥" ids={favoriteIds} userdata={userdata}
            onOpen={setMovie} emptyText="Abre una película y pulsa Favorita para guardarla aquí." />
        )}
        {activeTab === "watched" && (
          <CollectionTab title="Vistas" icon="✓" ids={watchedIds} userdata={userdata}
            onOpen={setMovie} emptyText="Marca películas como vistas desde su ficha." />
        )}
      </main>

      {/* ── Category page (full screen) ── */}
      {categoryPage && (
        <CategoryPage
          title={categoryPage.title}
          fetchPage={categoryPage.fetchPage}
          userdata={userdata}
          onOpen={m => { setMovie(m); }}
          onClose={() => setCategory(null)}
        />
      )}

      {/* ── Overlays ── */}
      {showSearch && (
        <SearchOverlay userdata={userdata} onOpen={m => { setSearch(false); setMovie(m); }} onClose={() => setSearch(false)} />
      )}
      {showAI && <AiPanel userdata={userdata} onClose={() => setAI(false)} />}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie} userdata={userdata}
          onClose={() => setMovie(null)}
          onToggle={toggleField} onRate={setRating}
          onPersonSelect={openPerson} onOpenMovie={setMovie}
        />
      )}
      {person && (
        <PersonOverlay
          person={person.name} role={person.role}
          onClose={() => setPerson(null)}
          onOpen={m => { setPerson(null); setMovie(m); }}
        />
      )}
    </div>
  );
}
