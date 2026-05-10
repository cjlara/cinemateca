import { C } from "../lib/constants.js";

export default function SkeletonRow({ title }) {
  return (
    <section style={{ marginBottom:48 }}>
      <div style={{ marginBottom:13 }}>
        <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(16px,2.2vw,22px)", color:C.text, margin:0 }}>{title}</h2>
      </div>
      <div style={{ display:"flex", gap:12 }}>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="skeleton"
            style={{ width:136, aspectRatio:"2/3", borderRadius:11, flexShrink:0, animationDelay:`${i*0.08}s` }} />
        ))}
      </div>
    </section>
  );
}
