"use client";

import { useId } from "react";
import { Check, MousePointer2 } from "lucide-react";
import MathText from "@/components/MathText";
import { latinDigits, type PracticeField, type PracticeView } from "@/lib/practice-types";

type Props = { view: PracticeView; response: Record<string, string>; onChange: (key: string, value: string) => void; disabled: boolean };

function SmallInput({ field, value, onChange, disabled }: { field: PracticeField; value: string; onChange: (value: string) => void; disabled: boolean }) {
  const id = useId();
  return <span className="inline-flex items-center gap-1" dir="ltr">
    <span className="text-[11px] font-extrabold text-slate-500">{field.label.includes("الفاصلة") || field.key.startsWith("x") ? "x =" : "y ="}</span>
    <input id={id} aria-label={field.label.replace(/\\\(|\\\)/g, "")} value={value} onChange={event => onChange(latinDigits(event.target.value))} inputMode="numeric" autoComplete="off" maxLength={6} disabled={disabled} placeholder="…" className="input w-16 border border-slate-200 bg-white p-1 text-center text-sm font-bold tabular-nums" dir="ltr" />
  </span>;
}

function ReadWidget({ view, response, onChange, disabled }: Props) {
  const groups = [[view.fields[0], view.fields[1]], [view.fields[2], view.fields[3]]];
  return <div className="space-y-3" data-widget="cp-read">
    {groups.map(([xField, yField], index) => <div key={xField.key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-sm font-bold text-ink"><span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-100 text-xs font-black text-sky-700" dir="ltr">{index + 1}</span><MathText text={xField.label.split("—")[0].trim()} /></div>
      <div className="flex items-center gap-3"><SmallInput field={xField} value={response[xField.key] ?? ""} onChange={value => onChange(xField.key, value)} disabled={disabled} /><SmallInput field={yField} value={response[yField.key] ?? ""} onChange={value => onChange(yField.key, value)} disabled={disabled} /></div>
    </div>)}
    <p className="practice-widget-note"><MousePointer2 size={13} /> ابدأ من المبدأ O: الفاصلة أفقية (يمين موجب ويسار سالب)، والترتيب عمودي (أعلى موجب وأسفل سالب).</p>
  </div>;
}

function ChoiceWidget({ view, response, onChange, disabled }: Props) {
  return <div className="space-y-3" data-widget={view.kind}>
    {view.fields.map((field, index) => <div key={field.key} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-sm font-bold text-ink"><span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-xs font-black text-slate-500" dir="ltr">{index + 1}</span><MathText text={field.label} /></div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={field.label}>
        {(field.choices ?? []).map(choice => {
          const selected = response[field.key] === choice;
          return <button key={choice} type="button" disabled={disabled} aria-pressed={selected} onClick={() => onChange(field.key, choice)} className={`flex items-center gap-1 rounded-xl border px-3 py-2 text-xs font-black transition ${selected ? "border-sky-600 bg-sky-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"}`}>{choice}{selected && <Check size={12} />}</button>;
        })}
      </div>
    </div>)}
    <p className="practice-widget-note"><MousePointer2 size={13} /> {view.kind === "cp-signs" ? "ترتيب الإشارات (الفاصلة، الترتيب): موجب تمامًا يعني أكبر من صفر." : "إذا كانت إحدى الإحداثيتين صفرًا فالنقطة على المحور، وليست داخل أي ربع."}</p>
  </div>;
}

export default function CoordinatePracticeWidgets(props: Props) {
  switch (props.view.kind) {
    case "cp-read": return <ReadWidget {...props} />;
    case "cp-quadrant": return <ChoiceWidget {...props} />;
    case "cp-plot": return <ChoiceWidget {...props} />;
    case "cp-signs": return <ChoiceWidget {...props} />;
    default: return null;
  }
}
