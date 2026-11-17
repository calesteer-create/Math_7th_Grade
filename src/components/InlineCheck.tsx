"use client";

import { useState } from "react";
import { Eye, RotateCcw, CheckCircle2, MessageCircleQuestion } from "lucide-react";
import MathText from "@/components/MathText";
import ExtraExplanationLabel from "@/components/ExtraExplanationLabel";

export default function InlineCheck({ question, answer, hint, options, correctOption, supplementary = false }: {
  question: string; answer: string; hint?: string; options?: string[]; correctOption?: number; supplementary?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);
  const [rated, setRated] = useState<"ok" | "again" | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const canChoose = !!options?.length && correctOption !== undefined;
  const correct = choice === correctOption;
  return <section className="learning-card tone-lilac check-card" data-block-kind="check" data-content-origin={supplementary ? "supplement" : "book"}>
    <div className="learning-card-heading"><span className="learning-card-icon"><MessageCircleQuestion size={20}/></span><h3 className="flex-1 text-sm font-extrabold text-ink">توقّف لحظة وتحقّق</h3>{supplementary && <ExtraExplanationLabel/>}</div>
    <p className="lesson-prose font-bold"><MathText text={question}/></p>
    {canChoose ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{options!.map((option, i) => <button key={i} type="button" aria-pressed={choice===i} onClick={() => setChoice(i)} className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${choice === i ? correct ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-rose-300 bg-rose-50 text-rose-800" : "border-violet-200 bg-white text-violet-800 hover:border-violet-400"}`}><MathText text={option}/></button>)}</div> : !revealed && <button type="button" onClick={() => setRevealed(true)} className="btn btn-primary mt-4 text-xs"><Eye size={15}/> فكّرت في الإجابة، لنقارن</button>}
    {(revealed || choice !== null) && <div className="mt-4 space-y-3">
      <div role="status" className={`rounded-xl px-4 py-3 text-sm leading-8 ${canChoose && !correct ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"}`}>
        {canChoose && <strong className="mb-1 block">{correct ? "أحسنت! فكرتك صحيحة." : "اقتربت! جرّب من جديد بعد هذا التلميح."}</strong>}
        <MathText text={canChoose && !correct ? hint ?? "راجع الخطوات وحدّد المنزلة من اليمين أولًا." : answer}/>
      </div>
      {!canChoose && <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-slate-500">كيف تجد الفكرة الآن؟</span><button type="button" onClick={() => setRated("ok")} className={`rounded-full px-3 py-1.5 text-xs font-bold ${rated === "ok" ? "bg-emerald-600 text-white" : "bg-white text-emerald-700"}`}>فهمتها</button><button type="button" onClick={() => setRated("again")} className={`rounded-full px-3 py-1.5 text-xs font-bold ${rated === "again" ? "bg-amber-500 text-white" : "bg-white text-amber-700"}`}>أراجعها مرة أخرى</button>{rated === "ok" && <CheckCircle2 size={17} className="text-emerald-600"/>}{rated === "again" && <button type="button" onClick={() => {setRevealed(false);setRated(null);}} className="flex items-center gap-1 text-xs text-slate-500"><RotateCcw size={13}/> إعادة التفكير</button>}</div>}
      {!canChoose && hint && <p className="text-xs leading-7 text-slate-500"><MathText text={hint}/></p>}
    </div>}
  </section>;
}
