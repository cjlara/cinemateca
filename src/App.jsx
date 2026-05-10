import { useState, useEffect, useCallback, useRef } from "react";
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

// ─── Lazy section — only fetches when visible ─────────────────────────────────
function LazySection({ title, fetchPage, userdata, onOpen, onUpdate, onCategory }) {
  const ref     = useRef();
  const [visible, setVisible] = useState(false);
  const { movies, loading }   = useSection(visible ? () => fetchPage(1) : null, title);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { rootMargin:"600px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {loading || (!visible && !movies.length)
        ? <SkeletonRow title={title} />
        : <MovieRow
            title={title}
            movies={movies}
            userdata={userdata}
            onOpen={onOpen}
            onUpdate={onUpdate}
            fetchMore={fetchPage}
            onTitleClick={() => onCategory(title, fetchPage)}
          />
      }
    </div>
  );
}

// ─── All section definitions ──────────────────────────────────────────────────
const MOVIE_GENRE_SECTIONS = GENRES_LIST.map(g => ({
  key:   `mg_${g.id}`,
  title: `${g.emoji} ${g.id}`,
  fetchPage: p => TMDB.getByGenrePage(TMDB_GENRE_IDS[g.id], p),
}));

const EXTRA_MOVIE_SECTIONS = [
  { key:"classic",  title:"🎞️ Cine clásico",       fetchPage: TMDB.getClassicPage  },
  { key:"awards",   title:"🏆 Las más premiadas",   fetchPage: TMDB.getAwardPage    },
  { key:"spanish",  title:"🇪🇸 Cine español",        fetchPage: TMDB.getSpanishPage  },
  { key:"asian",    title:"🌏 Cine asiático",        fetchPage: TMDB.getAsianPage    },
  { key:"docu",     title:"📽️ Documentales",         fetchPage: TMDB.getDocuPage     },
  { key:"crime",    title:"🔫 Crimen y thriller",   fetchPage: TMDB.getCrimePage    },
  { key:"family",   title:"👨‍👩‍👧 Familia",              fetchPage: TMDB.getFamilyPage   },
  { key:"horror",   title:"😱 Terror selección",    fetchPage: TMDB.getHorrorPage   },
];

const TV_SECTIONS = [
  { key:"tvpop",    title:"📡 Series populares",    fetchPage: TMDB.getTVPopularPage  },
  { key:"tvtop",    title:"⭐ Series mejor valoradas", fetchPage: TMDB.getTVTopRatedPage },
  { key:"tvair",    title:"🔴 Series en emisión",   fetchPage: TMDB.getTVAiringPage   },
  { key:"anime",    title:"🎌 Anime",               fetchPage: TMDB.getAnimePage      },
  { key:"kdrama",   title:"🇰🇷 K-Drama",             fetchPage: TMDB.getKDramaPage     },
  { key:"tvdocu",   title:"🎙️ Documentales TV",     fetchPage: TMDB.getTVDocuPage     },
  { key:"tvcrime",  title:"🕵️ Series de crimen",    fetchPage: TMDB.getTVCrimePage    },
  { key:"tvcomedy", title:"😂 Series de comedia",   fetchPage: TMDB.getTVComedyPage   },
  { key:"tvscifi",  title:"🚀 Sci-Fi & Fantasía TV", fetchPage: TMDB.getTVScifiPage   },
  { key:"tvmini",   title:"🎬 Miniseries",           fetchPage: TMDB.getTVMiniPage    },
];

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ label }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:16, margin:"8px 0 40px" }}>
      <div style={{ flex:1, height:1, background:C.border }} />
      <span style={{ color:C.muted, fontSize:11, letterSpacing:1.5, textTransform:"uppercase", whiteSpace:"nowrap" }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.border }} />
    </div>
  );
}

