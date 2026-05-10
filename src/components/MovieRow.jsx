import { useRef, useState, useEffect, useCallback } from "react";
import { C } from "../lib/constants.js";
import PosterCard from "./PosterCard.jsx";

const sBtn = {
  background:"rgba(255,255,255,0.06)", border:`1px solid rgba(255,255,255,0.07)`,
  color:"#bbb", width:28, height:28, borderRadius:6, cursor:"pointer",
  fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
};

export default function MovieRow({ title, movies: initialMovies, userdata, onOpen, onUpdate, onTitleClick, fetchMore }) {
  const scrollRef  = useRef();
  const loaderRef  = useRef();
  const [movies,   setMovies]   = useState(initialMovies);
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [exhausted, setExhausted] = useState(false);

  // Sync if parent updates initialMovies (e.g. after first fetch)
  useEffect(() => { setMovies(initialMovies); }, [initialMovies]);

  // Observe the last invisible sentinel element at end of row
  useEffect(() => {
    if (!fetchMore || exhausted) return;
    const sentinel = loaderRef.current;
    if (!sentinel) return;

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !loading) loadMore(); },
      { root: scrollRef.current, rootMargin: "0px 200px 0px 0px", threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [loading, exhausted, fetchMore]);

  const loadMore = useCallback(async () => {
    if (loading || exhausted || !fetchMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await fetchMore(nextPage);
      const newMovies = data.results || [];
      if (newMovies.length === 0 || nextPage >= (data.total_pages || 1)) setExhausted(true);
      setMovies(prev => {
        const ids = new Set(prev.map(m => m.id));
        return [...prev, ...newMovies.filter(m => !ids.has(m.id))];
      });
      setPage(nextPage);
    } catch (e) {
      console.warn("loadMore failed", e);
    } finally {
      setLoading(false);
    }
  }, [loading, exhausted, fetchMore, page]);

  if (!movies.length) return null;

  return (
    <section style={{ marginBottom:48 }}>
      <div style={{ display:"flex", alignItems:"center", marginBottom:13, gap:10 }}>
        <h2
          onClick={onTitleClick}
          style={{
            fontFamily:"'Playfair Display',Georgia,serif",
            fontSize:"clamp(16px,2.2vw,22px)", color:C.text, margin:0,
            cursor: onTitleClick ? "pointer" : "default",
            transition:"color 0.15s",
          }}
          onMouseEnter={e => onTitleClick && (e.target.style.color = C.accent)}
          onMouseLeave={e => (e.target.style.color = C.text)}
        >
          {title}
          {onTitleClick && <span style={{ fontSize:13, color:C.muted, marginLeft:8, fontFamily:"system-ui", fontWeight:400 }}>Ver todo →</span>}
        </h2>
        <div style={{ flex:1, height:1, background:`linear-gradient(to right,${C.border},transparent)` }} />
        <button onClick={() => scrollRef.current?.scrollBy({left:-300, behavior:"smooth"})} style={sBtn}>‹</button>
        <button onClick={() => scrollRef.current?.scrollBy({left: 300, behavior:"smooth"})} style={sBtn}>›</button>
      </div>

      <div ref={scrollRef} style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:6, scrollbarWidth:"none" }}>
        {movies.map(m => <PosterCard key={m.id} movie={m} userdata={userdata} onOpen={onOpen} onUpdate={onUpdate} />)}

        {/* Sentinel for infinite scroll */}
        {fetchMore && !exhausted && (
          <div ref={loaderRef} style={{ flexShrink:0, width:60, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {loading && <div style={{ width:24, height:24, borderRadius:"50%", border:`2px solid ${C.border}`, borderTopColor:C.accent, animation:"spin 0.7s linear infinite" }} />}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
