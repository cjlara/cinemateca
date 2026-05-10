// SearchOverlay.jsx
import { useState, useEffect, useRef } from "react";
import { C } from "../lib/constants.js";
import { searchMulti } from "../lib/tmdb.js";
import PosterCard from "./PosterCard.jsx";

export function SearchOverlay({ userdata, onOpen, onClose }) {
  const [q,       setQ]       = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); }, []);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMulti(q);
        setResults((data.results||[]).filter(m => m.poster_path && m.media_type !== "person").slice(0,20));
      } finally { setLoading(false); }
    }, 380);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.93)", zIndex:900, backdropFilter:"blur(10px)", overflowY:"auto" }}>
      <div style={{ maxWidth:740, margin:"50px auto", padding:"0 20px" }}>
        <div style={{ position:"relative", marginBottom:26 }}>
          <span style={{ position:"absolute", left:15, top:"50%", transform:"translateY(-50%)", fontSize:16, color:C.muted }}>🔍</span>
          <input ref={ref} value={q} onChange={e=>setQ(e.target.value)}
            placeholder="Título, director, actor, género…"
            style={{ width:"100%", boxSizing:"border-box", background:"rgba(255,255,255,0.07)", border:`1px solid rgba(255,255,255,0.15)`, borderRadius:12, color:"#fff", fontSize:15, padding:"14px 14px 14px 46px", outline:"none", fontFamily:"'Playfair Display',Georgia,serif" }} />
          {q && <button onClick={()=>setQ("")} style={{ position:"absolute", right:13, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.muted, cursor:"pointer", fontSize:16 }}>✕</button>}
        </div>

        {loading && <div style={{ textAlign:"center", color:C.dim, padding:20 }}>Buscando…</div>}

        {results.length > 0 ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(128px,1fr))", gap:13 }}>
            {results.map(m => <PosterCard key={m.id} movie={m} userdata={userdata} onOpen={onOpen} />)}
          </div>
        ) : q.length > 1 && !loading ? (
          <div style={{ textAlign:"center", padding:54, color:"#444", fontSize:15 }}>Sin resultados para "{q}"</div>
        ) : (
          <div style={{ textAlign:"center", padding:32, color:"#333", fontSize:13 }}>Busca en millones de películas y series</div>
        )}

        <button onClick={onClose} style={{ display:"block", margin:"34px auto 0", background:"none", border:`1px solid #222`, color:C.muted, padding:"8px 24px", borderRadius:8, cursor:"pointer" }}>Cerrar</button>
      </div>
    </div>
  );
}

