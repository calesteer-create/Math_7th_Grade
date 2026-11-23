"use client";

import { useId } from "react";
import { Check, MousePointer2 } from "lucide-react";
import MathText from "@/components/MathText";
import { latinDigits, type PracticeField, type PracticeView } from "@/lib/practice-types";

type Props = { view: PracticeView; response: Record<string, string>; onChange: (key: string, value: string) => void; disabled: boolean };

function EquationFieldRow({ field, index, value, onChange, disabled }: {
  field: PracticeField; index: number; value: string; onChange: (value: string) => void; disabled: boolean;
}) {
  const id = useId();
  if (field.type === "choice") {
    return <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-sm font-bold text-ink">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-teal-100 text-xs font-black text-teal-700" dir="ltr">{index + 1}</span>
        <MathText text={field.label} />
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={field.label.replace(/\\\(|\\\)/g, "")}>
        {(field.choices ?? []).map(choice => {
          const selected = value === choice;
          return <button key={choice} type="button" disabled={disabled} aria-pressed={selected} data-choice={choice} onClick={() => onChange(choice)} className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-black transition ${selected ? "border-teal-600 bg-teal-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"}`}>
            {choice.includes("\\(") ? <MathText text={choice} /> : choice}
            {selected && <Check size={12} />}
          </button>;
        })}
      </div>
    </div>;
  }

  return <label htmlFor={id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
    <span className="flex items-center gap-2 text-sm font-bold text-ink">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-teal-100 text-xs font-black text-teal-700" dir="ltr">{index + 1}</span>
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
  "eq-check": "للتحقّق من حلّ معادلة: عوّض العدد مكان x في الطرف الأيسر وقارن الناتج بالطرف الأيمن.",
  "eq-warmup": "طبّق أولوية العمليات: الأقواس أولًا، ثم الضرب والقسمة، ثم الجمع والطرح.",
  "eq-boxes-addsub": "استخدم العملية العكسية لإيجاد العدد المفقود داخل المربّع، ثم تحقّق بالتعويض.",
  "eq-boxes-muldiv": "تذكّر قاعدة الإشارات في الضرب والقسمة، وتحقّق من صحة المساواة بعد ملء المربّع.",
  "eq-mental": "اسأل نفسك: ما العدد الذي إذا جُمع أو طُرح منه العدد المعلوم أعطى الطرف الأيمن؟",
  "eq-axc": "لحلّ المعادلة ax = c نقسم الطرف الأيمن c على أمثال x (أي a)، مع الانتباه لإشارة الناتج والكسور.",
};

export default function EquationsPracticeWidgets({ view, response, onChange, disabled }: Props) {
  return <div className="space-y-3" data-widget={view.kind}>
    {view.fields.map((field, index) => <EquationFieldRow
      key={field.key}
      field={field}
      index={index}
      value={response[field.key] ?? ""}
      onChange={value => onChange(field.key, value)}
      disabled={disabled}
    />)}
    <p className="practice-widget-note">
      <MousePointer2 size={13} /> {NOTE_BY_KIND[view.kind] ?? "تحقّق من الحلّ دائمًا بتعويضه في المعادلة الأصلية."}
    </p>
  </div>;
}
