"use client";

import { useId } from "react";
import { Check, MousePointer2 } from "lucide-react";
import MathText from "@/components/MathText";
import { latinDigits, type PracticeField, type PracticeView } from "@/lib/practice-types";

type Props = { view: PracticeView; response: Record<string, string>; onChange: (key: string, value: string) => void; disabled: boolean };

function FieldRow({ field, index, value, onChange, disabled }: {
  field: PracticeField; index: number; value: string; onChange: (value: string) => void; disabled: boolean;
}) {
  const id = useId();
  if (field.type === "choice") {
    return <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-sm font-bold text-ink">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-100 text-xs font-black text-violet-700" dir="ltr">{index + 1}</span>
        <MathText text={field.label} />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={field.label.replace(/\\\(|\\\)/g, "")}>
        {(field.choices ?? []).map(choice => {
          const selected = value === choice;
          return <button key={choice} type="button" disabled={disabled} aria-pressed={selected} data-choice={choice} onClick={() => onChange(choice)} className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-black transition ${selected ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"}`}>
            {choice.includes("\\(") ? <MathText text={choice} /> : choice}
            {selected && <Check size={12} />}
          </button>;
        })}
      </div>
    </div>;
  }

  return <label htmlFor={id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
    <span className="flex items-center gap-2 text-sm font-bold text-ink">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-100 text-xs font-black text-violet-700" dir="ltr">{index + 1}</span>
      <MathText text={field.label} />
    </span>
    <input
      id={id}
      aria-label={field.label.replace(/\\\(|\\\)/g, "")}
      value={value}
      onChange={event => onChange(latinDigits(event.target.value))}
      inputMode="numeric"
      autoComplete="off"
      maxLength={14}
      disabled={disabled}
      placeholder="…"
      className="input w-28 border border-slate-200 bg-white p-1.5 text-center text-sm font-bold tabular-nums"
      dir="ltr"
    />
  </label>;
}

const NOTE_BY_KIND: Record<string, string> = {
  "alg-warmup": "اقرأ الكلمات الدالة بدقة: «أقل بمقدار» تعني طرحًا، و«يزيد بمقدار» تعني جمعًا، و«ضعفا» تعني الضرب بـ 2.",
  "alg-envelopes": "عدّ المغلّفات لمعامل x، وعدّ القطع النقدية للحدّ الثابت؛ وعندما يغيب الحدّ الثابت تكون قيمته 0.",
  "alg-like-terms": "الحدّان المتشابهان لهما المتغيّر نفسه، وعند الجمع نجمع المعاملات فقط ونُبقي المتغيّر كما هو.",
  "alg-simplify": "وزّع العدد على جميع حدود القوس أولًا، ثم أعد ترتيب الحدود المتشابهة مع إشاراتها واجمعها.",
  "alg-word": "عيّن المتغيّر أولًا، ثم ترجم «يزيد بمقدار» إلى جمع، وبعدها عوّض القيمة المعطاة.",
  "alg-coeffs": "معامل x هو العدد المضروب في x (مع إشارته)، وإذا لم يظهر x في العبارة فمعامله 0.",
  "alg-triangle": "محيط المثلث = مجموع أطوال أضلاعه الثلاثة؛ اختزل العبارة أولًا ثم عوّض x = 3.",
  "alg-reducible": "تُختزل العبارة إذا احتوت حدّين متشابهين على الأقل (حدّين فيهما x أو حدّين ثابتين).",
};

export default function AlgebraPracticeWidgets({ view, response, onChange, disabled }: Props) {
  return <div className="space-y-3" data-widget={view.kind}>
    {view.fields.map((field, index) => <FieldRow
      key={field.key}
      field={field}
      index={index}
      value={response[field.key] ?? ""}
      onChange={value => onChange(field.key, value)}
      disabled={disabled}
    />)}
    <p className="practice-widget-note">
      <MousePointer2 size={13} /> {NOTE_BY_KIND[view.kind] ?? "تحقّق من كل خطوة مع الانتباه للإشارات والحدود المتشابهة."}
    </p>
  </div>;
}
