"use client";

import TeX from "@/components/TeX";
import FigureFrame from "@/components/figures/FigureFrame";
import { OPERATIONS_FIGURE_SOURCES, type OperationsFigureKind, toScientific } from "@/lib/operations-rational";

const SCI_EXAMPLE = toScientific("150000000")!;
const SHIFT_EXAMPLE = toScientific("31500000")!;

function DigitStrip({ value, highlight, label }: { value: string; highlight?: number; label: string }) {
  const digits = value.split("");
  return <div className="space-y-2">
    <p className="text-[11px] font-extrabold text-slate-500">{label}</p>
    <div className="flex flex-wrap items-center justify-center gap-1" dir="ltr">
      {digits.map((digit, index) => <span key={index} data-digit-index={index}
        className={`grid h-9 w-6 place-items-center rounded-md border text-sm font-black tabular-nums ${highlight === index ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-700"}`}>{digit}</span>)}
    </div>
  </div>;
}

function SciNotationScale() {
  return <div data-figure-art="sciNotationScale" className="space-y-6">
    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-center text-sm font-bold leading-8 text-amber-950">
      المسافة بين الأرض والشمس تُكتب بالكيلومتر: <bdi dir="ltr" className="font-black">150000000</bdi>
    </div>
    <DigitStrip value="150000000" highlight={1} label="العدد كاملًا (الفاصلة في نهاية العدد)" />
    <div className="flex flex-col items-center gap-2 text-sm font-bold text-slate-600">
      <span className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs text-rose-700">نُزيح الفاصلة <bdi dir="ltr" className="font-black">8</bdi> منازل نحو اليسار</span>
      <svg width="100%" viewBox="0 0 440 46" role="img" aria-label="سهم إزاحة الفاصلة ثمانية منازل"><path d="M 380 12 C 300 2, 170 2, 78 12" fill="none" stroke="#e11d48" strokeWidth="2" strokeDasharray="5 4" /><path d="M 78 12 l 10 -6 l 0 12 z" fill="#e11d48" /></svg>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-3 text-lg font-black text-emerald-900"><TeX tex={SCI_EXAMPLE.tex} /></div>
      <p className="text-center text-xs font-semibold leading-7 text-slate-600">العامل <bdi dir="ltr" className="font-black text-emerald-700">1.5</bdi> بين 1 و10، والأس يساوي عدد المنازل التي أزحناها.</p>
    </div>
    <div className="grid gap-2 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-center"><p className="text-[10px] font-bold text-slate-500">قوة العشرة</p><p className="mt-1 text-sm font-black text-slate-700" dir="ltr"><TeX tex="10^{8}=100000000" /></p></div>
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-center"><p className="text-[10px] font-bold text-slate-500">التحقق بالضرب</p><p className="mt-1 text-sm font-black text-slate-700" dir="ltr"><TeX tex="1.5\times100000000=150000000" /></p></div>
    </div>
    <p className="rounded-xl bg-slate-50 p-3 text-center text-[11px] font-bold leading-6 text-slate-600">مثال آخر من الدرس: <bdi dir="ltr"><TeX tex="10\times10\times10=10^{3}=1000" /></bdi></p>
  </div>;
}

function SciNotationShift() {
  return <div data-figure-art="sciNotationShift" className="space-y-5">
    <DigitStrip value="31500000" highlight={0} label="المثال: 31,500,000" />
    <div className="flex flex-col items-center gap-2">
      <span className="rounded-full border border-sky-200 bg-white px-4 py-1.5 text-xs font-bold text-sky-700">نُزيح الفاصلة <bdi dir="ltr" className="font-black">7</bdi> منازل نحو اليسار</span>
      <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 px-6 py-3 text-lg font-black text-sky-900"><TeX tex={SHIFT_EXAMPLE.tex} /></div>
    </div>
    <div className="grid gap-2 sm:grid-cols-3">
      {[{ k: "العدد", v: "31500000" }, { k: "العامل", v: "3.15" }, { k: "الأس", v: "7" }].map(item => <div key={item.k} className="rounded-xl border border-slate-200 bg-white p-3 text-center"><p className="text-[10px] font-bold text-slate-500">{item.k}</p><p className="mt-1 font-black text-slate-800" dir="ltr">{item.v}</p></div>)}
    </div>
    <p className="rounded-xl bg-emerald-50 p-3 text-center text-xs font-bold leading-7 text-emerald-900">إذا جمعنا المنازل التي أزحناها إلى موقع الفاصلة الأصلي عدنا إلى العدد نفسه: <bdi dir="ltr"><TeX tex="3.15\times10^{7}=31500000" /></bdi></p>
  </div>;
}

