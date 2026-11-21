"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BookOpen, Maximize2, X } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import DiagramMath from "@/components/DiagramMath";
import {
  BOOK_DIV_EXAMPLES,
  BOOK_MUL_EXAMPLES,
  BOOK_MUL_SHORT_ROWS,
  INTEGER_MUL_DIV_FIGURE_SOURCES,
  MULDIV_WARMUP_ROWS,
  buildMulPattern,
  type IntegersMulDivFigureKind,
} from "@/lib/integers-mul-div";

/** جدول انطلاقة نشطة ص 10 مطابق لصفوف وخيارات الكتاب. */
export function MulDivWarmupDiagram() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-violet-200 bg-white">
      <table dir="ltr" className="w-full min-w-[560px] border-collapse text-center" aria-label="جدول انطلاقة نشطة للضرب والقسمة">
        <thead>
          <tr>
            {["A", "B", "C"].map(letter => (
              <th
                key={letter}
                scope="col"
                className="w-[18%] border-e border-violet-200 bg-violet-100/80 py-3 font-serif text-lg font-bold italic text-violet-900"
              >
                <TeX tex={letter} />
              </th>
            ))}
            <th scope="col" className="bg-emerald-100/80 px-4 text-xs font-extrabold text-emerald-900" dir="rtl">
              في كل سطر إجابة واحدة صحيحة
            </th>
          </tr>
        </thead>
        <tbody>
          {MULDIV_WARMUP_ROWS.map((row, idx) => (
            <tr key={row.id} className="border-t border-violet-200">
              {row.options.map(opt => (
                <td
                  key={opt.key}
                  className={`border-e border-violet-200 px-2 py-3.5 text-base font-bold text-[#263454] ${
                    idx % 2 === 1 ? "bg-violet-50/60" : "bg-amber-50/50"
                  }`}
                >
                  {opt.tex ? <TeX tex={opt.tex} /> : <span dir="rtl">{opt.label}</span>}
                </td>
              ))}
              <th scope="row" className="bg-emerald-50/80 px-4 py-3 text-right text-sm font-bold leading-7 text-emerald-950" dir="rtl">
                <MathText text={row.prompt} />
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** مصفوفة قاعدة الإشارات وأمثلة الضرب الأربعة ص 10–11. */
export function MulDivSignMatrixDiagram() {
  const cells = [
    {
      pair: "(+) \\times (+)",
      sign: "+",
      title: "إشارتان متفقتان (موجبتان)",
      tone: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
      badge: "bg-emerald-600 text-white",
    },
    {
      pair: "(-) \\times (-)",
      sign: "+",
      title: "إشارتان متفقتان (سالبتان)",
      tone: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
      badge: "bg-emerald-600 text-white",
    },
    {
      pair: "(+) \\times (-)",
      sign: "-",
      title: "إشارتان مختلفتان",
      tone: "border-rose-200 bg-rose-50/70 text-rose-900",
      badge: "bg-rose-600 text-white",
    },
    {
      pair: "(-) \\times (+)",
      sign: "-",
      title: "إشارتان مختلفتان",
      tone: "border-rose-200 bg-rose-50/70 text-rose-900",
      badge: "bg-rose-600 text-white",
    },
  ];
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cells.map(cell => (
          <div key={cell.pair} className={`rounded-2xl border p-4 text-center ${cell.tone}`}>
            <div className="text-base font-extrabold">
              <TeX tex={cell.pair} />
            </div>
            <div className="my-2 flex justify-center">
              <span className={`grid h-9 w-9 place-items-center rounded-full text-lg font-black ${cell.badge}`} dir="ltr">
                {cell.sign}
              </span>
            </div>
            <p className="text-xs font-bold">{cell.title}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {BOOK_MUL_EXAMPLES.map(ex => (
          <div
            key={ex.tex}
            className={`rounded-xl border px-4 py-3 text-center ${
              ex.sameSign ? "border-emerald-200 bg-emerald-50/40" : "border-amber-200 bg-amber-50/40"
            }`}
          >
            <TeX tex={ex.tex} block className="text-base" />
            <p className="mt-1 text-xs font-bold text-slate-600">
              {ex.sameSign ? "الإشارة نفسها ← الناتج موجب" : "إشارتان مختلفتان ← الناتج سالب"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** سلّم النمط التوضيحي لـ (-4) × (-5) = +20 باستخدام SVG و DiagramMath. */
export function MulDivPatternLadderDiagram() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rows = buildMulPattern(-4, 2, -5);
  const xOf = (val: number) => 420 + val * 15; // مدى [-12, 24] داخل عرض 840
  const yAxis = 86;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2">
        <svg
          viewBox="0 0 840 138"
          className="block w-full min-w-[540px]"
          role="img"
          aria-label="تمثيل انتقال ناتج (-4) في النمط من -8 إلى +20 بزيادة +4 في كل خطوة"
          direction="ltr"
        >
          <defs>
            <marker id={`${uid}-ax`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0 0 L 7.5 4 L 0 8 Z" fill="#334155" />
            </marker>
            <marker id={`${uid}-step`} markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0 0 L 7 4 L 0 8 Z" fill="#0d9488" />
            </marker>
          </defs>
          <line x1="28" y1={yAxis} x2="812" y2={yAxis} stroke="#334155" strokeWidth="1.8" markerEnd={`url(#${uid}-ax)`} />
          {[-8, -4, 0, 4, 8, 12, 16, 20].map(val => {
            const x = xOf(val);
            const isZero = val === 0;
            const isTarget = val === 20;
            return (
              <g key={val}>
                <line x1={x} x2={x} y1={yAxis - 8} y2={yAxis + 8} stroke={isZero ? "#0f172a" : "#64748b"} strokeWidth={isZero ? 2.4 : 1.5} />
                <circle cx={x} cy={yAxis} r={isTarget ? 6 : 4.5} fill={isTarget ? "#059669" : val > 0 ? "#0d9488" : val < 0 ? "#e11d48" : "#334155"} />
                <DiagramMath tex={val > 0 ? `+${val}` : String(val)} x={x - 24} y={yAxis + 12} width={48} height={28} fontSize={14} color={isTarget ? "#065f46" : "#334155"} />
              </g>
            );
          })}
          {[-8, -4, 0, 4, 8, 12, 16].map(val => {
            const x1 = xOf(val);
            const x2 = xOf(val + 4);
            return (
              <g key={`arc-${val}`}>
                <path
                  d={`M ${x1} ${yAxis - 10} Q ${(x1 + x2) / 2} ${yAxis - 44} ${x2 - 4} ${yAxis - 10}`}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="1.7"
                  markerEnd={`url(#${uid}-step)`}
                />
                <DiagramMath tex="+4" x={(x1 + x2) / 2 - 16} y={yAxis - 52} width={32} height={22} fontSize={12} color="#0f766e" />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {rows.map(row => (
          <div
            key={row.b}
            className={`rounded-xl border p-2.5 text-center ${
              row.b === -5
                ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200"
                : row.b === 0
                  ? "border-slate-300 bg-slate-100/70"
                  : row.b < 0
                    ? "border-teal-200 bg-teal-50/50"
                    : "border-rose-200 bg-rose-50/40"
            }`}
          >
            <div className="text-xs font-bold text-slate-600">
              <TeX tex={`(-4)\\times(${row.b > 0 ? `+${row.b}` : row.b})`} />
            </div>
            <div className="mt-1 text-base font-black text-ink">
              <TeX tex={row.product > 0 ? `+${row.product}` : String(row.product)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** جدول الكتابة المختزلة للضرب ص 11. */
export function MulDivShortTableDiagram() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-white">
      <table className="w-full min-w-[440px] border-collapse text-center" dir="rtl" aria-label="جدول الكتابة المختزلة لعملية الضرب">
        <thead>
          <tr className="bg-amber-100/80 text-sm font-extrabold text-amber-950">
            <th scope="col" className="border-e border-amber-200 py-3">العملية</th>
            <th scope="col" className="border-e border-amber-200 py-3">الكتابة المختزلة</th>
            <th scope="col" className="py-3">السبب</th>
          </tr>
        </thead>
        <tbody>
          {BOOK_MUL_SHORT_ROWS.map(row => (
            <tr key={row.full} className="border-t border-amber-200/80 text-base">
              <td className="border-e border-amber-200/80 py-3"><TeX tex={row.full} /></td>
              <td className="border-e border-amber-200/80 py-3 font-extrabold text-violet-800"><TeX tex={row.short} /></td>
              <td className="px-3 py-3 text-xs font-bold text-slate-600">{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** أمثلة القسمة الستة ص 12 بصيغتي القسمة والكسر. */
export function MulDivDivisionExamplesDiagram() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BOOK_DIV_EXAMPLES.map(ex => {
          const same = ex.result > 0;
          return (
            <div
              key={ex.tex}
              className={`rounded-2xl border p-4 text-center ${
                same ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/50"
              }`}
            >
              <TeX tex={ex.tex} block className="text-lg" />
              <p className="mt-2 text-[11px] font-bold text-slate-600">
                {ex.fraction ? "قسمة بصيغة الكسر · " : "قسمة بالرمز المعتاد · "}
                {same ? "إشارتان متفقتان (+)" : "إشارتان مختلفتان (−)"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 text-center text-xs font-bold text-teal-950">
          <TeX tex="0\div(-3)=0" block className="text-base" />
          <p className="mt-1">الصفر مقسومًا على عدد غير معدوم يساوي صفرًا لأن <TeX tex="(-3)\times 0=0" />.</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-center text-xs font-bold text-rose-950">
          <TeX tex="4\div 0" block className="text-base" />
          <p className="mt-1">غير ممكنة لأن المقسوم عليه معدوم ولا يوجد عدد يحقق <TeX tex="0\times ?=4" />.</p>
        </div>
      </div>
    </div>
  );
}

export function IntegersMulDivFigureArt({ kind }: { kind: IntegersMulDivFigureKind }) {
  switch (kind) {
    case "muldivWarmup": return <MulDivWarmupDiagram />;
    case "muldivSignMatrix": return <MulDivSignMatrixDiagram />;
    case "muldivPatternLadder": return <MulDivPatternLadderDiagram />;
    case "muldivShortTable": return <MulDivShortTableDiagram />;
    case "muldivDivisionExamples": return <MulDivDivisionExamplesDiagram />;
  }
}

function IntegersMulDivFigureZoom({ kind, onClose }: { kind: IntegersMulDivFigureKind; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const source = INTEGER_MUL_DIV_FIGURE_SOURCES[kind];
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={event => { event.preventDefault(); ref.current?.close(); }}
      onClick={event => { if (event.target === event.currentTarget) ref.current?.close(); }}
      className="no-print fixed inset-0 m-auto max-h-[90vh] w-[min(1100px,94vw)] max-w-none overflow-auto rounded-[24px] border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-[#0f193c]/65 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <span className="text-xs font-semibold text-indigo-500">تفاصيل أوضح · عرض مكبّر</span>
          <h3 id={titleId} className="mt-1 text-lg font-extrabold"><MathText text={source.title} /></h3>
        </div>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="إغلاق الرسم المكبّر"
          className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <X size={19} />
        </button>
      </div>
      <div className="overflow-x-auto bg-[#fafbfd] p-7"><IntegersMulDivFigureArt kind={kind} /></div>
      <p className="border-t border-slate-100 px-6 py-4 text-xs leading-6 text-slate-500"><MathText text={source.detail} /></p>
    </dialog>
  );
}

export default function IntegersMulDivBookFigure({ figure }: { figure: IntegersMulDivFigureKind }) {
  const [zoomed, setZoomed] = useState(false);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const source = INTEGER_MUL_DIV_FIGURE_SOURCES[figure];
  const id = useId();
  return (
    <>
      <figure
        data-book-figure={figure}
        aria-labelledby={`${id}-caption`}
        className="my-1 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_35px_-25px_rgba(25,37,79,.30)] print:break-inside-avoid print:shadow-none"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen size={17} /></span>
            <div>
              <p className="text-[10px] font-extrabold text-indigo-500">تأمّل الشكل وافهم الفكرة</p>
              <h3 className="mt-0.5 text-sm font-extrabold text-[#243252]"><MathText text={source.title} /></h3>
            </div>
          </div>
          <button
            ref={zoomButton}
            type="button"
            onClick={() => setZoomed(true)}
            aria-label={`تكبير رسم ${source.title}`}
            className="no-print flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <Maximize2 size={13} /> تكبير
          </button>
        </div>
        <div className="overflow-x-auto bg-[#fbfcff] px-4 py-6 md:px-6"><IntegersMulDivFigureArt kind={figure} /></div>
        <figcaption id={`${id}-caption`} className="flex flex-wrap items-start justify-between gap-2 border-t border-slate-100 px-5 py-3 text-[11px] leading-5 text-slate-500">
          <span className="max-w-xl"><MathText text={source.detail} /></span>
        </figcaption>
      </figure>
      {zoomed && <IntegersMulDivFigureZoom kind={figure} onClose={() => { setZoomed(false); zoomButton.current?.focus({ preventScroll: true }); }} />}
    </>
  );
}
