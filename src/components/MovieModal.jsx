import { useEffect, useState, useRef, useCallback } from "react";
import { C, PLATFORMS } from "../lib/constants.js";
import { getMovieDetail, getMovieCredits, getMovieSimilar, getTVDetail, getTVCredits, getTVSimilar, posterUrl, backdropUrl, profileUrl } from "../lib/tmdb.js";
import PosterCard from "./PosterCard.jsx";

function ScoreBadge({ label, score, color, link }) {
  const inner = (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", background:"rgba(255,255,255,0.04)", borderRadius:10, padding:"7px 12px", border:`1px solid ${color}44`, cursor:link?"pointer":"default" }}>
      <span style={{ fontSize:10, color:C.muted, letterSpacing:1.5, textTransform:"uppercase", marginBottom:2 }}>{label}</span>
      <span style={{ fontSize:18, fontWeight:800, color, fontFamily:"'Playfair Display',Georgia,serif" }}>{score}</span>
    </div>
  );
  return link ? <a href={link} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>{inner}</a> : inner;
}

function PlatformBadge({ platformKey, title }) {
  const p = PLATFORMS[platformKey];
  if (!p) return null;
  return (
    <a href={p.base + encodeURIComponent(title)} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
      <div style={{ display:"flex", alignItems:"center", gap:7, background:`${p.color}18`, border:`1px solid ${p.color}55`, borderRadius:8, padding:"6px 12px", cursor:"pointer", transition:"background 0.15s" }}
        onMouseEnter={e=>e.currentTarget.style.background=`${p.color}30`}
        onMouseLeave={e=>e.currentTarget.style.background=`${p.color}18`}>
        <span style={{ fontWeight:800, fontSize:11, color:p.color, minWidth:16, textAlign:"center" }}>{p.icon}</span>
        <span style={{ fontSize:12, color:"#ccc", fontWeight:600 }}>{p.name}</span>
        <span style={{ fontSize:10, color:C.muted }}>↗</span>
      </div>
    </a>
  );
}

function StarRating({ value=0, onChange, size=22 }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display:"flex", gap:3 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => onChange && onChange(n===value?0:n)}
          onMouseEnter={() => onChange && setHov(n)}
          onMouseLeave={() => onChange && setHov(0)}
          style={{ fontSize:size, cursor:onChange?"pointer":"default", color:n<=(hov||value)?C.gold:"#2a2a3a", transition:"color 0.12s", lineHeight:1, userSelect:"none" }}>
          ★
        </span>
      ))}
    </div>
  );
}

