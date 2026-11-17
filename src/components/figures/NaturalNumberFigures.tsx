"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BookOpen, Maximize2, X } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import DiagramMath from "@/components/DiagramMath";
import {
  BOOK_GROUPS, BOOK_LINE_MAX, BOOK_LINE_POINT, BOOK_NUMBER,
  COUNTING_GROUPS, FIGURE_SOURCES, LINE, lineX, placeColumns,
  type NaturalFigureKind,
} from "@/lib/natural-numbers";

type Dot = readonly [number, number];

/** الشكل البيضوي والنقاط، دون تحويل الرسم العلمي إلى رمز زخرفي. */
export function EllipticSet({ dots, label, warmup = false }: {
  dots: readonly Dot[]; label: string; warmup?: boolean;
}) {
  const id = useId();
  return <svg viewBox="0 0 100 112" className="mx-auto h-[106px] w-[96px]" role="img" aria-labelledby={`${id}-title`} direction="ltr">
    <title id={`${id}-title`}>{label}</title>
    <ellipse cx="50" cy="55" rx="32" ry="48" fill={warmup ? "#fffbeb" : "#fff"} stroke="#354164" strokeWidth="1.6" />
    {dots.map(([x, y], i) => <circle key={i} data-dot="true" cx={x} cy={y} r="5.6" fill={warmup ? "#ee4b5e" : "#ff9b38"} stroke={warmup ? "#9f2945" : "#e96c28"} strokeWidth="1.1" />)}
  </svg>;
}

export function WarmupDiagram() {
  return <div className="overflow-x-auto rounded-2xl border border-violet-200 bg-white">
    <table dir="ltr" className="w-full min-w-[540px] table-fixed border-collapse text-center" aria-label="جدول انطلاقة نشطة">
      <thead><tr>
        {BOOK_GROUPS.map(g => <th key={g.label} scope="col" aria-label={g.label} className="w-[21%] border-e border-violet-200 bg-violet-100/75 py-3 font-serif text-xl font-bold italic text-violet-900"><TeX tex={g.label}/></th>)}
        <th scope="col" className="bg-violet-50 px-4 text-xs font-bold text-violet-800" dir="rtl">اختر إجابة واحدة</th>
      </tr></thead>
      <tbody>
        <tr className="border-t border-violet-200">
          {BOOK_GROUPS.map(g => <td key={g.label} className="border-e border-violet-200 bg-amber-50/70 py-3"><EllipticSet dots={g.dots} label={`المجموعة ${g.label}: ${g.count} نقاط`} warmup /></td>)}
          <th scope="row" className="bg-emerald-50 px-4 text-sm font-semibold leading-7 text-emerald-950" dir="rtl">المجموعة التي عدد عناصرها <bdi dir="ltr" className="font-black">5</bdi> هي</th>
        </tr>
        <tr className="border-t border-violet-200">
          {BOOK_GROUPS.map(g => <td key={g.label} className="border-e border-violet-200 bg-violet-50 py-5 text-xl font-bold tabular-nums text-[#29345a]">{g.option}</td>)}
          <th scope="row" className="bg-emerald-50 px-4 py-4 text-sm font-semibold leading-7 text-emerald-950" dir="rtl">قيمة الرقم <bdi dir="ltr">4</bdi> حسب منزلته في العدد <bdi dir="ltr">7430</bdi> هي</th>
        </tr>
      </tbody>
    </table>
  </div>;
}

export function CountingDiagram() {
  const id = useId();
  return <svg viewBox="0 0 840 215" className="block w-full min-w-[480px]" role="img" aria-labelledby={`${id}-title ${id}-desc`} direction="ltr">
    <title id={`${id}-title`}>مجموعات العدّ من 0 إلى 4</title>
    <desc id={`${id}-desc`}>خمسة أشكال بيضوية، فيها على الترتيب 0 و1 و2 و3 و4 نقاط برتقالية. نقاط الاستمرار إلى اليمين تعني أن العدّ يستمر.</desc>
    {COUNTING_GROUPS.map((dots, count) => <g key={count} transform={`translate(${40 + count * 148}, 24)`} data-count={count}>
      <ellipse cx="50" cy="62" rx="38" ry="57" fill="#fff" stroke="#465477" strokeWidth="1.7" />
      {dots.map(([x, y], i) => <circle key={i} data-dot="true" cx={x} cy={y + 7} r="6.4" fill="#ffa43a" stroke="#f37626" strokeWidth="1.2" />)}
      <DiagramMath tex={String(count)} x={26} y={127} width={48} height={34} fontSize={21} color="#34416a"/>
    </g>)}
    {[770, 788, 806].map(x => <circle key={x} cx={x} cy="86" r="2.5" fill="#64748b" />)}
  </svg>;
}

