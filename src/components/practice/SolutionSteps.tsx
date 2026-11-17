"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Footprints } from "lucide-react";
import type { LearningSolution } from "@/lib/practice-types";
import MathText from "@/components/MathText";
import TeX from "@/components/TeX";
import ExtraExplanationLabel from "@/components/ExtraExplanationLabel";
import { NumberLineDiagram } from "@/components/figures/NaturalNumberFigures";

export default function SolutionSteps({ solution }: { solution: LearningSolution }) {
  const [count, setCount] = useState(1);
  const complete = count === solution.steps.length;
  return <section className="practice-solution" data-practice-solution="true">
    <header className="flex flex-wrap items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-violet-600"><Footprints size={20}/></span><div className="flex-1"><h4 className="font-black text-ink">نفهم الحل، لا نحفظ الناتج</h4><p className="mt-1 text-[11px] text-slate-500">اكشف خطوة، وافهم سببها، ثم انتقل إلى التي تليها.</p></div><ExtraExplanationLabel/></header>
    <ol className="practice-solution-list">{solution.steps.slice(0,count).map((step,i) => <li key={i} data-solution-step={i+1}><span className="practice-solution-number" dir="ltr">{i+1}</span><div className="min-w-0 flex-1"><h5 className="text-sm font-extrabold text-violet-900">{step.title}</h5><p className="mt-1 text-sm leading-8 text-slate-600"><MathText text={step.text}/></p>{step.formula && <div className="practice-solution-formula"><TeX tex={step.formula} block/></div>}</div></li>)}</ol>
    {complete && <div className="space-y-4">{solution.point !== undefined && <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white"><NumberLineDiagram point={solution.point}/></div>}<div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-bold leading-8 text-emerald-900"><CheckCircle2 size={18} className="mt-1 shrink-0"/><MathText text={solution.final}/></div></div>}
    <div className="no-print mt-5 flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-bold text-slate-400">قرأت <bdi dir="ltr">{count} / {solution.steps.length}</bdi> خطوات</span>{!complete && <button type="button" className="btn btn-primary text-xs" onClick={() => setCount(c => Math.min(c+1,solution.steps.length))}>الخطوة التالية في الحل <ArrowLeft size={14}/></button>}{complete && <span className="text-xs font-bold text-emerald-700">الآن جرّب صياغة الحل بأسلوبك.</span>}</div>
  </section>;
}
