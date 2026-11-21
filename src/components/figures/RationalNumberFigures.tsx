"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { BookOpen, Maximize2, X } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import DiagramMath from "@/components/DiagramMath";
import {
  RATIONAL_CHECK_LINE,
  RATIONAL_FIGURE_SOURCES,
  RATIONAL_TOP_LINE,
  RATIONAL_WARMUP_ROWS,
  fractionTeX,
  type Fraction,
  type RationalFigureKind,
} from "@/lib/rational-numbers";

const LINE_WIDTH = 840;
const LINE_START = 40;

function lineX(value: number, min: number, max: number, width = LINE_WIDTH) {
  return LINE_START + ((value - min) / (max - min)) * (width - LINE_START * 2);
}

/** جدول انطلاقة نشطة: نفس الأعداد والكسور والأعمدة، دون تعليم الإجابة الصحيحة. */
function RationalWarmupDiagram() {
  return (
    <div data-figure-art="rationalWarmup" className="overflow-x-auto rounded-2xl border border-violet-200 bg-white">
      <table dir="ltr" className="w-full min-w-[620px] table-fixed border-collapse text-center" aria-label="جدول انطلاقة نشطة: لكل عدد ثلاث كتابات">
        <thead>
          <tr>
            <th scope="col" className="w-[14%] border-e border-violet-200 bg-violet-100/75 py-3 font-serif text-xl font-bold italic text-violet-900"><TeX tex="A" /></th>
            <th scope="col" className="w-[14%] border-e border-violet-200 bg-violet-100/75 py-3 font-serif text-xl font-bold italic text-violet-900"><TeX tex="B" /></th>
            <th scope="col" className="w-[14%] border-e border-violet-200 bg-violet-100/75 py-3 font-serif text-xl font-bold italic text-violet-900"><TeX tex="C" /></th>
            <th scope="col" className="bg-violet-50 px-4 text-xs font-bold text-violet-800" dir="rtl">في كل سطر إجابة واحدة صحيحة، أشر إليها</th>
          </tr>
        </thead>
        <tbody>
          {RATIONAL_WARMUP_ROWS.map((row, index) => (
            <tr key={row.value} className={index % 2 ? "bg-amber-50/50" : "bg-yellow-50/40"}>
              {(["A", "B", "C"] as const).map(option => (
                <td key={option} className="border-e border-t border-violet-200 px-2 py-4 text-lg text-[#29345a]" data-warmup-option={`${row.value}-${option}`}>
                  <TeX tex={fractionTeX(row.options[option], false)} />
                </td>
              ))}
              <th scope="row" className="border-t border-violet-200 bg-emerald-50 px-4 py-4 text-sm font-semibold leading-7 text-emerald-950" dir="rtl">
                العدد <bdi dir="ltr" className="font-black">{row.value}</bdi> يمكن كتابته
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** تداخل المجموعات N داخل Z داخل Q كما في الرسم المرجعي. */
function RationalSetNestingDiagram() {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <div className="overflow-x-auto rounded-2xl border border-emerald-200 bg-white p-2">
      <svg viewBox="0 0 540 310" className="mx-auto block w-full min-w-[420px]" role="img" aria-labelledby={`${id}-title ${id}-desc`} direction="ltr" data-set-nesting="true">
        <title id={`${id}-title`}>تداخل مجموعات الأعداد الطبيعية والصحيحة والعادية</title>
        <desc id={`${id}-desc`}>ثلاثة أشكال متداخلة: الأعداد الطبيعية N في الداخل، ثم الأعداد الصحيحة Z، ثم الأعداد العادية Q في الخارج.</desc>
        <g transform="rotate(-18 270 155)">
          <ellipse cx="270" cy="155" rx="230" ry="128" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="2.2" />
          <ellipse cx="270" cy="155" rx="164" ry="86" fill="#eef2ff" stroke="#4f46e5" strokeWidth="2.2" />
          <ellipse cx="270" cy="155" rx="96" ry="48" fill="#ecfeff" stroke="#0891b2" strokeWidth="2.2" />
        </g>
        <DiagramMath tex="\mathbb{Q}" x={392} y={36} width={104} height={50} fontSize={32} color="#6d28d9" />
        <DiagramMath tex="\mathbb{Z}" x={344} y={92} width={62} height={40} fontSize={29} color="#4338ca" />
        <DiagramMath tex="\mathbb{N}" x={246} y={132} width={56} height={38} fontSize={26} color="#0e7490" />
      </svg>
      <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-bold text-slate-600">
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-cyan-500" />الأعداد الطبيعية <TeX tex="\mathbb{N}" /></li>
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-indigo-600" />الأعداد الصحيحة <TeX tex="\mathbb{Z}" /></li>
        <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-600" />الأعداد العادية <TeX tex="\mathbb{Q}" /></li>
      </ul>
    </div>
  );
}

/** مستقيم الأعداد المرجعي ص14 مع النقطتين -1/2 و5/4. */
function RationalTopLineDiagram() {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const { min, max, points } = RATIONAL_TOP_LINE;
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="overflow-x-auto rounded-2xl border border-sky-200 bg-white p-2">
      <svg viewBox="0 0 840 160" className="block w-full min-w-[600px]" role="img" aria-labelledby={`${id}-title ${id}-desc`} direction="ltr" data-rational-line="true">
        <title id={`${id}-title`}>مستقيم الأعداد من -3 إلى +3 والنقطتان -1/2 و5/4</title>
        <desc id={`${id}-desc`}>القيمة تزداد من اليسار إلى اليمين. النقطة -1/2 تقع بين -1 و0، والنقطة 5/4 تقع بين 1 و2.</desc>
        <defs>
          <marker id={`${id}-arrow`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M 0 0 L 8 4.5 L 0 9 L 2 4.5 Z" fill="#34416a" />
          </marker>
        </defs>
        <line x1="24" y1="96" x2="820" y2="96" stroke="#34416a" strokeWidth="1.9" markerEnd={`url(#${id}-arrow)`} />
        {ticks.map(tick => {
          const x = lineX(tick, min, max);
          return (
            <g key={tick} data-tick={tick}>
              <line x1={x} x2={x} y1={tick === 0 ? 86 : 90} y2={tick === 0 ? 106 : 102} stroke={tick === 0 ? "#0f172a" : "#64748b"} strokeWidth={tick === 0 ? 2.4 : 1.6} />
              <DiagramMath tex={String(tick)} x={x - 20} y={108} width={40} height={30} fontSize={17} color={tick === 0 ? "#0f172a" : "#52607a"} />
            </g>
          );
        })}
        {points.map(point => {
          const value = point.fraction.numerator / point.fraction.denominator;
          const x = lineX(value, min, max);
          return (
            <g key={point.tex} data-point={point.fraction.numerator / point.fraction.denominator}>
              <line x1={x} x2={x} y1="96" y2="62" stroke={point.color} strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx={x} cy="96" r="7" fill={point.color} stroke="white" strokeWidth="2" />
              <DiagramMath tex={point.tex} x={x - 30} y={22} width={60} height={38} fontSize={20} color={point.color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** خط وسيم المرجعي: A عند 7/2 وB عند -14/3 فقط، وبقية النقط تمارين لا تُكشف هنا. */
function RationalCheckLineDiagram() {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const { min, max, given } = RATIONAL_CHECK_LINE;
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-white p-2">
      <svg viewBox="0 0 900 190" className="block w-full min-w-[660px]" role="img" aria-labelledby={`${id}-title ${id}-desc`} direction="ltr" data-rational-check-line="true">
        <title id={`${id}-title`}>مستقيم أعداد من -6 إلى +6 عليه A عند 7/2 وB عند -14/3</title>
        <desc id={`${id}-desc`}>تمثيل بدأه وسيم: A عند سبعة أنصاف (3.5)، وB عند سالب أربعة عشر ثلثًا (حوالي -4.67). بقية النقط مطلوبة في التمرين.</desc>
        <defs>
          <marker id={`${id}-arrow`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M 0 0 L 8 4.5 L 0 9 L 2 4.5 Z" fill="#34416a" />
          </marker>
        </defs>
        <line x1="24" y1="112" x2="876" y2="112" stroke="#34416a" strokeWidth="1.9" markerEnd={`url(#${id}-arrow)`} />
        {ticks.map(tick => {
          const x = lineX(tick, min, max, 900);
          return (
            <g key={tick} data-tick={tick}>
              <line x1={x} x2={x} y1={tick === 0 ? 102 : 106} y2={tick === 0 ? 122 : 118} stroke={tick === 0 ? "#0f172a" : "#64748b"} strokeWidth={tick === 0 ? 2.4 : 1.5} />
              <DiagramMath tex={String(tick)} x={x - 20} y={124} width={40} height={30} fontSize={16} color={tick === 0 ? "#0f172a" : "#52607a"} />
            </g>
          );
        })}
        {given.map(point => {
          const value = point.fraction.numerator / point.fraction.denominator;
          const x = lineX(value, min, max, 900);
          return (
            <g key={point.label} data-given-point={point.label}>
              <line x1={x} x2={x} y1="112" y2="70" stroke={point.color} strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx={x} cy="112" r="7.5" fill={point.color} stroke="white" strokeWidth="2" />
              <DiagramMath tex={point.label} x={x - 26} y={40} width={52} height={30} fontSize={21} color={point.color} />
              <DiagramMath tex={point.tex} x={x + 24} y={22} width={64} height={38} fontSize={19} color={point.color} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function RationalFigureArt({ kind }: { kind: RationalFigureKind }) {
  switch (kind) {
    case "rationalWarmup": return <RationalWarmupDiagram />;
    case "rationalSetNesting": return <RationalSetNestingDiagram />;
    case "rationalNumberLine": return <RationalTopLineDiagram />;
    case "rationalCheckLine": return <RationalCheckLineDiagram />;
  }
}

function FigureZoom({ kind, onClose }: { kind: RationalFigureKind; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const source = RATIONAL_FIGURE_SOURCES[kind];
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={onClose} onCancel={event => { event.preventDefault(); ref.current?.close(); }}
      onClick={event => { if (event.target === event.currentTarget) ref.current?.close(); }}
      className="no-print fixed inset-0 m-auto max-h-[90vh] w-[min(1100px,94vw)] max-w-none overflow-auto rounded-[24px] border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-[#0f193c]/65 backdrop:backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div><span className="text-xs font-semibold text-indigo-500">تفاصيل أوضح · عرض مكبّر</span><h3 id={titleId} className="mt-1 text-lg font-extrabold">{source.title}</h3></div>
        <button type="button" onClick={() => ref.current?.close()} aria-label="إغلاق الرسم المكبّر" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-indigo-600"><X size={19} /></button>
      </div>
      <div className="overflow-x-auto bg-[#fafbfd] p-7"><RationalFigureArt kind={kind} /></div>
      <p className="border-t border-slate-100 px-6 py-4 text-xs leading-6 text-slate-500"><MathText text={source.detail} /></p>
    </dialog>
  );
}

function RationalFigure({ kind, children }: { kind: RationalFigureKind; children: ReactNode }) {
  const [zoomed, setZoomed] = useState(false);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const source = RATIONAL_FIGURE_SOURCES[kind];
  const id = useId();
  return (
    <>
      <figure data-book-figure={kind} aria-labelledby={`${id}-caption`} className="my-1 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_35px_-25px_rgba(25,37,79,.30)] print:break-inside-avoid print:shadow-none">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen size={17} /></span>
            <div><p className="text-[10px] font-extrabold text-indigo-500">تأمّل الشكل وافهم الفكرة</p><h3 className="mt-0.5 text-sm font-extrabold text-[#243252]">{source.title}</h3></div>
          </div>
          <button ref={zoomButton} type="button" onClick={() => setZoomed(true)} aria-label={`تكبير رسم ${source.title}`} className="no-print flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"><Maximize2 size={13} /> تكبير</button>
        </div>
        <div className="overflow-x-auto bg-[#fbfcff] px-4 py-6 md:px-6">{children}</div>
        <figcaption id={`${id}-caption`} className="flex flex-wrap items-start justify-between gap-2 border-t border-slate-100 px-5 py-3 text-[11px] leading-5 text-slate-500"><span className="max-w-xl"><MathText text={source.detail} /></span></figcaption>
      </figure>
      {zoomed && <FigureZoom kind={kind} onClose={() => { setZoomed(false); zoomButton.current?.focus({ preventScroll: true }); }} />}
    </>
  );
}

export default function RationalBookFigure({ figure }: { figure: RationalFigureKind }) {
  return <RationalFigure kind={figure}><RationalFigureArt kind={figure} /></RationalFigure>;
}

export function fractionTeXForDisplay(fraction: Fraction) {
  return fractionTeX(fraction, false);
}
