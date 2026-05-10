import { useState, useRef, useCallback } from "react";
import { C } from "../lib/constants.js";
import { posterUrl } from "../lib/tmdb.js";

// ─── Quick-rate popup (long press) ───────────────────────────────────────────
function QuickRatePopup({ movie, userdata, onUpdate, onClose }) {
  const ud = userdata[movie.id] || {};

  const toggle = (field) => {
    onUpdate(movie.id, { ...(userdata[movie.id] || {}), [field]: !ud[field] });
  };
  const setRating = (val) => {
    onUpdate(movie.id, { ...(userdata[movie.id] || {}), rating: val === ud.rating ? 0 : val });
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:500 }} />
      {/* Popup */}
      <div style={{
        position:"absolute", bottom:"calc(100% + 8px)", left:"50%", transform:"translateX(-50%)",
        background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:14, padding:"14px 16px", zIndex:600,
        boxShadow:"0 16px 48px rgba(0,0,0,0.8)",
        minWidth:200, display:"flex", flexDirection:"column", gap:10,
        animation:"popIn 0.15s cubic-bezier(.34,1.56,.64,1)",
      }}>
        <div style={{ fontSize:12, color:C.text, fontWeight:700, textAlign:"center", lineHeight:1.3 }}>
          {movie.title || movie.name}
        </div>

        {/* Stars */}
        <div style={{ display:"flex", gap:4, justifyContent:"center" }}>
          {[1,2,3,4,5].map(n => (
            <span key={n} onClick={() => setRating(n)}
              style={{ fontSize:26, cursor:"pointer", color: n<=(ud.rating||0) ? C.gold : "#2a2a3a", transition:"color 0.1s", userSelect:"none" }}>
              ★
            </span>
          ))}
        </div>

        {/* Quick action buttons */}
        <div style={{ display:"flex", gap:6 }}>
          <QBtn active={ud.watched}    color={C.green}  onClick={() => toggle("watched")}    label={ud.watched ? "✓ Vista" : "○ Vista"} />
          <QBtn active={ud.favorite}   color={C.accent} onClick={() => toggle("favorite")}   label="♥" />
          <QBtn active={ud.watchLater} color={C.gold}   onClick={() => toggle("watchLater")} label="+" />
        </div>

        {/* Arrow */}
        <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", width:12, height:12, background:C.surface, border:`1px solid ${C.border}`, borderTop:"none", borderLeft:"none", rotate:"45deg" }} />
      </div>
      <style>{`@keyframes popIn { from { opacity:0; transform:translateX(-50%) scale(0.85); } to { opacity:1; transform:translateX(-50%) scale(1); } }`}</style>
    </>
  );
}

function QBtn({ active, color, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      flex:1, padding:"7px 4px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700,
      background: active ? `${color}22` : "rgba(255,255,255,0.05)",
      border:`1px solid ${active ? color : C.border}`,
      color: active ? color : C.dim, transition:"all 0.15s",
    }}>{label}</button>
  );
}

// ─── Main PosterCard ──────────────────────────────────────────────────────────
export default function PosterCard({ movie, userdata, onOpen, onUpdate }) {
  const ud  = userdata[movie.id] || {};
  const [err,       setErr]       = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const pressTimer  = useRef(null);
  const src = posterUrl(movie.poster_path);

  const startPress = useCallback(() => {
    pressTimer.current = setTimeout(() => setShowQuick(true), 500);
  }, []);

  const cancelPress = useCallback(() => {
    clearTimeout(pressTimer.current);
  }, []);

  const handleClick = useCallback(() => {
    if (showQuick) return; // don't open modal if popup is showing
    onOpen(movie);
  }, [showQuick, onOpen, movie]);

  return (
    <div
      style={{ position:"relative", flexShrink:0, width:136, cursor:"pointer", borderRadius:11, overflow:"visible" }}
    >
      <div
        onClick={handleClick}
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
        style={{
          borderRadius:11, overflow:"hidden",
          background:C.card,
          transition:"transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s",
          boxShadow:"0 4px 16px rgba(0,0,0,0.5)",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="scale(1.08) translateY(-4px)"; e.currentTarget.style.boxShadow="0 16px 36px rgba(0,0,0,0.8)"; e.currentTarget.style.zIndex=10; }}
        onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.5)"; e.currentTarget.style.zIndex=1; }}
      >
        {src && !err
          ? <img src={src} alt={movie.title||movie.name} onError={() => setErr(true)}
              style={{ width:"100%", display:"block", aspectRatio:"2/3", objectFit:"cover" }} />
          : <div style={{ width:"100%", aspectRatio:"2/3", background:"linear-gradient(135deg,#1a1a2e,#0f3460)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8, padding:12 }}>
              <span style={{ fontSize:28 }}>🎬</span>
              <span style={{ color:"#aaa", fontSize:10, textAlign:"center", lineHeight:1.4 }}>{movie.title||movie.name}</span>
            </div>
        }

        {/* Status badges */}
        <div style={{ position:"absolute", top:6, right:6, display:"flex", flexDirection:"column", gap:3 }}>
          {ud.favorite   && <Dot color={C.accent} text="♥" />}
          {ud.watched    && <Dot color={C.green}  text="✓" dark />}
          {ud.watchLater && <Dot color={C.gold}   text="+" dark />}
        </div>

        {/* Rating stars indicator */}
        {ud.rating > 0 && (
          <div style={{ position:"absolute", top:6, left:6, background:"rgba(0,0,0,0.7)", borderRadius:6, padding:"2px 5px", fontSize:10, color:C.gold, fontWeight:700 }}>
            {"★".repeat(ud.rating)}
          </div>
        )}

        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"24px 8px 8px", background:"linear-gradient(transparent,rgba(0,0,0,0.96))" }}>
          <div style={{ fontSize:11, color:"#eee", fontWeight:700, lineHeight:1.3 }}>{movie.title||movie.name}</div>
          {movie.vote_average > 0 && (
            <div style={{ fontSize:10, color:C.gold, marginTop:2 }}>★ {movie.vote_average.toFixed(1)}</div>
          )}
        </div>

        {/* Long-press hint */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, display:"flex", justifyContent:"center", paddingBottom:3 }}>
          <div style={{ width:20, height:2, borderRadius:2, background:"rgba(255,255,255,0.15)" }} />
        </div>
      </div>

      {/* Quick rate popup */}
      {showQuick && onUpdate && (
        <QuickRatePopup
          movie={movie}
          userdata={userdata}
          onUpdate={(id, data) => { onUpdate(id, data); }}
          onClose={() => setShowQuick(false)}
        />
      )}
    </div>
  );
}

function Dot({ color, text, dark }) {
  return (
    <div style={{ background:color, borderRadius:"50%", width:20, height:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:dark?"#000":"#fff", fontWeight:700 }}>
      {text}
    </div>
  );
}
