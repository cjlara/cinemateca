import { useState } from "react";
import { C } from "../lib/constants.js";
import { posterUrl } from "../lib/tmdb.js";

export default function PosterCard({ movie, userdata, onOpen }) {
  const ud  = userdata[movie.id] || {};
  const [err, setErr] = useState(false);
  const src = posterUrl(movie.poster_path);

  return (
    <div onClick={() => onOpen(movie)}
      style={{ position:"relative", flexShrink:0, width:136, cursor:"pointer", borderRadius:11, overflow:"hidden", background:C.card, transition:"transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s", boxShadow:"0 4px 16px rgba(0,0,0,0.5)" }}
      onMouseEnter={e => { e.currentTarget.style.transform="scale(1.08) translateY(-4px)"; e.currentTarget.style.boxShadow="0 16px 36px rgba(0,0,0,0.8)"; e.currentTarget.style.zIndex=10; }}
      onMouseLeave={e => { e.currentTarget.style.transform="scale(1)";                     e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.5)"; e.currentTarget.style.zIndex=1; }}
    >
      {src && !err
        ? <img src={src} alt={movie.title||movie.name} onError={() => setErr(true)} style={{ width:"100%", display:"block", aspectRatio:"2/3", objectFit:"cover" }} />
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

      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"24px 8px 8px", background:"linear-gradient(transparent,rgba(0,0,0,0.96))" }}>
        <div style={{ fontSize:11, color:"#eee", fontWeight:700, lineHeight:1.3 }}>{movie.title||movie.name}</div>
        {movie.vote_average > 0 && (
          <div style={{ fontSize:10, color:C.gold, marginTop:2 }}>★ {movie.vote_average.toFixed(1)}</div>
        )}
      </div>
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
