"use client";

import { useId } from "react";
import { Check, MousePointer2 } from "lucide-react";
import MathText from "@/components/MathText";
import { ParallelogramAreaSvg } from "@/components/figures/ParallelogramAreaFigures";
import { latinDigits, type PracticeField, type PracticeView } from "@/lib/practice-types";

type Props = {
  view: PracticeView;
  response: Record<string, string>;
  onChange: (key: string, value: string) => void;
  disabled: boolean;
};

function FieldRow({
  field,
  index,
  value,
  onChange,
  disabled,
}: {
  field: PracticeField;
  index: number;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const id = useId();
  if (field.type === "choice") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
        <div className="flex items-center gap-2 text-sm font-bold text-ink">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-teal-100 text-xs font-black text-teal-700" dir="ltr">
            {index + 1}
          </span>
          <MathText text={field.label} />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={field.label.replace(/\\\(|\\\)/g, "")}>
          {(field.choices ?? []).map(choice => {
            const selected = value === choice;
            return (
              <button
                key={choice}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                data-choice={choice}
                onClick={() => onChange(choice)}
                className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-black transition ${
                  selected
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
                }`}
              >
                {choice.includes("\\(") ? <MathText text={choice} /> : choice}
                {selected && <Check size={12} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <label htmlFor={id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
      <span className="flex items-center gap-2 text-sm font-bold text-ink">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-teal-100 text-xs font-black text-teal-700" dir="ltr">
          {index + 1}
        </span>
        <MathText text={field.label} />
      </span>
      <input
        id={id}
        aria-label={field.label.replace(/\\\(|\\\)/g, "")}
        value={value}
        onChange={e => onChange(latinDigits(e.target.value))}
        inputMode="numeric"
        autoComplete="off"
        maxLength={14}
        disabled={disabled}
        placeholder="…"
        className="input w-28 border border-slate-200 bg-white p-1.5 text-center text-sm font-bold tabular-nums"
        dir="ltr"
      />
    </label>
  );
}

const NOTE_BY_KIND: Record<string, string> = {
  "area-cutpaste": "تأمّل خطوات القصّ واللصق أعلاه: المساحة تساوي جداء القاعدة في الارتفاع العمودي عليها.",
  "area-units": "وحّد الواحدتين قبل الضرب: تذكّر أن 1 m يساوي 100 cm.",
  "area-heights": "لكل قاعدة ارتفاع عمودي عليها يحمل علامة الزاوية القائمة في الشكل أعلاه.",
  "area-worked": "احسب المساحة أولاً من القاعدة والارتفاع المعلومين، ثم اقسمها على الارتفاع الثاني لإيجاد القاعدة المجهولة.",
  "area-ratios": "عدّ الأجزاء المتساوية (شرطات التساوي أو النقاط السوداء) على [CB]؛ فارتفاع المظلّل يساوي ارتفاع ABCD.",
  "area-train": "انتبه في الشكل (c) إلى أن القاعدة عمودية والارتفاع أفقي، ولا تنسَ الواحدة المربّعة في كل شكل.",
};

export default function ParallelogramAreaPracticeWidgets({ view, response, onChange, disabled }: Props) {
  return (
    <div className="space-y-4" data-widget={view.kind}>
      <div className="rounded-2xl border border-teal-100 bg-[#fbfcff] p-4">
        {view.kind === "area-cutpaste" && <ParallelogramAreaSvg kind="areaCutPaste" />}
        {view.kind === "area-units" && <ParallelogramAreaSvg kind="areaUnitMismatch" />}
        {view.kind === "area-heights" && <ParallelogramAreaSvg kind="areaTwoHeights" />}
        {view.kind === "area-worked" && <ParallelogramAreaSvg kind="areaWorkedExample" />}
        {view.kind === "area-ratios" && <ParallelogramAreaSvg kind="areaShadedRatios" />}
        {view.kind === "area-train" && <ParallelogramAreaSvg kind="areaTrainFour" />}
      </div>

      <div className="space-y-3">
        {view.fields.map((field, index) => (
          <FieldRow
            key={field.key}
            field={field}
            index={index}
            value={response[field.key] ?? ""}
            onChange={v => onChange(field.key, v)}
            disabled={disabled}
          />
        ))}
      </div>

      <p className="practice-widget-note">
        <MousePointer2 size={13} /> {NOTE_BY_KIND[view.kind] ?? "تأكّد من اختيار الارتفاع العمودي على القاعدة وتوحيد الواحدات."}
      </p>
    </div>
  );
}
