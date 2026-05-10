import { useRef } from "react";
import { C } from "../lib/constants.js";
import PosterCard from "./PosterCard.jsx";

const sBtn = {
  background:"rgba(255,255,255,0.06)", border:`1px solid rgba(255,255,255,0.07)`,
  color:"#bbb", width:28, height:28, borderRadius:6, cursor:"pointer",
  fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
};

export default function MovieRow({ title, movies, userdata, onOpen }) {
  const ref = useRef();
  if (!movies.length) return null;

  return (
    <section style={{ marginBottom:48 }}>
      <div style={{ display:"flex", alignItems:"center", marginBottom:13, gap:10 }}>
        <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(16px,2.2vw,22px)", color:C.text, margin:0 }}>
          {title}
        </h2>
        <div style={{ flex:1, height:1, background:`linear-gradient(to right,${C.border},transparent)` }} />
        <button onClick={() => ref.current?.scrollBy({left:-300, behavior:"smooth"})} style={sBtn}>‹</button>
        <button onClick={() => ref.current?.scrollBy({left: 300, behavior:"smooth"})} style={sBtn}>›</button>
      </div>
      <div ref={ref} style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:6, scrollbarWidth:"none" }}>
        {movies.map(m => <PosterCard key={m.id} movie={m} userdata={userdata} onOpen={onOpen} />)}
      </div>
    </section>
  );
}
