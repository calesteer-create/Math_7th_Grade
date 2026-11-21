"use client";

import { useId, useState } from "react";
import { ArrowDown, Check, MousePointer2 } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import { latinDigits, type PracticeField, type PracticeView } from "@/lib/practice-types";
import { RATIONAL_CHECK_SLOTS, RATIONAL_CHECK_LINE } from "@/lib/rational-numbers";

type Props = { view: PracticeView; response: Record<string, string>; onChange: (key: string, value: string) => void; disabled: boolean };

function rationalTeX(value: string) {
  if (value.includes("/")) {
    const [numerator, denominator] = value.split("/");
    return `\\frac{${numerator}}{${denominator}}`;
  }
  return value;
}

function NumericField({ field, value, onChange, disabled, unit }: { field: PracticeField; value: string; onChange: (value: string) => void; disabled: boolean; unit?: string }) {
  const id = useId();
  return <label htmlFor={id} className="practice-numeric-label">
    <span><MathText text={field.label} /></span>
    <span className="practice-input-wrap" dir="ltr">
      <input id={id} aria-label={field.label.replace(/\\\(|\\\)/g, "")} value={value} onChange={event => onChange(latinDigits(event.target.value))} inputMode="numeric" autoComplete="off" maxLength={20} disabled={disabled} placeholder="…" className="input" dir="ltr" />
      {unit && <span className="practice-unit">{unit}</span>}
    </span>
  </label>;
}

/** جدول انطلاقة نشطة: لكل عدد صف، وفيه ثلاثة أزرار A وB وC. */
function WarmupWidget({ view, response, onChange, disabled }: Props) {
  return <div className="space-y-3" dir="rtl">
    {view.fields.map((field, index) => <div key={field.key} className="grid items-center gap-3 rounded-2xl border border-violet-200 bg-white p-3 sm:grid-cols-[1fr_auto]">
      <div className="flex items-center gap-2 text-sm font-extrabold text-ink"><span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-100 text-xs text-violet-700" dir="ltr">{index + 1}</span><MathText text={field.label} /></div>
      <div className="flex gap-2" role="group" aria-label={field.label}>
        {(field.choices ?? ["A", "B", "C"]).map(choice => {
          const selected = response[field.key] === choice;
          return <button key={choice} type="button" disabled={disabled} aria-pressed={selected} aria-label={`${choice}: ${field.label}`} onClick={() => onChange(field.key, choice)} className={`flex min-w-12 items-center justify-center gap-1 rounded-xl border px-3 py-2 text-sm font-black transition ${selected ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`} dir="ltr"><TeX tex={choice} />{selected && <Check size={13} />}</button>;
        })}
      </div>
    </div>)}
    <p className="practice-widget-note"><MousePointer2 size={13} /> اختر العمود الذي يحمل الكتابة الصحيحة للعدد؛ يمكنك فحص كل كسر بقسمة بسطه على مقامه.</p>
  </div>;
}

/** حقول عددية مرتبة كما في ورقة التمرين. */
function NumericWidget({ view, response, onChange, disabled }: Props) {
  return <div className="grid gap-3 sm:grid-cols-2">
    {view.fields.map(field => <div key={field.key} className="rounded-xl border border-slate-200 bg-white p-3">
      <NumericField field={field} value={response[field.key] ?? ""} onChange={value => onChange(field.key, value)} disabled={disabled} />
    </div>)}
  </div>;
}

