import { useState, useEffect, useRef, useCallback } from "react";
import { C } from "../lib/constants.js";
import PosterCard from "./PosterCard.jsx";

// Full-screen category grid with vertical infinite scroll
export default function CategoryPage({ title, fetchPage, userdata, onOpen, onUpdate, onClose }) {
  const [movies,   setMovies]    = useState([]);
  const [page,     setPage]      = useState(0);
  const [loading,  setLoading]   = useState(false);
  const [exhausted,setExhausted] = useState(false);
  const sentinelRef = useRef();

  const loadMore = useCallback(async () => {
    if (loading || exhausted) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await fetchPage(nextPage);
      const results = data.results || [];
      if (results.length === 0 || nextPage >= (data.total_pages || 1)) setExhausted(true);
      setMovies(prev => {
        const ids = new Set(prev.map(m => m.id));
        return [...prev, ...results.filter(m => !ids.has(m.id))];
      });
      setPage(nextPage);
    } catch (e) { console.warn(e); }
    finally { setLoading(false); }
  }, [loading, exhausted, page, fetchPage]);

  // Initial load
  useEffect(() => { loadMore(); }, []); // eslint-disable-line

  // Sentinel observer for infinite vertical scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || exhausted) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, exhausted]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{ position:"fixed", inset:0, background:C.bg, zIndex:800, overflowY:"auto" }}>

      {/* Sticky header */}
      <div style={{ position:"sticky", top:0, zIndex:10, background:"rgba(7,7,15,0.97)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${C.border}`, padding:"0 18px", display:"flex", alignItems:"center", height:54, gap:14 }}>
        <button
          onClick={onClose}
          style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, color:"#bbb", width:34, height:34, borderRadius:8, cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}
        >←</button>
        <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(16px,2.5vw,22px)", color:C.text, margin:0 }}>{title}</h1>
        {movies.length > 0 && <span style={{ color:C.muted, fontSize:12, marginLeft:4 }}>{movies.length} títulos</span>}
      </div>

      {/* Grid */}
      <div style={{ padding:"20px 16px 80px", maxWidth:1360, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:14 }}>
          {movies.map(m => (
            <PosterCard key={m.id} movie={m} userdata={userdata} onOpen={onOpen} onUpdate={onUpdate} />
          ))}
          {/* Skeleton placeholders while loading */}
          {loading && [...Array(10)].map((_,i) => (
            <div key={`sk-${i}`} className="skeleton" style={{ aspectRatio:"2/3", borderRadius:11, animationDelay:`${i*0.06}s` }} />
          ))}
        </div>

        {/* Sentinel */}
        {!exhausted && <div ref={sentinelRef} style={{ height:40 }} />}
        {exhausted && movies.length > 0 && (
          <div style={{ textAlign:"center", color:C.muted, fontSize:13, padding:"24px 0" }}>
            Has llegado al final · {movies.length} títulos
          </div>
        )}
      </div>
    </div>
  );
}
