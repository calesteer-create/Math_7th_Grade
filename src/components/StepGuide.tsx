"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Route } from "lucide-react";
import MathText from "@/components/MathText";

export default function StepGuide({ title, intro, titles, panels }: { title: string; intro?: string; titles: string[]; panels: ReactNode[] }) {
  const [active, setActive] = useState(0);
  const uid = useId();
  const body = useRef<HTMLDivElement>(null);
  function move(index: number) { setActive(index); body.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = event.key === "ArrowLeft" ? (index + 1) % titles.length : event.key === "ArrowRight" ? (index + titles.length - 1) % titles.length : event.key === "Home" ? 0 : event.key === "End" ? titles.length - 1 : null;
    if (next === null) return;
    event.preventDefault(); setActive(next); document.getElementById(`${uid}-tab-${next}`)?.focus();
  }
  return <section data-step-guide="true" className="step-guide">
    <header className="mb-5"><div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-brand-600"><Route size={16} /> مسار الفهم · فكرة واحدة في كل خطوة</div><h3 className="text-xl font-black text-ink">{title}</h3>{intro && <p className="mt-2 text-sm leading-8 text-slate-500"><MathText text={intro}/></p>}</header>
    <div role="tablist" aria-label="أفكار الشرح الموسّع" className="guide-tabs no-print">
      {titles.map((t, i) => <button key={i} type="button" id={`${uid}-tab-${i}`} role="tab" aria-selected={i === active} aria-controls={`${uid}-panel`} tabIndex={i === active ? 0 : -1} onKeyDown={e => handleKey(e, i)} onClick={() => setActive(i)} className={`guide-tab ${i === active ? "is-active" : ""}`}><span dir="ltr">{String(i + 1).padStart(2, "0")}</span>{t}</button>)}
    </div>
    <div ref={body} id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${active}`} className="scroll-mt-36" key={active}>{panels[active]}</div>
    <div className="no-print mt-6 flex items-center justify-between gap-3 border-t border-violet-100 pt-4"><button type="button" className="btn btn-ghost text-xs disabled:opacity-35" onClick={() => move(active - 1)} disabled={active === 0}><ArrowRight size={14}/> الفكرة السابقة</button><span className="text-[11px] font-bold text-slate-400">فكرة <bdi dir="ltr">{active + 1}</bdi> من <bdi dir="ltr">{titles.length}</bdi></span><button type="button" className="btn btn-primary text-xs disabled:opacity-35" onClick={() => move(active + 1)} disabled={active === titles.length - 1}>الفكرة التالية <ArrowLeft size={14}/></button></div>
  </section>;
}