// AiPanel.jsx
export function AiPanel({ userdata, onClose }) {
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState([
    { role:"assistant", text:"¡Hola! Dime qué tipo de película o serie te apetece y te haré recomendaciones personalizadas. Por ejemplo: \"ciencia ficción con toques de fantasía y mucha acción\" o \"un drama europeo oscuro para una tarde de lluvia\"." }
  ]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const bottomRef = useRef();
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const buildCtx = () => {
    const watched   = Object.entries(userdata).filter(([,v])=>v.watched  ).map(([id])=>id).join(", ");
    const favorites = Object.entries(userdata).filter(([,v])=>v.favorite ).map(([id])=>id).join(", ");
    const ratings   = Object.entries(userdata).filter(([,v])=>v.rating   ).map(([id,v])=>`id:${id}(${v.rating}/5)`).join(", ");
    return [watched&&`IDs vistos:${watched}`, favorites&&`Favoritos:${favorites}`, ratings&&`Valoraciones:${ratings}`].filter(Boolean).join("\n");
  };

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setMessages(prev => [...prev, { role:"user", text:q }]);
    setInput(""); setLoading(true); setError("");

    const history = messages.map(m => ({ role:m.role==="user"?"user":"assistant", content:m.text }));

    try {
      const res = await fetch("/.netlify/functions/ai", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          system: `Eres un experto recomendador de cine y series. Responde en español. Sé concreto, entusiasta y breve (máx 200 palabras). Lista 2-4 títulos con una frase de por qué encajan con la petición.\nHistorial del usuario:\n${buildCtx()}`,
          messages: [...history, { role:"user", content:q }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b=>b.text||"").join("") || "Sin respuesta.";
      setMessages(prev => [...prev, { role:"assistant", text }]);
    } catch { setError("Error de conexión."); }
    finally  { setLoading(false); }
  };

  const C2 = { purple:"#8B5CF6", accent:"#E50914" };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:1000, overflowY:"auto", backdropFilter:"blur(8px)" }}>
      <div style={{ maxWidth:680, margin:"36px auto 80px", background:"#0d0d1a", borderRadius:20, overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 40px 100px rgba(0,0,0,0.9)", display:"flex", flexDirection:"column" }}>

        <div style={{ display:"flex", alignItems:"center", gap:14, padding:"20px 24px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ width:40, height:40, borderRadius:"50%", background:`linear-gradient(135deg,${C2.purple},${C2.accent})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>✨</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:18, color:"#e8e8f0" }}>Recomiéndame algo</div>
            <div style={{ fontSize:12, color:"#555" }}>IA personalizada · Claude Sonnet</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"1px solid rgba(255,255,255,0.07)", color:"#888", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        <div style={{ overflowY:"auto", padding:"20px 24px", display:"flex", flexDirection:"column", gap:14, minHeight:300, maxHeight:420 }}>
          {messages.map((m,i) => (
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
              {m.role==="assistant" && (
                <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${C2.purple},${C2.accent})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, marginRight:8, flexShrink:0, marginTop:2 }}>✨</div>
              )}
              <div style={{ maxWidth:"80%", padding:"10px 14px", borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px", background:m.role==="user"?`${C2.accent}22`:"rgba(255,255,255,0.05)", border:`1px solid ${m.role==="user"?`${C2.accent}55`:"rgba(255,255,255,0.07)"}`, color:"#e8e8f0", fontSize:14, lineHeight:1.65, whiteSpace:"pre-wrap" }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${C2.purple},${C2.accent})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>✨</div>
            <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"14px 14px 14px 4px", padding:"10px 16px", color:"#555", fontSize:13 }}>
              Pensando<span style={{ animation:"blink 1s infinite" }}>…</span>
            </div>
          </div>}
          {error && <div style={{ color:"#E50914", fontSize:13, textAlign:"center" }}>{error}</div>}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,0.07)", display:"flex", gap:10 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
            placeholder="Ej: algo de sci-fi con acción y toques de fantasía…"
            style={{ flex:1, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#e8e8f0", fontSize:14, padding:"10px 14px", outline:"none", fontFamily:"inherit" }} />
          <button onClick={send} disabled={loading||!input.trim()} style={{ background:input.trim()&&!loading?"#E50914":"#333", border:"none", color:"#fff", padding:"10px 18px", borderRadius:10, cursor:input.trim()&&!loading?"pointer":"default", fontSize:14, fontWeight:700, flexShrink:0, transition:"background 0.2s" }}>
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

// PersonOverlay.jsx
export function PersonOverlay({ person, role, onClose, onOpen }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Search TMDB for the person and get their filmography
    fetch(`/.netlify/functions/tmdb?path=/search/person&query=${encodeURIComponent(person)}&language=es-ES`)
      .then(r=>r.json())
      .then(data => {
        const p = data.results?.[0];
        if (!p) { setMovies([]); setLoading(false); return; }
        const known = p.known_for || [];
        setMovies(known);
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  }, [person]);

  const initials = name => name.split(" ").slice(0,2).map(w=>w[0]).join("");
  const avatarColor = name => { let h=0; for(let c of name) h=(h*31+c.charCodeAt(0))&0xffff; return `hsl(${h%360},40%,28%)`; };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", zIndex:2000, overflowY:"auto", backdropFilter:"blur(8px)" }}>
      <div style={{ maxWidth:820, margin:"44px auto 80px", background:"#0d0d1a", borderRadius:18, overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 40px 100px rgba(0,0,0,0.9)", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, zIndex:10, background:"rgba(0,0,0,0.6)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>

        <div style={{ padding:"32px 28px 24px", borderBottom:"1px solid rgba(255,255,255,0.07)", display:"flex", gap:18, alignItems:"center" }}>
          <div style={{ width:66, height:66, borderRadius:"50%", background:avatarColor(person), display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, fontWeight:800, color:"#fff", flexShrink:0 }}>
            {initials(person)}
          </div>
          <div>
            <div style={{ fontSize:10, color:"#555", textTransform:"uppercase", letterSpacing:1.5, marginBottom:3 }}>{role==="director"?"Director":"Actor / Actriz"}</div>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(18px,2.8vw,28px)", color:"#e8e8f0", margin:0 }}>{person}</h2>
          </div>
        </div>

        <div style={{ padding:"24px 28px 32px" }}>
          <h3 style={{ fontFamily:"'Playfair Display',Georgia,serif", color:"#e8e8f0", fontSize:15, margin:"0 0 14px", paddingBottom:8, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
            {role==="director"?"Como director":"Conocido por"}
          </h3>
          {loading
            ? <div style={{ color:"#555", textAlign:"center", padding:40 }}>Cargando filmografía…</div>
            : movies.length > 0
              ? <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:8, scrollbarWidth:"none" }}>
                  {movies.map(m => <PosterCard key={m.id} movie={m} userdata={{}} onOpen={mv=>{onClose();onOpen(mv);}} />)}
                </div>
              : <div style={{ color:"#555", fontSize:14 }}>No hay títulos disponibles en el catálogo.</div>
          }
        </div>
      </div>
    </div>
  );
}

// CollectionTab.jsx — shows saved movie IDs (loads minimal info from LS cache)
export function CollectionTab({ title, icon, ids, userdata, onOpen, emptyText }) {
  // Build minimal movie objects from stored data
  const movies = ids.map(id => ({ id: Number(id), ...(userdata[id]?.meta || {}) })).filter(m => m.title || m.poster_path);

  if (ids.length === 0) return (
    <div style={{ textAlign:"center", padding:"68px 24px" }}>
      <div style={{ fontSize:46, marginBottom:13 }}>{icon}</div>
      <p style={{ fontSize:14, lineHeight:1.7, maxWidth:350, margin:"0 auto", color:"#555" }}>{emptyText}</p>
    </div>
  );

  return (
    <>
      <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:23, marginBottom:24, color:"#e8e8f0" }}>{icon} {title} <span style={{ fontSize:16, color:"#555", fontWeight:400 }}>({ids.length})</span></h2>
      {movies.length > 0 ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(136px,1fr))", gap:13 }}>
          {movies.map(m => <PosterCard key={m.id} movie={m} userdata={userdata} onOpen={onOpen} />)}
        </div>
      ) : (
        <p style={{ color:"#555", fontSize:14 }}>Los datos de estas películas se cargarán la próxima vez que abras sus fichas.</p>
      )}
    </>
  );
}
