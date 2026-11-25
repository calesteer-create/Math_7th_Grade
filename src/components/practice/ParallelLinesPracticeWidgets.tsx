"use client";

import { useId } from "react";
import { Check, MousePointer2 } from "lucide-react";
import MathText from "@/components/MathText";
import { ParallelLinesSvg } from "@/components/figures/ParallelLinesFigures";
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
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-100 text-xs font-black text-violet-700" dir="ltr">
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
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"
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
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-100 text-xs font-black text-violet-700" dir="ltr">
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
  "pl-warmup": "اجمع قياسي الزاويتين في كل شكل: 180° يعني استقامة، و 90° يعني تعامد.",
  "pl-angle-types": "المتتامتان مجموعهما 90°، المتكاملتان مجموعهما 180°، والمتقابلتان بالرأس متساويتان.",
  "pl-transversal": "حدّد موضع كل زاوية بالنسبة إلى المستقيمين المتوازيين والقاطع في الشكل أعلاه.",
  "pl-angle-a": "أوجد أولاً مكمّلة كل زاوية 135°، ثم طبّق التبادل الداخلي مع المستقيم المساعد المتقطّع المارّ بـ A.",
  "pl-train-1": "انظر إلى موضع الزاويتين المتساويتين C1 و B1 بالنسبة إلى d2 والضلعين [CD] و [BA].",
  "pl-train-2": "استعمل مستقيمًا مساعدًا موازيًا في الشكل الأيمن، ومجموع زوايا المثلث القائم والتناظر في الشكل الأيسر.",
  "pl-train-3": "الزاويتان 40° و x° زاويتان متتاليتان في رجل الطاولة التي تشكل متوازي أضلاع.",
};

export default function ParallelLinesPracticeWidgets({ view, response, onChange, disabled }: Props) {
  return (
    <div className="space-y-4" data-widget={view.kind}>
      <div className="rounded-2xl border border-violet-100 bg-[#fbfcff] p-4">
        {view.kind === "pl-warmup" && <ParallelLinesSvg kind="plWarmupAngles" />}
        {view.kind === "pl-angle-types" && <ParallelLinesSvg kind="plVerticalAdjacent" />}
        {view.kind === "pl-transversal" && <ParallelLinesSvg kind="plTransversalPositions" />}
        {view.kind === "pl-angle-a" && <ParallelLinesSvg kind="plCheckAngleA" />}
        {view.kind === "pl-train-1" && <ParallelLinesSvg kind="plTrainOne" />}
        {view.kind === "pl-train-2" && <ParallelLinesSvg kind="plTrainTwoM" />}
        {view.kind === "pl-train-3" && <ParallelLinesSvg kind="plTrainTableX" />}
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
        <MousePointer2 size={13} /> {NOTE_BY_KIND[view.kind] ?? "استعمل معطيات التوازي والعلاقات الزاوية من الشكل أعلاه خطوة بخطوة."}
      </p>
    </div>
  );
}
