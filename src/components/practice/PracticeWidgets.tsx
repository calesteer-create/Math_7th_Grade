"use client";

import { useId, useState } from "react";
import { ArrowDown, Check, MousePointer2, Rocket } from "lucide-react";
import { BOOK_GROUPS } from "@/lib/natural-numbers";
import { EllipticSet, NumberLineDiagram } from "@/components/figures/NaturalNumberFigures";
import IntegerPracticeWidgets from "@/components/practice/IntegerPracticeWidgets";
import IntegersMulDivPracticeWidgets from "@/components/practice/IntegersMulDivPracticeWidgets";
import RationalPracticeWidgets from "@/components/practice/RationalPracticeWidgets";
import OperationsPracticeWidgets from "@/components/practice/OperationsPracticeWidgets";
import CoordinatePracticeWidgets from "@/components/practice/CoordinatePracticeWidgets";
import AlgebraPracticeWidgets from "@/components/practice/AlgebraPracticeWidgets";
import EquationsPracticeWidgets from "@/components/practice/EquationsPracticeWidgets";
import ParallelogramPracticeWidgets from "@/components/practice/ParallelogramPracticeWidgets";
import ParallelogramAreaPracticeWidgets from "@/components/practice/ParallelogramAreaPracticeWidgets";
import ParallelLinesPracticeWidgets from "@/components/practice/ParallelLinesPracticeWidgets";
import TeX from "@/components/TeX";
import { latinDigits, type PracticeField, type PracticeView } from "@/lib/practice-types";

type Props = { view: PracticeView; response: Record<string, string>; onChange: (key: string, value: string) => void; disabled: boolean };

function NumericField({ field, value, onChange, disabled, unit }: { field: PracticeField; value: string; onChange: (value: string) => void; disabled: boolean; unit?: string }) {
  const id = useId();
  return <label htmlFor={id} className="practice-numeric-label"><span>{field.label}</span><span className="practice-input-wrap" dir="ltr"><input id={id} aria-label={field.label} value={value} onChange={e => onChange(latinDigits(e.target.value))} inputMode="numeric" autoComplete="off" maxLength={20} disabled={disabled} placeholder="…" className="input" dir="ltr"/>{unit && <span className="practice-unit">{unit}</span>}</span></label>;
}

function DigitRack({ number, selected, onSelect, disabled, focusDigit }: { number: string; selected?: string; onSelect?: (position: string) => void; disabled?: boolean; focusDigit?: string }) {
  return <div className="practice-number-rack" dir="ltr" aria-label={`أرقام العدد ${number}`}>
    {number.split("").map((digit, i) => {
      const position = String(number.length - 1 - i);
      const chosen = selected === position;
      if (!onSelect) return <span key={i} className={`practice-digit ${digit === focusDigit ? "is-focus" : ""}`}>{digit}</span>;
      return <button type="button" key={i} disabled={disabled} aria-label={`الرقم ${digit}`} aria-pressed={chosen} data-position={position} onClick={() => onSelect(position)} className={`practice-digit ${chosen ? "is-picked" : ""}`}>{digit}{chosen && <Check size={12}/>}</button>;
    })}
  </div>;
}

function TwinMatch({ view, response, onChange, disabled }: Props) {
  const [card, setCard] = useState<string | null>(null);
  const cards = view.fields[0].choices ?? [];
  function place(key: string, value: string) { if (!disabled && cards.includes(value)) { onChange(key, value); setCard(null); } }
  return <div className="space-y-5">
    <DigitRack number={view.number!} focusDigit={view.focusDigit}/>
    <div className="practice-palette" dir="ltr" aria-label="بطاقات القيم">{cards.map(value => <button key={value} type="button" disabled={disabled} draggable={!disabled} aria-label={`بطاقة ${value}`} aria-pressed={card === value} onDragStart={event => { event.dataTransfer.setData("text/plain", value); setCard(value); }} onClick={() => setCard(value)} className={`practice-value-card ${card === value ? "is-selected" : ""}`}>{value}</button>)}</div>
    <div className="practice-match-slots" dir="ltr">{view.fields.map((field, i) => <div key={field.key} className={`practice-slot slot-${i}`} onDragOver={event => event.preventDefault()} onDrop={event => {event.preventDefault();place(field.key, event.dataTransfer.getData("text/plain"));}} data-drop-field={field.key}>
      <span className="practice-slot-tag" dir="rtl">{field.label}</span><button type="button" disabled={disabled} aria-label={`ضع البطاقة: ${field.label}`} onClick={() => card && place(field.key, card)} className="practice-drop-target">{response[field.key] ? <span dir="ltr">{response[field.key]}</span> : <span className="flex flex-col items-center gap-2 text-xs"><ArrowDown size={21}/>اختر بطاقة ثم ضعها هنا</span>}</button>
    </div>)}</div>
    <p className="practice-widget-note"><MousePointer2 size={13}/> يمكنك السحب، أو اختيار بطاقة ثم الضغط على الخانة. البطاقات المساعدة إضافة للتفاعل، وأعداد السؤال لم تتغيّر.</p>
  </div>;
}