export default function App() {
  const { userdata, toggleField, setRating, updateMovie } = useUserdata();

  const [selectedMovie, setMovie]    = useState(null);
  const [showSearch,    setSearch]   = useState(false);
  const [showAI,        setAI]       = useState(false);
  const [activeTab,     setTab]      = useState("home");
  const [menuOpen,      setMenu]     = useState(false);
  const [person,        setPerson]   = useState(null);
  const [categoryPage,  setCategory] = useState(null);

  // ── Fixed top rows (always loaded) ───────────────────────────────────────
  const nowPlaying = useSection(TMDB.getNowPlaying, "nowPlaying");
  const popular    = useSection(TMDB.getPopular,    "popular");
  const topRated   = useSection(TMDB.getTopRated,   "topRated");

  // ── Collections ───────────────────────────────────────────────────────────
  const watchlistIds = Object.entries(userdata).filter(([,v])=>v.watchLater).map(([id])=>id);
  const favoriteIds  = Object.entries(userdata).filter(([,v])=>v.favorite  ).map(([id])=>id);
  const watchedIds   = Object.entries(userdata).filter(([,v])=>v.watched   ).map(([id])=>id);

  // ── onUpdate: unified handler for quick-rate and modal actions ────────────
  const onUpdate = useCallback((id, data) => {
    updateMovie(id, data);
  }, [updateMovie]);

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

  const openPerson   = useCallback((name, role) => { setMovie(null); setPerson({ name, role }); }, []);
  const openCategory = useCallback((title, fetchPage) => setCategory({ title, fetchPage }), []);

  // ── Featured ──────────────────────────────────────────────────────────────
  const allMovies = [...nowPlaying.movies, ...popular.movies, ...topRated.movies];
  const uniqueAll = [...new Map(allMovies.map(m=>[m.id,m])).values()];
  const ratedIds  = Object.entries(userdata).filter(([,v])=>v.rating>=4).map(([id])=>Number(id));
  const featured  = ratedIds.length > 0
    ? uniqueAll.find(m => !userdata[m.id]?.watched && m.vote_average > 7) || uniqueAll[0]
    : uniqueAll[0];

  const TABS = [
    { key:"home",      label:"Inicio" },
    { key:"watchlist", label:"Ver después", count:watchlistIds.length, bg:C.gold,   fg:"#000" },
    { key:"favorites", label:"Favoritas",   count:favoriteIds.length,  bg:C.accent, fg:"#fff" },
    { key:"watched",   label:"Vistas",      count:watchedIds.length,   bg:C.green,  fg:"#000" },
  ];

  // ── Shared row props ──────────────────────────────────────────────────────
  const rowProps = { userdata, onOpen: setMovie, onUpdate };

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Nav tabs={TABS} activeTab={activeTab}
        onTabChange={t=>{setTab(t);setMenu(false);}}
        menuOpen={menuOpen} onMenuToggle={()=>setMenu(v=>!v)}
        onSearch={()=>setSearch(true)} onAI={()=>setAI(true)} />

      <main style={{ padding:"24px 16px", maxWidth:1360, margin:"0 auto" }} className="fade-in">

        {activeTab==="home" && (
          <>
            {/* Hero */}
            {featured
              ? <HeroBanner movie={featured} label="✨ Recomendación de la semana" onOpen={setMovie} />
              : <div className="skeleton" style={{ height:380, borderRadius:18, marginBottom:48 }} />
            }

            {/* Top rows — always loaded */}
            {nowPlaying.loading
              ? <SkeletonRow title="🎦 Ahora en cines" />
              : <MovieRow title="🎦 Ahora en cines" movies={nowPlaying.movies} {...rowProps}
                  fetchMore={TMDB.getNowPlayingPage}
                  onTitleClick={()=>openCategory("🎦 Ahora en cines", TMDB.getNowPlayingPage)} />
            }
            {popular.loading
              ? <SkeletonRow title="📺 Novedades en plataformas" />
              : <MovieRow title="📺 Novedades en plataformas" movies={popular.movies} {...rowProps}
                  fetchMore={TMDB.getPopularPage}
                  onTitleClick={()=>openCategory("📺 Novedades en plataformas", TMDB.getPopularPage)} />
            }
            {topRated.loading
              ? <SkeletonRow title="⭐ Las mejor valoradas" />
              : <MovieRow title="⭐ Las mejor valoradas" movies={topRated.movies} {...rowProps}
                  fetchMore={TMDB.getTopRatedPage}
                  onTitleClick={()=>openCategory("⭐ Las mejor valoradas", TMDB.getTopRatedPage)} />
            }

            {/* Movie genres — lazy */}
            {MOVIE_GENRE_SECTIONS.map(s => (
              <LazySection key={s.key} title={s.title} fetchPage={s.fetchPage}
                {...rowProps} onCategory={openCategory} />
            ))}

            <Divider label="Más categorías de cine" />

            {EXTRA_MOVIE_SECTIONS.map(s => (
              <LazySection key={s.key} title={s.title} fetchPage={s.fetchPage}
                {...rowProps} onCategory={openCategory} />
            ))}

            <Divider label="Series y televisión" />

            {TV_SECTIONS.map(s => (
              <LazySection key={s.key} title={s.title} fetchPage={s.fetchPage}
                {...rowProps} onCategory={openCategory} />
            ))}
          </>
        )}

        {activeTab==="watchlist" && (
          <CollectionTab title="Ver después" icon="+" ids={watchlistIds} userdata={userdata}
            onOpen={setMovie} emptyText="Pulsa + en cualquier película para añadirla." />
        )}
        {activeTab==="favorites" && (
          <CollectionTab title="Favoritas" icon="♥" ids={favoriteIds} userdata={userdata}
            onOpen={setMovie} emptyText="Abre una película y pulsa Favorita." />
        )}
        {activeTab==="watched" && (
          <CollectionTab title="Vistas" icon="✓" ids={watchedIds} userdata={userdata}
            onOpen={setMovie} emptyText="Marca películas como vistas desde su ficha." />
        )}
      </main>

      {/* Category page */}
      {categoryPage && (
        <CategoryPage title={categoryPage.title} fetchPage={categoryPage.fetchPage}
          userdata={userdata} onOpen={setMovie} onUpdate={onUpdate} onClose={()=>setCategory(null)} />
      )}

      {/* Overlays */}
      {showSearch && (
        <SearchOverlay userdata={userdata}
          onOpen={m=>{setSearch(false);setMovie(m);}} onClose={()=>setSearch(false)} />
      )}
      {showAI && <AiPanel userdata={userdata} onClose={()=>setAI(false)} />}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} userdata={userdata}
          onClose={()=>setMovie(null)}
          onToggle={toggleField} onRate={setRating} onUpdate={onUpdate}
          onPersonSelect={openPerson} onOpenMovie={setMovie} />
      )}
      {person && (
        <PersonOverlay person={person.name} role={person.role}
          onClose={()=>setPerson(null)}
          onOpen={m=>{setPerson(null);setMovie(m);}} />
      )}
    </div>
  );
}
