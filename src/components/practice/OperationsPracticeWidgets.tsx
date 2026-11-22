"use client";

import { useId } from "react";
import { Check, MousePointer2 } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import { latinDigits, type PracticeField, type PracticeView } from "@/lib/practice-types";

type Props = { view: PracticeView; response: Record<string, string>; onChange: (key: string, value: string) => void; disabled: boolean };

function NumericField({ field, value, onChange, disabled, prefix }: { field: PracticeField; value: string; onChange: (value: string) => void; disabled: boolean; prefix?: string }) {
  const id = useId();
  return <label htmlFor={id} className="block">
    <span className="mb-1 block text-[11px] font-extrabold text-slate-600"><MathText text={field.label} /></span>
    <span className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1" dir="ltr">
      {prefix && <span className="text-sm font-black text-slate-500">{prefix}</span>}
      <input id={id} aria-label={field.label.replace(/\\\(|\\\)/g, "")} value={value} onChange={event => onChange(latinDigits(event.target.value))} inputMode="numeric" autoComplete="off" maxLength={20} disabled={disabled} placeholder="…" className="w-full min-w-16 border-0 bg-transparent p-1 text-center text-sm font-bold tabular-nums outline-none" dir="ltr" />
    </span>
  </label>;
}

function ChoiceRow({ field, value, choices, onChange, disabled, ariaLabel }: { field: PracticeField; value: string | undefined; choices: { value: string; label?: string }[]; onChange: (value: string) => void; disabled: boolean; ariaLabel?: string }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
    <div className="flex items-center gap-2 text-sm font-bold text-ink"><MathText text={field.label} /></div>
    <div className="flex flex-wrap gap-2" role="group" aria-label={ariaLabel ?? field.label}>
      {choices.map(choice => {
        const selected = value === choice.value;
        return <button key={choice.value} type="button" disabled={disabled} aria-pressed={selected} onClick={() => onChange(choice.value)} className={`flex min-w-12 items-center justify-center gap-1 rounded-xl border px-3 py-2 text-sm font-black transition ${selected ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`} dir="ltr">
          {choice.label ?? choice.value}{selected && <Check size={13} />}
        </button>;
      })}
    </div>
  </div>;
}

function ScientificWrite({ view, response, onChange, disabled }: Props) {
  const coefficient = view.fields.find(field => field.key === "coef")!;
  const exponent = view.fields.find(field => field.key === "exp")!;
  return <div className="space-y-4" data-widget="op-sci-write">
    <p className="rounded-xl bg-violet-50 px-3 py-2 text-center text-sm font-bold text-violet-900" dir="ltr"><TeX tex="a\times10^{n}" /><span className="mx-2" dir="rtl">حيث</span><TeX tex="1\le|a|<10" /></p>
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <p className="mb-2 text-xs font-extrabold text-slate-600">اختر العامل a</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={coefficient.label}>
          {(coefficient.choices ?? []).map(choice => <button key={choice} type="button" disabled={disabled} aria-pressed={response.coef === choice} onClick={() => onChange("coef", choice)} className={`rounded-xl border px-3 py-2 text-sm font-black ${response.coef === choice ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"}`} dir="ltr">{choice}</button>)}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-3">
        <p className="mb-2 text-xs font-extrabold text-slate-600">اكتب أس العشرة n</p>
        <div className="flex items-center gap-2" dir="ltr"><TeX tex="10^{" /><input aria-label="أس العشرة" value={response.exp ?? ""} onChange={event => onChange("exp", latinDigits(event.target.value))} disabled={disabled} inputMode="numeric" maxLength={4} className="input w-24 text-center" dir="ltr" placeholder="n" /><TeX tex="}" /></div>
      </div>
    </div>
    <p className="practice-widget-note"><MousePointer2 size={13} /> تذكّر: العامل بين 1 و10، والأس يساوي عدد منازل الإزاحة، وإشارته سالبة إذا كان العدد أصغر من 1.</p>
  </div>;
}

