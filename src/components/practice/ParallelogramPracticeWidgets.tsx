"use client";

import { useId } from "react";
import { Check, MousePointer2 } from "lucide-react";
import MathText from "@/components/MathText";
import { ParallelogramSvg } from "@/components/figures/ParallelogramFigures";
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
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-100 text-xs font-black text-indigo-700" dir="ltr">
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
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
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
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-100 text-xs font-black text-indigo-700" dir="ltr">
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
  "pg-unit-launch": "لاحظ ترتيب الرؤوس الدوري في الرباعي، وموضع الرأس في الزوايا، والتناظر المركزي للحرف Z في الأشكال أعلاه.",
  "pg-identify": "تحقّق في كل شكل من شرط متوازي الأضلاع: كل ضلعين متقابلين متوازيان (المستطيل يحقّق الشرط أيضًا!).",
  "pg-sym-proof": "استعمل التناظر المركزي حول M منتصف [BD]: نظير مستقيم هو مستقيم يوازيه.",
  "pg-check-props": "طبّق الخواص الأربع لمتوازي الأضلاع ABCD من الشكل أعلاه: توازي الأضلاع، تساوي المتقابلة، تناصف القطرين، وتساوي الزوايا المتقابلة.",
  "pg-center-g": "بما أن G مركز متوازي الأضلاع ABCD فهو منتصف القطرين [AC] و [BD]؛ لذا نعيّن C و D بالتناظر المركزي حول G.",
  "pg-coord": "اقرأ الإحداثيات بدقة من الشبكة المتعامدة أعلاه ثم تحقّق من علاقتي C = B + D و G = (B + D) / 2.",
};

export default function ParallelogramPracticeWidgets({ view, response, onChange, disabled }: Props) {
  return (
    <div className="space-y-4" data-widget={view.kind}>
      {view.kind === "pg-unit-launch" && (
        <div className="grid gap-3 rounded-2xl border border-indigo-100 bg-[#fbfcff] p-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-2.5">
            <p className="mb-1 text-center text-[11px] font-extrabold text-indigo-700">للبندين 1 و 2: الرباعي MTCB</p>
            <ParallelogramSvg kind="pgramUnitLaunchQuad" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 md:col-span-2">
            <p className="mb-1 text-center text-[11px] font-extrabold text-indigo-700">للبند 3: أشكال الزوايا (1 و 2 و 3)</p>
            <ParallelogramSvg kind="pgramUnitLaunchAngles" />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-2.5 md:col-span-3">
            <p className="mb-1 text-center text-[11px] font-extrabold text-indigo-700">للبند 5: الحرف Z على الشبكة</p>
            <ParallelogramSvg kind="pgramUnitLaunchZ" />
          </div>
        </div>
      )}
      {view.kind === "pg-identify" && (
        <div className="rounded-2xl border border-indigo-100 bg-[#fbfcff] p-4">
          <ParallelogramSvg kind="pgramIdentifyFive" />
        </div>
      )}
      {view.kind === "pg-sym-proof" && (
        <div className="rounded-2xl border border-indigo-100 bg-[#fbfcff] p-4">
          <ParallelogramSvg kind="pgramSymmetryProof" />
        </div>
      )}
      {view.kind === "pg-check-props" && (
        <div className="rounded-2xl border border-indigo-100 bg-[#fbfcff] p-4">
          <ParallelogramSvg kind="pgramCheckAbcd" />
        </div>
      )}
      {view.kind === "pg-center-g" && (
        <div className="rounded-2xl border border-indigo-100 bg-[#fbfcff] p-4">
          <ParallelogramSvg kind="pgramCompleteCenter" showSolution={disabled} />
        </div>
      )}
      {view.kind === "pg-coord" && (
        <div className="rounded-2xl border border-indigo-100 bg-[#fbfcff] p-4">
          <ParallelogramSvg kind="pgramCoordGrid" />
        </div>
      )}

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
        <MousePointer2 size={13} /> {NOTE_BY_KIND[view.kind] ?? "تأمّل الشكل الهندسي أعلاه وتحقق من كل خاصية قبل التحقق."}
      </p>
    </div>
  );
}
