import TeX from "@/components/TeX";

/** زخرفة هندسية للهوية، وليست رسمًا علميًا أو شكلًا من الكتاب. */
export default function MathMotif({ compact = false }: { compact?: boolean }) {
  return <div className={`math-motif ${compact ? "is-compact" : ""}`} aria-hidden="true">
    <div className="motif-orbit"/>
    <div className="motif-main"><span className="motif-pin"/><TeX tex={String.raw`\mathbb{N}`} className="text-7xl"/><div className="motif-main-caption">كل فكرة تفتح أفقًا</div></div>
    <div className="motif-digits"><TeX tex={String.raw`0,\,1,\,2,\,3,\,\ldots`}/></div>
    <div className="motif-coral"><TeX tex="+" className="text-4xl"/></div>
    <div className="motif-sun"><svg viewBox="0 0 64 64" width="44" height="44"><path d="M32 5v54M5 32h54M13 13l38 38M13 51l38-38" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/></svg></div>
    <span className="motif-dot"/><span className="motif-squiggle"><svg viewBox="0 0 100 36"><path d="M3 26Q15 4 27 26T51 26T75 26T99 26" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg></span>
  </div>;
}