function ActionBtn({ active, activeColor, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{ background:active?`${activeColor}18`:"rgba(255,255,255,0.05)", border:`1px solid ${active?activeColor:C.border}`, color:active?activeColor:C.dim, padding:"7px 14px", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", gap:5, transition:"all 0.16s" }}>
      {icon} {label}
    </button>
  );
}

function PersonChip({ name, role, photo, onSelect }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={()=>onSelect(name,role)}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", alignItems:"center", gap:9, background:hov?"rgba(255,255,255,0.09)":"rgba(255,255,255,0.04)", border:`1px solid ${hov?"rgba(255,255,255,0.2)":C.border}`, borderRadius:11, padding:"7px 13px 7px 7px", cursor:"pointer", transition:"all 0.14s" }}>
      {photo
        ? <img src={photo} alt={name} style={{ width:34, height:34, borderRadius:"50%", objectFit:"cover", border:`1px solid ${C.border}` }} />
        : <div style={{ width:34, height:34, borderRadius:"50%", background:`hsl(${name.charCodeAt(0)*7%360},40%,28%)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#fff", flexShrink:0 }}>
            {name.split(" ").slice(0,2).map(w=>w[0]).join("")}
          </div>
      }
      <div>
        <div style={{ color:C.text, fontSize:13, fontWeight:600, lineHeight:1.2 }}>{name}</div>
        <div style={{ color:C.muted, fontSize:10, marginTop:1, textTransform:"uppercase", letterSpacing:1 }}>{role==="director"?"Director":"Reparto"}</div>
      </div>
    </div>
  );
}

function Sec({ children }) {
  return <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", color:C.text, fontSize:16, margin:"0 0 14px", paddingBottom:9, borderBottom:`1px solid ${C.border}` }}>{children}</h3>;
}
function IF({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:1.5, marginBottom:3 }}>{label}</div>
      <div style={{ color:"#ddd", fontSize:14, fontWeight:500 }}>{value}</div>
    </div>
  );
}

// ─── Infinite similar row ─────────────────────────────────────────────────────
function SimilarRow({ movieId, isTV, userdata, onUpdate, onOpen }) {
  const [movies,    setMovies]    = useState([]);
  const [page,      setPage]      = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const scrollRef   = useRef();
  const sentinelRef = useRef();

  const loadMore = useCallback(async () => {
    if (loading || exhausted) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const fn = isTV ? getTVSimilar : getMovieSimilar;
      const data = await fn(movieId, nextPage);
      const results = (data.results || []).filter(m => m.poster_path);
      if (results.length === 0 || nextPage >= (data.total_pages || 1)) setExhausted(true);
      setMovies(prev => {
        const ids = new Set(prev.map(m => m.id));
        return [...prev, ...results.filter(m => !ids.has(m.id))];
      });
      setPage(nextPage);
    } catch(e) { console.warn(e); }
    finally { setLoading(false); }
  }, [loading, exhausted, page, movieId, isTV]);

  // Initial load
  useEffect(() => { loadMore(); }, []); // eslint-disable-line

  // Observe sentinel for horizontal infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || exhausted) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !loading) loadMore(); },
      { root: scrollRef.current, rootMargin: "0px 300px 0px 0px", threshold: 0 }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [loadMore, exhausted, loading]);

  if (movies.length === 0 && !loading) return null;

  return (
    <div style={{ marginTop:30 }}>
      <Sec>Películas relacionadas</Sec>
      <div ref={scrollRef} style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:8, scrollbarWidth:"none" }}>
        {movies.map(m => (
          <PosterCard key={m.id} movie={m} userdata={userdata} onOpen={onOpen} onUpdate={onUpdate} />
        ))}
        {!exhausted && (
          <div ref={sentinelRef} style={{ flexShrink:0, width:60, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {loading && <div style={{ width:22, height:22, borderRadius:"50%", border:`2px solid ${C.border}`, borderTopColor:C.accent, animation:"spin 0.7s linear infinite" }} />}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function MovieModal({ movie, userdata, onClose, onToggle, onRate, onPersonSelect, onOpenMovie, onUpdate }) {
  const [detail,  setDetail]  = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const ud = userdata[movie.id] || {};
  const isTV = !!movie.first_air_date;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    setLoading(true); setDetail(null);
    const getDetail  = isTV ? () => getTVDetail(movie.id)  : () => getMovieDetail(movie.id);
    const getCredits = isTV ? () => getTVCredits(movie.id) : () => getMovieCredits(movie.id);
    Promise.all([getDetail(), getCredits()])
      .then(([d, c]) => { setDetail(d); setCredits(c); })
      .finally(() => setLoading(false));
    return () => { document.body.style.overflow = ""; };
  }, [movie.id]);

  const director = credits?.crew?.find(p => p.job === "Director");
  const cast     = credits?.cast?.slice(0, 10) || [];
  const runtime  = detail?.runtime || detail?.episode_run_time?.[0];
  const fmtRT    = t => t ? `${Math.floor(t/60)}h ${t%60}m` : null;
  const title    = detail?.title || detail?.name || movie.title || movie.name;
  const score    = detail?.vote_average;

  const imdbLink = `https://www.imdb.com/find?q=${encodeURIComponent(title||"")}`;
  const tmdbLink = `https://www.themoviedb.org/search?query=${encodeURIComponent(title||"")}`;
  const rtLink   = `https://www.rottentomatoes.com/search?search=${encodeURIComponent(title||"")}`;
  const faLink   = `https://www.filmaffinity.com/es/search.php?stype=title&stext=${encodeURIComponent(title||"")}`;

  const handleUpdate = useCallback((id, data) => {
    onToggle && onToggle(id, Object.keys(data).find(k => k !== "rating"));
    onRate   && onRate(id, data.rating);
    if (onUpdate) onUpdate(id, data);
  }, [onToggle, onRate, onUpdate]);

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1000, overflowY:"auto", backdropFilter:"blur(6px)" }}>
      <div style={{ maxWidth:860, margin:"26px auto 80px", background:C.surface, borderRadius:20, overflow:"hidden", boxShadow:"0 40px 100px rgba(0,0,0,0.9)", border:`1px solid ${C.border}`, position:"relative" }}>

        <button onClick={onClose} style={{ position:"absolute", top:13, right:13, zIndex:20, background:"rgba(0,0,0,0.7)", border:`1px solid ${C.border}`, color:"#fff", width:33, height:33, borderRadius:"50%", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>

        {(detail?.backdrop_path||movie.backdrop_path) && (
          <div style={{ height:230, overflow:"hidden", position:"relative" }}>
            <img src={backdropUrl(detail?.backdrop_path||movie.backdrop_path)} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.5 }} />
            <div style={{ position:"absolute", inset:0, background:`linear-gradient(to bottom,rgba(13,13,26,0.1),${C.surface})` }} />
          </div>
        )}

        <div style={{ padding:"0 26px 38px", marginTop:(detail?.backdrop_path||movie.backdrop_path)?-86:26 }}>
          {loading ? (
            <div style={{ padding:"60px 0", textAlign:"center", color:C.dim }}>Cargando ficha…</div>
          ) : (
            <>
              <div style={{ display:"flex", gap:20, alignItems:"flex-end", flexWrap:"wrap" }}>
                <img src={posterUrl(detail?.poster_path||movie.poster_path)} alt={title}
                  onError={e=>{e.target.style.display="none";}}
                  style={{ width:122, height:183, objectFit:"cover", borderRadius:12, boxShadow:"0 12px 36px rgba(0,0,0,0.7)", flexShrink:0, border:`1px solid ${C.border}` }} />

                <div style={{ flex:1, minWidth:190 }}>
                  <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:8 }}>
                    {detail?.genres?.map(g=>(
                      <span key={g.id} style={{ background:"rgba(255,255,255,0.07)", color:"#aaa", fontSize:11, padding:"2px 9px", borderRadius:20, border:`1px solid ${C.border}` }}>{g.name}</span>
                    ))}
                  </div>
                  <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(18px,3.5vw,32px)", color:C.text, margin:"0 0 5px", lineHeight:1.15 }}>{title}</h1>
                  <div style={{ color:C.dim, fontSize:13, marginBottom:16 }}>
                    {(detail?.release_date||detail?.first_air_date||"").slice(0,4)}
                    {fmtRT(runtime) && ` · ${fmtRT(runtime)}`}
                    {detail?.production_countries?.[0] && ` · ${detail.production_countries[0].name}`}
                  </div>

                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                    {score > 0 && <ScoreBadge label="TMDb" score={score.toFixed(1)} color={C.blue} link={tmdbLink} />}
                    {score > 0 && <ScoreBadge label="IMDb" score={score.toFixed(1)} color={C.gold} link={imdbLink} />}
                    <ScoreBadge label="Rotten T."    score="Ver →" color={C.rt} link={rtLink} />
                    <ScoreBadge label="FilmAffinity" score="Ver →" color={C.fa} link={faLink} />
                  </div>

                  <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:14 }}>
                    <ActionBtn active={ud.watched}    activeColor={C.green}  onClick={()=>onToggle(movie.id,"watched")}    icon={ud.watched?"✓":"○"} label={ud.watched?"Vista":"Marcar vista"} />
                    <ActionBtn active={ud.favorite}   activeColor={C.accent} onClick={()=>onToggle(movie.id,"favorite")}   icon="♥" label="Favorita" />
                    <ActionBtn active={ud.watchLater} activeColor={C.gold}   onClick={()=>onToggle(movie.id,"watchLater")} icon="+" label="Ver después" />
                  </div>

                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ color:C.muted, fontSize:13 }}>Mi valoración:</span>
                    <StarRating value={ud.rating||0} onChange={v=>onRate(movie.id,v)} />
                    {ud.rating>0&&<span style={{ color:C.gold, fontSize:13, fontWeight:700 }}>{ud.rating}/5</span>}
                  </div>
                </div>
              </div>

              <div style={{ marginTop:26 }}>
                <Sec>Dónde ver</Sec>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["netflix","prime","disney","hbo","apple","mubi","filmin"].map(p=>(
                    <PlatformBadge key={p} platformKey={p} title={title} />
                  ))}
                </div>
                <p style={{ color:C.muted, fontSize:11, marginTop:8 }}>La disponibilidad puede variar por región.</p>
              </div>

              {detail?.overview && (
                <div style={{ marginTop:24 }}>
                  <Sec>Sinopsis</Sec>
                  <p style={{ color:"#bbb", lineHeight:1.8, fontSize:15, margin:0 }}>{detail.overview}</p>
                </div>
              )}

              <div style={{ marginTop:24 }}>
                <Sec>Ficha técnica</Sec>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))", gap:"13px 26px" }}>
                  <IF label="Año"        value={(detail?.release_date||detail?.first_air_date||"").slice(0,4)} />
                  <IF label="Duración"   value={fmtRT(runtime)} />
                  <IF label="Idioma"     value={detail?.original_language?.toUpperCase()} />
                  <IF label="Productora" value={detail?.production_companies?.[0]?.name} />
                  {detail?.budget>0  && <IF label="Presupuesto"  value={`$${(detail.budget/1e6).toFixed(0)}M`} />}
                  {detail?.revenue>0 && <IF label="Recaudación"  value={`$${(detail.revenue/1e6).toFixed(0)}M`} />}
                  {detail?.number_of_seasons && <IF label="Temporadas" value={detail.number_of_seasons} />}
                  {detail?.number_of_episodes && <IF label="Episodios" value={detail.number_of_episodes} />}
                </div>
              </div>

              {director && (
                <div style={{ marginTop:24 }}>
                  <Sec>Dirección</Sec>
                  <PersonChip name={director.name} role="director" photo={profileUrl(director.profile_path)} onSelect={onPersonSelect} />
                </div>
              )}

              {cast.length>0 && (
                <div style={{ marginTop:24 }}>
                  <Sec>Reparto</Sec>
                  <div style={{ display:"flex", gap:9, flexWrap:"wrap" }}>
                    {cast.map(p=>(
                      <PersonChip key={p.id} name={p.name} role="actor" photo={profileUrl(p.profile_path)} onSelect={onPersonSelect} />
                    ))}
                  </div>
                </div>
              )}

              {/* Infinite similar row */}
              <SimilarRow
                movieId={movie.id}
                isTV={isTV}
                userdata={userdata}
                onUpdate={onUpdate}
                onOpen={onOpenMovie}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
