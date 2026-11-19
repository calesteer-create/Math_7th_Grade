"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { CheckCircle2, FlaskConical, Minus, Plus, RotateCcw } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import { BOOK_GROUPS, BOOK_NUMBER, BOOK_LINE_POINT, BOOK_LINE_MAX, placeColumns } from "@/lib/natural-numbers";
import { normalizeDigits } from "@/lib/numbers";
import { EllipticSet, NumberLineDiagram, PlaceValueDiagram } from "@/components/figures/NaturalNumberFigures";

const TABS = [{ id: "dots", title: "عدّ المجموعات" }, { id: "line", title: "مستقيم الأعداد" }, { id: "places", title: "استكشف المنازل" }] as const;
type Tool = typeof TABS[number]["id"];

export default function NaturalNumbersStudio({ mode = "full" }: { mode?: "full" | Tool }) {
  const [tab, setTab] = useState<Tool>(mode === "full" ? "dots" : mode);
  const [pick, setPick] = useState<string | null>(null);
  const [point, setPoint] = useState<number>(BOOK_LINE_POINT);
  const [number, setNumber] = useState<string>(BOOK_NUMBER);
  const [place, setPlace] = useState(0);
  const [inputError, setInputError] = useState(false);
  const uid = useId();
  const columns = placeColumns(number);
  const selected = columns.find(c => c.exponent === place);

  function changeTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowLeft") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowRight") next = (index + TABS.length - 1) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    setTab(TABS[next].id);
    document.getElementById(`${uid}-${TABS[next].id}`)?.focus();
  }
  function resetNumber(value: string) { setNumber(value); setPlace(0); setInputError(false); }

  return <section className="overflow-hidden rounded-[24px] border border-indigo-200 bg-white shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-l from-teal-600 to-cyan-600 px-6 py-5 text-white">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-amber-300"><FlaskConical size={23} /></span><div><p className="text-[10px] font-bold text-amber-200">تجربة إضافية · من الفهم إلى الاكتشاف</p><h3 className="mt-1 text-xl font-extrabold">أنت تتحكّم بالأعداد</h3></div></div>
      <span className="rounded-full border border-white/20 px-3 py-1.5 text-[11px] text-indigo-100">غيّر • لاحظ • فسّر</span>
    </div>
    <div className="p-5 md:p-6">
      {mode === "full" && <div className="mb-6 flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="أدوات مختبر الأعداد الطبيعية">
        {TABS.map((t, i) => <button key={t.id} id={`${uid}-${t.id}`} type="button" role="tab" aria-controls={`${uid}-panel`} aria-selected={tab === t.id} tabIndex={tab === t.id ? 0 : -1} onKeyDown={e => changeTab(e, i)} onClick={() => setTab(t.id)} className={`flex-1 rounded-lg px-2 py-2.5 text-xs font-extrabold outline-offset-2 transition focus-visible:outline-2 focus-visible:outline-indigo-500 ${tab === t.id ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-indigo-600"}`}>{t.title}</button>)}
      </div>}
      <div id={`${uid}-panel`} role={mode === "full" ? "tabpanel" : undefined} aria-labelledby={mode === "full" ? `${uid}-${tab}` : undefined}>
        {tab === "dots" && <div className="space-y-5">
          <div><h4 className="font-extrabold text-ink">أي مجموعة فيها 5 عناصر؟</h4><p className="mt-1 text-sm leading-7 text-slate-500">المجموعات نفسها من نشاط الكتاب. عُدّ النقاط داخل كل شكل، ثم اختر بطاقة.</p></div>
          <div dir="ltr" className="grid grid-cols-3 gap-3">{BOOK_GROUPS.map(group => <button key={group.label} type="button" aria-label={`اختر المجموعة ${group.label}`} aria-pressed={pick === group.label} onClick={() => setPick(group.label)} className={`rounded-2xl border-2 px-2 py-4 outline-offset-2 transition focus-visible:outline-2 focus-visible:outline-indigo-600 ${pick === group.label ? group.count === 5 ? "border-emerald-500 bg-emerald-50" : "border-rose-300 bg-rose-50" : "border-slate-100 bg-slate-50/60 hover:border-indigo-200 hover:bg-indigo-50/30"}`}><span className="font-serif text-xl font-bold italic text-slate-500"><TeX tex={group.label}/></span><EllipticSet dots={group.dots} label={`نقاط المجموعة ${group.label}`} warmup /><span className="block text-xs font-bold text-slate-500" dir="rtl">المجموعة <TeX tex={group.label}/></span></button>)}</div>
          {pick && <p role="status" className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold leading-7 ${pick === "A" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{pick === "A" && <CheckCircle2 size={18} className="shrink-0" />}{pick === "A" ? <MathText text="أحسنت! عدَدْتَ كل نقطة مرة واحدة، فوجدت 5 عناصر في المجموعة A."/> : "حاول مرة أخرى. تتبّع النقاط واحدةً واحدة، ولا تعدّ النقطة نفسها مرتين."}</p>}
        </div>}
        {tab === "line" && <div className="space-y-5">
          <div><h4 className="font-extrabold text-ink">حرّك النقطة، ثم اقرأ موضعها</h4><p className="mt-1 text-sm leading-7 text-slate-500">الخطوة إلى اليمين تزيد العدد بمقدار 1. القيم التي تختارها هنا تجربة إضافية؛ الشكل الأصلي يضع <TeX tex="M"/> عند 5.</p></div>
          <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-slate-50/60 px-2"><NumberLineDiagram point={point} /></div>
          <div className="flex items-center gap-4 rounded-xl border border-slate-200 px-4 py-3" dir="ltr"><button type="button" aria-label="إنقاص موضع النقطة" disabled={point === 0} onClick={() => setPoint(p => Math.max(0, p - 1))} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-100 disabled:opacity-30"><Minus size={16}/></button><input type="range" min={0} max={BOOK_LINE_MAX} step={1} value={point} onChange={e => setPoint(Number(e.target.value))} aria-label="موضع النقطة M" className="w-full accent-indigo-600" /><button type="button" aria-label="زيادة موضع النقطة" disabled={point === BOOK_LINE_MAX} onClick={() => setPoint(p => Math.min(BOOK_LINE_MAX, p + 1))} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-100 disabled:opacity-30"><Plus size={16}/></button></div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-indigo-50 px-5 py-4"><p className="text-sm font-semibold text-indigo-900" role="status">فاصلة النقطة <TeX tex="M"/> هي <bdi dir="ltr" className="mx-1 text-xl font-black">{point}</bdi>، وتبعد عن الصفر {point} فترات.</p><button type="button" onClick={() => setPoint(BOOK_LINE_POINT)} className="flex items-center gap-1.5 text-xs font-bold text-indigo-600"><RotateCcw size={14}/> استعادة رسم الكتاب</button></div>
        </div>}
        {tab === "places" && <div className="space-y-5">
          <div><h4 className="font-extrabold text-ink">المكان يصنع الفرق</h4><p className="mt-1 text-sm leading-7 text-slate-500">اضغط على رقم في الجدول لتكتشف قيمة منزلته. غيّر العدد لتجرّب مثالًا من عندك.</p></div>
          <div className="flex flex-wrap items-end gap-3"><div className="min-w-0"><label htmlFor={`${uid}-number`} className="mb-1.5 block text-xs font-bold text-slate-600">اكتب العدد</label><input id={`${uid}-number`} dir="ltr" inputMode="numeric" value={number} aria-invalid={inputError} aria-describedby={`${uid}-number-help`} onChange={e => { const next = normalizeDigits(e.target.value).replace(/\s+/g, ""); if (/^\d{0,12}$/.test(next)) resetNumber(next); else setInputError(true); }} className="input w-56 max-w-full text-left font-bold tracking-widest" /></div><button type="button" onClick={() => resetNumber(BOOK_NUMBER)} className="btn btn-ghost text-xs">عدد جدول الكتاب</button><button type="button" onClick={() => resetNumber("525793")} className="btn btn-ghost text-xs">استكشف الرقمين 5</button></div>
          <p id={`${uid}-number-help`} className={`text-[11px] ${inputError ? "font-bold text-rose-600" : "text-slate-400"}`} aria-live="polite">{inputError ? "استخدم أرقامًا (عربية أو إنجليزية) بحد أقصى 12 خانة، دون فواصل." : "أرقام عربية أو إنجليزية · حتى 12 خانة"}</p>
          <PlaceValueDiagram number={number} full={number === BOOK_NUMBER} selected={place} onSelect={setPlace} />
          {selected && <div className="rounded-2xl border border-amber-200/80 bg-amber-50 px-5 py-4" role="status"><div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-400 text-xl font-black text-white" dir="ltr">{selected.digit}</span><div><p className="text-xs font-extrabold text-amber-900">{selected.place} {selected.group}</p><p className="mt-0.5 text-[11px] text-amber-800">نضرب الرقم في قيمة منزلته</p></div></div><TeX block tex={`${selected.digit} \\times ${10 ** selected.exponent} = ${selected.value}`} className="mt-2 text-lg text-[#263454]" /></div>}
        </div>}
      </div>
    </div>
    <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-[10px] leading-5 text-slate-400">نسخة تفاعلية إضافية مبنية على مفاهيم الدرس. الرسوم المرجعية الثابتة في الشرح لا تتغيّر.</div>
  </section>;
}