function FractionOperationsMap() {
  const cards = [
    { title: "إشارة الكسر", body: "نجعل المقام موجبًا، وتنتقل الإشارة إلى البسط أو أمام الكسر.", tex: "\\frac{a}{-b}=\\frac{-a}{b}=-\\frac{a}{b}" },
    { title: "الجمع والطرح", body: "نوحّد المقامات أولًا، ثم نجمع البسطين أو نطرحهما.", tex: "\\frac{a}{b}\\pm\\frac{c}{b}=\\frac{a\\pm c}{b}" },
    { title: "الضرب", body: "بسط في بسط ومقام في مقام، مع الاختزال قبل الضرب.", tex: "\\frac{a}{b}\\times\\frac{c}{d}=\\frac{a\\times c}{b\\times d}" },
    { title: "القسمة", body: "نضرب الكسر الأول في مقلوب الكسر الثاني.", tex: "\\frac{a}{b}\\div\\frac{c}{d}=\\frac{a}{b}\\times\\frac{d}{c}" },
  ];
  return <div data-figure-art="fractionOperationsMap" className="grid gap-3 sm:grid-cols-2">
    {cards.map(card => <div key={card.title} className="rounded-2xl border border-violet-200 bg-white p-4">
      <p className="text-xs font-black text-violet-700">{card.title}</p>
      <p className="mt-1 text-[11px] font-semibold leading-6 text-slate-600">{card.body}</p>
      <div className="mt-3 rounded-xl bg-violet-50 px-3 py-2 text-center text-sm text-violet-950"><TeX tex={card.tex} /></div>
    </div>)}
  </div>;
}

function CommonDenominatorBars() {
  const cells = 18;
  return <div data-figure-art="commonDenominatorBars" className="space-y-5">
    <div className="space-y-2" dir="ltr">
      <p className="text-[11px] font-extrabold text-slate-500" dir="rtl">الكسر 4/9 على شريط من 18 جزءًا</p>
      <div className="flex overflow-hidden rounded-xl border border-slate-300">{Array.from({ length: cells }, (_, i) => <div key={i} className={`h-9 flex-1 border-e border-white/70 last:border-e-0 ${i < 8 ? "bg-violet-500" : "bg-white"}`} />)}</div>
      <p className="text-[11px] font-extrabold text-slate-500" dir="rtl">الكسر 7/18 على الشريط نفسه</p>
      <div className="flex overflow-hidden rounded-xl border border-slate-300">{Array.from({ length: cells }, (_, i) => <div key={i} className={`h-9 flex-1 border-e border-white/70 last:border-e-0 ${i < 7 ? "bg-teal-500" : "bg-white"}`} />)}</div>
    </div>
    <p className="rounded-xl bg-slate-50 p-3 text-xs font-bold leading-7 text-slate-700">لأن <bdi dir="ltr" className="font-black">18 = 9 × 2</bdi> نضرب بسط 4/9 ومقامه في 2 فيصبح <bdi dir="ltr" className="font-black">8/18</bdi>، ثم نجمع أو نطرح على المقام 18 نفسه.</p>
    <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center text-sm font-black text-amber-900" dir="ltr"><TeX tex="-\frac{4}{9}+\frac{7}{18}-\frac{7}{18}=-\frac{8}{18}+\frac{7}{18}-\frac{7}{18}=-\frac{8}{18}=-\frac{4}{9}" /></p>
  </div>;
}

export function OperationsFigureArt({ kind }: { kind: OperationsFigureKind }) {
  switch (kind) {
    case "sciNotationScale": return <SciNotationScale />;
    case "sciNotationShift": return <SciNotationShift />;
    case "fractionOperationsMap": return <FractionOperationsMap />;
    case "commonDenominatorBars": return <CommonDenominatorBars />;
  }
}

export default function OperationsBookFigure({ figure }: { figure: OperationsFigureKind }) {
  const source = OPERATIONS_FIGURE_SOURCES[figure];
  return <FigureFrame kind={figure} title={source.title} detail={source.detail}><OperationsFigureArt kind={figure} /></FigureFrame>;
}
