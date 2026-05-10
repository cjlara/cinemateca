import { C } from "../lib/constants.js";
import { backdropUrl } from "../lib/tmdb.js";

export default function HeroBanner({ movie, label, onOpen }) {
  const bg = backdropUrl(movie.backdrop_path);

  return (
    <div onClick={() => onOpen(movie)}
      style={{ position:"relative", height:"clamp(220px,40vw,440px)", marginBottom:48, borderRadius:18, overflow:"hidden", cursor:"pointer", boxShadow:"0 20px 60px rgba(0,0,0,0.7)" }}>

      {bg
        ? <img src={bg} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#1a1a2e,#0f3460)" }} />
      }
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to right,rgba(7,7,15,0.97) 0%,rgba(7,7,15,0.5) 55%,transparent 100%)" }} />

      {label && (
        <div style={{ position:"absolute", top:16, left:16, background:"rgba(229,9,20,0.9)", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, letterSpacing:1, textTransform:"uppercase" }}>
          {label}
        </div>
      )}

      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"clamp(18px,4vw,44px)" }}>
        <div style={{ display:"flex", gap:5, marginBottom:8, flexWrap:"wrap" }}>
          {(movie.genres||movie.genre_ids||[]).slice(0,3).map((g,i) => (
            <span key={i} style={{ background:"rgba(255,255,255,0.12)", color:"#fff", fontSize:11, padding:"2px 9px", borderRadius:20, fontWeight:600 }}>
              {g.name || g}
            </span>
          ))}
        </div>

        <h1 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(20px,4.5vw,50px)", color:"#fff", margin:"0 0 9px", lineHeight:1.1, maxWidth:520 }}>
          {movie.title || movie.name}
        </h1>

        {movie.overview && (
          <p style={{ color:"#ccc", fontSize:"clamp(12px,1.3vw,14px)", lineHeight:1.65, maxWidth:420, margin:"0 0 16px" }}>
            {movie.overview.slice(0, 140)}…
          </p>
        )}

        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <button style={{ background:C.accent, border:"none", color:"#fff", padding:"9px 20px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:700 }}>
            ▶ Ver ficha
          </button>
          {movie.vote_average > 0 && (
            <span style={{ color:C.gold, fontSize:13, fontWeight:700 }}>★ {movie.vote_average.toFixed(1)} IMDb</span>
          )}
        </div>
      </div>
    </div>
  );
}