/** مطابقة الحروف C..H بمواضعها الستة على مستقيم الأعداد. */
function LineWidget({ view, response, onChange, disabled }: Props) {
  const [card, setCard] = useState<string | null>(null);
  const choices = view.fields[0]?.choices ?? [];
  const tasks = RATIONAL_CHECK_LINE.tasks;
  const slots = RATIONAL_CHECK_SLOTS;
  const min = RATIONAL_CHECK_LINE.min;
  const max = RATIONAL_CHECK_LINE.max;
  const start = 50;
  const width = 740;
  const y = 96;
  const xOf = (value: number) => start + ((value - min) / (max - min)) * width;
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  function place(key: string, value: string) {
    if (disabled || !choices.includes(value)) return;
    // الحرف الواحد يُسند إلى موضع واحد؛ نقله من موضع سابق يحرّره.
    for (const field of view.fields) {
      if (field.key !== key && response[field.key] === value) onChange(field.key, "");
    }
    onChange(key, value);
    setCard(null);
  }

  return <div className="space-y-4">
    <div className="practice-palette" dir="ltr" aria-label="بطاقات الحروف والقيم">
      {choices.map(letter => {
        const task = tasks.find(item => item.label === letter);
        const used = Object.values(response).includes(letter);
        return <button key={letter} type="button" disabled={disabled} draggable={!disabled} aria-label={`بطاقة ${letter}`} aria-pressed={card === letter} onDragStart={event => { event.dataTransfer.setData("text/plain", letter); setCard(letter); }} onClick={() => setCard(letter)} className={`practice-value-card flex min-w-20 flex-col gap-0.5 ${card === letter ? "is-selected" : ""} ${used ? "opacity-60" : ""}`}>
          <span className="text-base font-black">{letter}</span>
          {task && <span className="text-[11px]"><TeX tex={task.tex} /></span>}
        </button>;
      })}
    </div>

    <div className="overflow-x-auto rounded-2xl border border-emerald-200 bg-white p-3">
      <svg viewBox="0 0 840 190" className="block w-full min-w-[640px]" role="img" aria-label="مستقيم أعداد من -6 إلى 6 مع مواضع فارغة للحروف" direction="ltr">
        <defs><marker id={`${id}-arrow`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 8 4.5 L 0 9 L 2 4.5 Z" fill="#34416a" /></marker></defs>
        <line x1="24" y1={y} x2="816" y2={y} stroke="#34416a" strokeWidth="1.9" markerEnd={`url(#${id}-arrow)`} />
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map(tick => <g key={tick}>
          <line x1={xOf(tick)} x2={xOf(tick)} y1={tick === 0 ? y - 9 : y - 7} y2={tick === 0 ? y + 9 : y + 7} stroke={tick === 0 ? "#0f172a" : "#64748b"} strokeWidth={tick === 0 ? 2.3 : 1.5} />
          <text x={xOf(tick)} y={y + 27} textAnchor="middle" fontSize="15" fill={tick === 0 ? "#0f172a" : "#52607a"}>{tick}</text>
        </g>)}
        {slots.map((slot, index) => {
          const field = view.fields[index];
          const assigned = field ? response[field.key] : "";
          const cx = xOf(slot.value);
          return <g key={slot.label} data-line-slot={field?.key}>
            <circle cx={cx} cy={y} r="10" fill={assigned ? "#059669" : "#f8fafc"} stroke={assigned ? "#047857" : "#94a3b8"} strokeWidth="2" strokeDasharray={assigned ? "0" : "4 3"} />
            {assigned ? <text x={cx} y={y + 4} textAnchor="middle" fontSize="12" fontWeight="800" fill="white">{assigned}</text> : <text x={cx} y={y - 18} textAnchor="middle" fontSize="11" fontWeight="700" fill="#94a3b8">؟</text>}
            <foreignObject x={cx - 44} y={y - 62} width="88" height="34">
              <button type="button" disabled={disabled} aria-label={`ضع بطاقة في الموضع ${field?.label ?? index + 1}`} onClick={() => card && field && place(field.key, card)} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); field && place(field.key, event.dataTransfer.getData("text/plain")); }} className="mx-auto block rounded-lg border border-slate-200 bg-white/95 px-2 py-1 text-[10px] font-bold text-slate-500">{assigned ? `النقطة ${assigned}` : "ضع هنا"}</button>
            </foreignObject>
          </g>;
        })}
      </svg>
    </div>

    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {view.fields.map(field => <div key={field.key} className={`rounded-xl border px-3 py-2 text-xs font-bold ${response[field.key] ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-500"}`}>
        <MathText text={field.label} />: <bdi dir="ltr" className="font-black">{response[field.key] || "—"}</bdi>
      </div>)}
    </div>
    <p className="practice-widget-note"><ArrowDown size={13} /> اسحب الحرف إلى موضعه، أو اختر الحرف ثم اضغط «ضع هنا». المواضع مرتبة من اليسار إلى اليمين، والقيمة تزداد نحو اليمين.</p>
  </div>;
}