/** الصفر يسارًا؛ المسافات متساوية ولا تتأثر باتجاه الصفحة العربي. */
export function NumberLineDiagram({ point = BOOK_LINE_POINT }: { point?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const value = Math.max(0, Math.min(BOOK_LINE_MAX, Math.round(point)));
  const x = lineX(value);
  const arrowEnd = x - 8;
  return <svg viewBox={`0 0 ${LINE.width} ${LINE.height}`} className="block w-full min-w-[540px]" role="img" aria-labelledby={`${uid}-title ${uid}-desc`} direction="ltr" data-number-line="true">
    <title id={`${uid}-title`}>{`مستقيم الأعداد والنقطة M عند ${value}`}</title>
    <desc id={`${uid}-desc`}>تدريجات متساوية من 0 إلى 12 تتزايد نحو اليمين. تبعد النقطة M عند {value} عن الصفر {value} فترات.</desc>
    <defs>
      <marker id={`${uid}-axis`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 8 4.5 L 0 9 L 2 4.5 Z" fill="#34416a" /></marker>
      <marker id={`${uid}-arc`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 8 4.5 L 0 9 Z" fill="#34416a" /></marker>
    </defs>
    <line x1="24" y1={LINE.y} x2="813" y2={LINE.y} stroke="#34416a" strokeWidth="1.8" markerEnd={`url(#${uid}-axis)`} />
    {Array.from({ length: 13 }, (_, i) => <g key={i} data-tick={i}>
      <line x1={lineX(i)} x2={lineX(i)} y1={LINE.y - 8} y2={LINE.y + 8} stroke="#66718a" strokeWidth="1.5" />
      <DiagramMath tex={String(i)} x={lineX(i)-20} y={LINE.y+12} width={40} height={32} fontSize={19} color={i === value ? "#058063" : "#536078"}/>
    </g>)}
    {value > 0 && <path d={`M ${LINE.start} ${LINE.y - 19} Q ${(LINE.start + arrowEnd) / 2} ${Math.max(18, 112 - value * 12)} ${arrowEnd} ${LINE.y - 17}`} fill="none" stroke="#34416a" strokeWidth="1.8" markerEnd={`url(#${uid}-arc)`} />}
    <circle cx={x} cy={LINE.y} r="15" fill="#10b981" fillOpacity="0.10" />
    <circle data-point="M" cx={x} cy={LINE.y} r="6" fill="#059669" stroke="white" strokeWidth="2" />
    <DiagramMath tex="M" x={x+5} y={LINE.y-58} width={36} height={34} fontSize={24} color="#047857"/>
  </svg>;
}

const COLUMN_TONES = ["bg-orange-50 text-orange-900", "bg-sky-50 text-sky-900", "bg-lime-50 text-lime-900"];

/** جدول HTML متجهي قابل للقراءة والتكبير والطباعة؛ نفس الأعمدة والأصفار في المصدر. */
export function PlaceValueDiagram({ number = BOOK_NUMBER, selected, onSelect, full = true }: {
  number?: string; selected?: number; onSelect?: (exponent: number) => void; full?: boolean;
}) {
  const columns = placeColumns(number, full);
  if (!columns.length) return <p className="rounded-xl bg-slate-50 p-5 text-sm text-slate-500" role="status">اكتب عددًا من 1 إلى 12 خانة لتظهر منازله.</p>;
  const groups = columns.filter((_, i) => i % 3 === 0);
  return <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-white">
    <table dir="ltr" className="w-full min-w-[600px] table-fixed border-collapse text-center" aria-label={`جدول منازل العدد ${number}`}>
      <thead>
        <tr>{groups.map(g => <th key={g.group} colSpan={3} scope="colgroup" className="border-e border-amber-200 bg-amber-100/80 px-2 py-4 text-sm font-extrabold text-amber-900 last:border-e-0" dir="rtl">{g.group}</th>)}</tr>
        <tr>{columns.map(c => <th key={c.exponent} scope="col" className={`border-e border-t border-amber-200/80 py-3 text-[12px] font-bold last:border-e-0 ${COLUMN_TONES[c.exponent % 3]}`} dir="rtl">{c.place}</th>)}</tr>
      </thead>
      <tbody><tr>{columns.map(c => <td key={c.exponent} className={`border-e border-t border-amber-200/80 p-1.5 last:border-e-0 ${COLUMN_TONES[c.exponent % 3]}`}>
        {onSelect ? <button type="button" aria-label={`${c.place} ${c.group}: ${c.digit}`} aria-pressed={selected === c.exponent} onClick={() => onSelect(c.exponent)} className={`w-full rounded-lg py-3 text-xl font-black tabular-nums outline-offset-2 transition focus-visible:outline-2 focus-visible:outline-indigo-600 ${selected === c.exponent ? "bg-indigo-600 text-white shadow-md" : "hover:bg-white/80"}`}>{c.digit}</button> : <span className="block py-3 text-xl font-bold tabular-nums" data-place={c.exponent}>{c.digit}</span>}
      </td>)}</tr></tbody>
    </table>
  </div>;
}

export function NaturalFigureArt({ kind }: { kind: NaturalFigureKind }) {
  switch (kind) {
    case "warmup": return <WarmupDiagram />;
    case "counting": return <CountingDiagram />;
    case "numberLine": return <NumberLineDiagram />;
    case "placeValue": return <PlaceValueDiagram />;
  }
}

function FigureZoom({ kind, onClose }: { kind: NaturalFigureKind; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const source = FIGURE_SOURCES[kind];
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} aria-labelledby={titleId} onClose={onClose} onCancel={event => { event.preventDefault(); ref.current?.close(); }}
    onClick={event => { if (event.target === event.currentTarget) ref.current?.close(); }}
    className="no-print fixed inset-0 m-auto max-h-[90vh] w-[min(1100px,94vw)] max-w-none overflow-auto rounded-[24px] border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-[#0f193c]/65 backdrop:backdrop-blur-sm">
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
      <div><span className="text-xs font-semibold text-indigo-500">تفاصيل أوضح · عرض مكبّر</span><h3 id={titleId} className="mt-1 text-lg font-extrabold">{source.title}</h3></div>
      <button type="button" onClick={() => ref.current?.close()} aria-label="إغلاق الرسم المكبّر" className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-indigo-600"><X size={19} /></button>
    </div>
    <div className="overflow-x-auto bg-[#fafbfd] p-7"><NaturalFigureArt kind={kind} /></div>
    <p className="border-t border-slate-100 px-6 py-4 text-xs leading-6 text-slate-500"><MathText text={source.detail}/></p>
  </dialog>;
}

export default function NaturalBookFigure({ figure }: { figure: NaturalFigureKind }) {
  const [zoomed, setZoomed] = useState(false);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const source = FIGURE_SOURCES[figure];
  const id = useId();
  return <>
    <figure data-book-figure={figure} aria-labelledby={`${id}-caption`} className="my-1 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_35px_-25px_rgba(25,37,79,.30)] print:break-inside-avoid print:shadow-none">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen size={17} /></span><div><p className="text-[10px] font-extrabold text-indigo-500">تأمّل الشكل وافهم الفكرة</p><h3 className="mt-0.5 text-sm font-extrabold text-[#243252]">{source.title}</h3></div></div>
        <button ref={zoomButton} type="button" onClick={() => setZoomed(true)} aria-label={`تكبير رسم ${source.title}`} className="no-print flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"><Maximize2 size={13} /> تكبير</button>
      </div>
      <div className="overflow-x-auto bg-[#fbfcff] px-4 py-6 md:px-6"><NaturalFigureArt kind={figure} /></div>
      <figcaption id={`${id}-caption`} className="flex flex-wrap items-start justify-between gap-2 border-t border-slate-100 px-5 py-3 text-[11px] leading-5 text-slate-500"><span className="max-w-xl"><MathText text={source.detail}/></span></figcaption>
    </figure>
    {zoomed && <FigureZoom kind={figure} onClose={() => { setZoomed(false); zoomButton.current?.focus({ preventScroll: true }); }} />}
  </>;
}
