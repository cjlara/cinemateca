import { C } from "../lib/constants.js";

export default function Nav({ tabs, activeTab, onTabChange, menuOpen, onMenuToggle, onSearch, onAI }) {
  return (
    <nav style={{ position:"sticky", top:0, zIndex:200, background:"rgba(7,7,15,0.97)", backdropFilter:"blur(16px)", borderBottom:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", height:54, padding:"0 14px", gap:3, maxWidth:1360, margin:"0 auto" }}>

        {/* Logo */}
        <span onClick={() => onTabChange("home")}
          style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:17, color:C.accent, marginRight:12, cursor:"pointer", userSelect:"none", flexShrink:0 }}>
          🎬 Cinemateca
        </span>

        {/* Scrollable tab strip */}
        <div style={{ display:"flex", alignItems:"center", gap:1, overflowX:"auto", scrollbarWidth:"none", flex:1 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => onTabChange(t.key)} style={{
              background:"none", border:"none",
              color: activeTab === t.key ? "#fff" : C.muted,
              padding:"5px 9px", borderRadius:6, cursor:"pointer",
              fontSize:"clamp(11px,1.3vw,13px)",
              fontWeight: activeTab === t.key ? 700 : 400,
              borderBottom: activeTab === t.key ? `2px solid ${C.accent}` : "2px solid transparent",
              display:"flex", alignItems:"center", gap:3, whiteSpace:"nowrap", flexShrink:0,
            }}>
              {t.label}
              {t.count > 0 && (
                <span style={{ background:t.bg, color:t.fg, borderRadius:10, padding:"1px 5px", fontSize:10, fontWeight:700 }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display:"flex", gap:6, marginLeft:6, flexShrink:0 }}>
          <button onClick={onAI} style={{ background:`${C.purple}22`, border:`1px solid ${C.purple}66`, color:C.purple, padding:"6px 12px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap" }}>
            ✨ IA
          </button>
          <button onClick={onSearch} style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, color:"#aaa", width:34, height:34, borderRadius:8, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>
            🔍
          </button>
          <button onClick={onMenuToggle} style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`, color:"#aaa", width:34, height:34, borderRadius:8, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div style={{ background:C.surface, borderTop:`1px solid ${C.border}`, padding:"8px 14px 12px", animation:"slideDown 0.16s ease" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => onTabChange(t.key)} style={{
              display:"flex", alignItems:"center", gap:8, width:"100%",
              background: activeTab===t.key ? `rgba(229,9,20,0.1)` : "none",
              border:`1px solid ${activeTab===t.key ? C.accent : "transparent"}`,
              color: activeTab===t.key ? "#fff" : C.dim,
              padding:"9px 13px", borderRadius:8, cursor:"pointer",
              fontSize:14, fontWeight: activeTab===t.key ? 700 : 400,
              marginBottom:3, textAlign:"left",
            }}>
              {t.label}
              {t.count > 0 && (
                <span style={{ background:t.bg, color:t.fg, borderRadius:10, padding:"1px 6px", fontSize:11, fontWeight:700, marginLeft:"auto" }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
          <div style={{ borderTop:`1px solid ${C.border}`, marginTop:6, paddingTop:8, display:"flex", flexDirection:"column", gap:3 }}>
            <button onClick={onAI} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", background:`${C.purple}11`, border:`1px solid ${C.purple}44`, color:C.purple, padding:"9px 13px", borderRadius:8, cursor:"pointer", fontSize:14, fontWeight:600, textAlign:"left" }}>
              ✨ Recomiéndame algo (IA)
            </button>
            <button onClick={onSearch} style={{ display:"flex", alignItems:"center", gap:8, width:"100%", background:"none", border:"none", color:C.dim, padding:"9px 13px", borderRadius:8, cursor:"pointer", fontSize:14, textAlign:"left" }}>
              🔍 Buscar
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