/** مقارنة خمسة أزواج بالرمز المناسب. */
function CompareWidget({ view, response, onChange, disabled }: Props) {
  const symbols: { value: string; label: string; tex: string }[] = [
    { value: "<", label: "أصغر من", tex: "<" },
    { value: ">", label: "أكبر من", tex: ">" },
    { value: "=", label: "يساوي", tex: "=" },
  ];
  return <div className="space-y-3">
    {view.fields.map((field, index) => <div key={field.key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-sm font-bold text-ink"><span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-500" dir="ltr">{index + 1}</span><MathText text={field.label} /></div>
      <div className="flex gap-2" role="group" aria-label={field.label}>
        {symbols.map(symbol => {
          const selected = response[field.key] === symbol.value;
          return <button key={symbol.value} type="button" disabled={disabled} aria-pressed={selected} aria-label={`${symbol.label}: ${field.label}`} onClick={() => onChange(field.key, symbol.value)} className={`grid h-11 w-11 place-items-center rounded-xl border text-lg font-black transition ${selected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"}`}><TeX tex={symbol.tex} /></button>;
        })}
      </div>
    </div>)}
    <p className="practice-widget-note"><MousePointer2 size={13} /> تذكّر: الموجب تمامًا أكبر من السالب تمامًا، وبين سالبين يكون الأقرب إلى الصفر أكبر.</p>
  </div>;
}

/** ترتيب مجموعة أعداد في خانات مرتبة. */
function OrderWidget({ view, response, onChange, disabled }: Props) {
  const [card, setCard] = useState<string | null>(null);
  const choices = view.fields[0]?.choices ?? [];
  function place(key: string, value: string) {
    if (disabled || !choices.includes(value)) return;
    for (const field of view.fields) {
      if (field.key !== key && response[field.key] === value) onChange(field.key, "");
    }
    onChange(key, value);
    setCard(null);
  }
  return <div className="space-y-4">
    <div className="practice-palette" dir="ltr" aria-label="بطاقات الأعداد">
      {choices.map(value => {
        const used = Object.values(response).includes(value);
        return <button key={value} type="button" disabled={disabled} draggable={!disabled} aria-label={`بطاقة ${value}`} aria-pressed={card === value} onDragStart={event => { event.dataTransfer.setData("text/plain", value); setCard(value); }} onClick={() => setCard(value)} className={`practice-value-card ${card === value ? "is-selected" : ""} ${used ? "opacity-60" : ""}`}><TeX tex={rationalTeX(value)} /></button>;
      })}
    </div>
    <div className="space-y-2">
      {view.fields.map(field => <div key={field.key} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); place(field.key, event.dataTransfer.getData("text/plain")); }} data-drop-field={field.key}>
        <span className="min-w-28 text-xs font-bold text-slate-500"><MathText text={field.label} /></span>
        <button type="button" disabled={disabled} aria-label={`ضع عددًا في ${field.label}`} onClick={() => card && place(field.key, card)} className={`flex min-h-10 min-w-28 items-center justify-center rounded-lg border px-3 text-sm font-black ${response[field.key] ? "border-violet-300 bg-violet-50 text-violet-900" : "border-dashed border-slate-300 bg-slate-50 text-slate-400"}`} dir="ltr">{response[field.key] ? <TeX tex={rationalTeX(response[field.key])} /> : "اختر عددًا"}</button>
      </div>)}
    </div>
    <p className="practice-widget-note"><MousePointer2 size={13} /> اسحب العدد إلى رتبته، أو اختر بطاقة ثم اضغط على الخانة. تأكد أن كل عدد استُعمل مرة واحدة.</p>
  </div>;
}

export default function RationalPracticeWidgets(props: Props) {
  switch (props.view.kind) {
    case "rat-warmup": return <WarmupWidget {...props} />;
    case "rat-represent":
    case "rat-decimal":
      return <NumericWidget {...props} />;
    case "rat-line": return <LineWidget {...props} />;
    case "rat-compare": return <CompareWidget {...props} />;
    case "rat-order-asc":
    case "rat-order-desc":
      return <OrderWidget {...props} />;
    default: return null;
  }
}