function ScientificCompare({ view, response, onChange, disabled }: Props) {
  const symbols = [{ value: "<", label: "<" }, { value: ">", label: ">" }, { value: "=", label: "=" }];
  return <div className="space-y-3" data-widget="op-sci-compare">
    {view.fields.map(field => <ChoiceRow key={field.key} field={field} value={response[field.key]} choices={symbols} onChange={value => onChange(field.key, value)} disabled={disabled} />)}
    <p className="practice-widget-note"><MousePointer2 size={13} /> قارن العاملين أولًا إذا اختلف الأسس: الأس الأكبر يعني عددًا أكبر عند العامل الموجب نفسه.</p>
  </div>;
}

function FractionResult({ view, response, onChange, disabled }: Props) {
  const pairs = view.fields.length === 4 ? [[view.fields[0], view.fields[1]], [view.fields[2], view.fields[3]]] : [];
  return <div className="space-y-4" data-widget={view.kind}>
    {pairs.map(([numerator, denominator], index) => <div key={index} className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-slate-600"><span className="grid h-6 w-6 place-items-center rounded-lg bg-violet-100 text-violet-700" dir="ltr">{index + 1}</span><MathText text={numerator.label.split("—")[0].trim() || "الناتج"} /></div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1"><NumericField field={{ ...numerator, label: "البسط" }} value={response[numerator.key] ?? ""} onChange={value => onChange(numerator.key, value)} disabled={disabled} /></div>
        <div className="flex-1"><NumericField field={{ ...denominator, label: "المقام" }} value={response[denominator.key] ?? ""} onChange={value => onChange(denominator.key, value)} disabled={disabled} /></div>
      </div>
      <p className="mt-2 rounded-lg bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-500">اكتب بالبسط والمقام بعد الاختزال، والمقام موجب. إذا كان الناتج عددًا صحيحًا فالمقام 1.</p>
    </div>)}
    <p className="practice-widget-note"><MousePointer2 size={13} /> {view.kind === "op-frac-addsub" ? "في الجمع والطرح وحّد المقامات أولًا، ثم اجمع البسطين أو اطرحهما." : "في الضرب اضرب البسط في البسط والمقام في المقام، وفي القسمة اضرب في المقلوب."}</p>
  </div>;
}

function ChoiceList({ view, response, onChange, disabled }: Props) {
  return <div className="space-y-3" data-widget={view.kind}>
    {view.fields.map(field => <ChoiceRow key={field.key} field={field} value={response[field.key]} choices={(field.choices ?? []).map(choice => ({ value: choice, label: choice.includes("\\") ? undefined : choice }))} onChange={value => onChange(field.key, value)} disabled={disabled} />)}
    <p className="practice-widget-note"><MousePointer2 size={13} /> احسب كل بند على ورقة قبل الاختيار؛ المشتتات مبنية على أخطاء شائعة في الإشارة أو الفاصلة.</p>
  </div>;
}

function SignList({ view, response, onChange, disabled }: Props) {
  const signs = [{ value: "+", label: "موجب" }, { value: "-", label: "سالب" }, { value: "0", label: "صفر" }];
  return <div className="space-y-3" data-widget="op-sign">
    {view.fields.map(field => <ChoiceRow key={field.key} field={field} value={response[field.key]} choices={signs} onChange={value => onChange(field.key, value)} disabled={disabled} />)}
    <p className="practice-widget-note"><MousePointer2 size={13} /> إشارة الضرب أو القسمة: سالب × سالب = موجب، وسالب × موجب = سالب. والإشارة ليست القيمة.</p>
  </div>;
}

export default function OperationsPracticeWidgets(props: Props) {
  switch (props.view.kind) {
    case "op-sci-write": return <ScientificWrite {...props} />;
    case "op-sci-compare": return <ScientificCompare {...props} />;
    case "op-frac-addsub":
    case "op-frac-muldiv": return <FractionResult {...props} />;
    case "op-choice": return <ChoiceList {...props} />;
    case "op-sign": return <SignList {...props} />;
    default: return null;
  }
}