export default function PracticeWidgets(props: Props) {
  const { view, response, onChange, disabled } = props;
  if (view.kind.startsWith("int-")) return <IntegerPracticeWidgets {...props}/>;
  if (view.kind.startsWith("muldiv-")) return <IntegersMulDivPracticeWidgets {...props}/>;
  if (view.kind.startsWith("rat-")) return <RationalPracticeWidgets {...props}/>;
  if (view.kind.startsWith("op-")) return <OperationsPracticeWidgets {...props}/>;
  if (view.kind.startsWith("cp-")) return <CoordinatePracticeWidgets {...props}/>;
  if (view.kind.startsWith("alg-")) return <AlgebraPracticeWidgets {...props}/>;
  if (view.kind.startsWith("eq-")) return <EquationsPracticeWidgets {...props}/>;
  if (view.kind.startsWith("pg-")) return <ParallelogramPracticeWidgets {...props}/>;
  if (view.kind.startsWith("area-")) return <ParallelogramAreaPracticeWidgets {...props}/>;
  if (view.kind.startsWith("pl-")) return <ParallelLinesPracticeWidgets {...props}/>;
  if (view.kind === "sets") return <div className="practice-set-grid" dir="ltr">{BOOK_GROUPS.map(group => <button key={group.label} type="button" disabled={disabled} onClick={() => onChange("group", group.label)} aria-label={`اختر المجموعة ${group.label}`} aria-pressed={response.group === group.label} className={`practice-set-card ${response.group === group.label ? "is-picked" : ""}`}><span className="practice-set-letter"><TeX tex={group.label}/></span><EllipticSet dots={group.dots} label={`المجموعة ${group.label}: ${group.count} نقاط`} warmup/><span className="practice-set-caption" dir="rtl">{response.group === group.label ? "اختياري" : "هذه المجموعة؟"}</span></button>)}</div>;
  if (view.kind === "digit-choice" || view.kind === "digit-value") return <div className="space-y-5">
    <div className="practice-focus-label">ابحث عن الرقم <bdi dir="ltr">{view.focusDigit}</bdi> داخل العدد، واضغط عليه.</div>
    <DigitRack number={view.number!} selected={response.position} onSelect={position => onChange("position", position)} disabled={disabled}/>
    {view.kind === "digit-choice" ? <div><p className="mb-3 text-center text-xs font-bold text-slate-500">ما القيمة التي يمثّلها في هذا الموضع؟</p><div className="practice-value-options" dir="ltr">{view.fields.find(f => f.key === "value")?.choices?.map(value => <button key={value} type="button" disabled={disabled} aria-pressed={response.value === value} onClick={() => onChange("value", value)} className={`practice-value-card ${response.value === value ? "is-selected" : ""}`}>{value}</button>)}</div></div> : <div className="mx-auto max-w-sm"><NumericField field={view.fields.find(f => f.key === "value")!} value={response.value ?? ""} onChange={value => onChange("value", value)} disabled={disabled}/></div>}
  </div>;
  if (view.kind === "twins") return <TwinMatch {...props}/>;
  if (view.kind === "number-line") return <div className="practice-line-game">
    <div className="overflow-x-auto rounded-2xl bg-white"><NumberLineDiagram point={Number(response.point || 0)}/></div>
    <div className="practice-line-choices" dir="ltr">{Array.from({length:13},(_, i) => <button type="button" key={i} disabled={disabled} aria-label={`عيّن النقطة عند ${i}`} aria-pressed={response.point === String(i)} onClick={() => onChange("point", String(i))}>{i}</button>)}</div>
    <label className="block px-4"><span className="sr-only">موضع نقطة التمرين</span><input aria-label="موضع نقطة التمرين" type="range" min={0} max={12} step={1} value={response.point || 0} disabled={disabled} onChange={e => onChange("point", e.target.value)} dir="ltr" className="w-full accent-teal-500"/></label>
    <p className="practice-widget-note">{response.point !== undefined ? <>اخترت فاصلة <bdi dir="ltr" className="font-black text-teal-700">{response.point}</bdi>. هل تطابق المطلوب؟</> : "حرّك النقطة أو اختر تدريجة، ثم تحقق من تفكيرك."}</p>
  </div>;
  const groups = view.fields.filter(f => f.key !== "number");
  const canPreview = groups.every(f => /^\d{1,3}$/.test(response[f.key] ?? ""));
  const groupText = canPreview ? groups.map((field, i) => i ? response[field.key].padStart(3,"0") : response[field.key]).join("\\,|\\,") : "";
  return <div className="practice-planet-game">
    <div className="practice-space-strip"><div className="practice-neptune" aria-hidden="true"/><div><span className="flex items-center gap-2 text-xs font-extrabold text-sky-200"><Rocket size={15}/> لوحة الرحلة</span><p className="mt-2 text-sm font-bold text-white">المسافة كبيرة… لنكتبها مجموعةً مجموعة.</p><p className="mt-1 text-[10px] text-sky-200/80">الرسم تزييني للنشاط؛ قيمة المسافة هي المعطاة في الكتاب.</p></div></div>
    <div className="practice-planet-groups" dir="ltr">{groups.map(field => <NumericField key={field.key} field={field} value={response[field.key] ?? ""} onChange={value => onChange(field.key, value)} disabled={disabled}/>)}</div>
    {canPreview && <div className="practice-group-preview"><span className="text-[10px] font-bold text-sky-700">ترتيب المجموعات التي كتبتها</span><TeX tex={groupText} block/></div>}
    <div className="mx-auto max-w-md"><NumericField field={view.fields.find(f => f.key === "number")!} value={response.number ?? ""} onChange={value => onChange("number", value)} disabled={disabled} unit="km"/></div>
  </div>;
}
