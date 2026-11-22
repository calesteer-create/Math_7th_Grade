"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, Eye, Lightbulb, ListChecks, RefreshCw, Target, XCircle } from "lucide-react";
import MathText from "@/components/MathText";
import TeX from "@/components/TeX";
import UnitExerciseFigure from "@/components/unit-exercises/UnitExerciseFigure";
import { gradeUnitExercise, UNIT_EXERCISE_NOTICE, type UnitExercise, type UnitExercisesFile, type UnitField } from "@/lib/unit-exercises";

const DIFFICULTY: Record<UnitExercise["difficulty"], { label: string; className: string }> = {
  easy: { label: "تمهيدي", className: "bg-emerald-100 text-emerald-700" },
  medium: { label: "تطبيقي", className: "bg-sky-100 text-sky-700" },
  hard: { label: "تحدٍّ", className: "bg-amber-100 text-amber-800" },
};
type Entry = { response: Record<string, string>; attempts: number; hints: number; solution: boolean; solved: boolean };

function FieldInput({ field, value, onChange, disabled }: { field: UnitField; value: string; onChange: (value: string) => void; disabled: boolean }) {
  if (field.type === "choice") {
    return <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="text-xs font-extrabold text-slate-600"><MathText text={field.label} /></span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={field.label}>
        {(field.choices ?? []).map(choice => <button key={choice} type="button" disabled={disabled} aria-pressed={value === choice} onClick={() => onChange(choice)} className={`rounded-lg border px-2.5 py-1.5 text-xs font-black transition ${value === choice ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}>{choice}</button>)}
      </div>
    </div>;
  }
  return <label className="flex flex-wrap items-center justify-between gap-2">
    <span className="text-xs font-extrabold text-slate-600"><MathText text={field.label} /></span>
    <input value={value} onChange={event => onChange(event.target.value)} aria-label={field.label.replace(/\\\(|\\\)/g, "")} disabled={disabled} inputMode={field.type === "range" ? "decimal" : "numeric"} autoComplete="off" maxLength={24} dir="ltr" className="input w-40 text-center text-sm" placeholder={field.type === "range" ? "عدد بين الحدين" : "…"} />
  </label>;
}

export default function UnitExercises({ data }: { data: UnitExercisesFile }) {
  const [group, setGroup] = useState<string>("all");
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const exercises = useMemo(() => data.exercises.filter(exercise => group === "all" || exercise.group === group), [data.exercises, group]);
  const solved = data.exercises.filter(exercise => entries[exercise.key]?.attempts && entries[exercise.key]?.solved).length;

  function update(key: string, patch: Partial<Entry>) {
    setEntries(previous => {
      const current = previous[key] ?? { response: {}, attempts: 0, hints: 0, solution: false, solved: false };
      return { ...previous, [key]: { ...current, ...patch } };
    });
  }
  const entryOf = (key: string): Entry => entries[key] ?? { response: {}, attempts: 0, hints: 0, solution: false, solved: false };

  return <div className="space-y-6" data-unit-exercises={data.unitId}>
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <span className="text-[11px] font-black text-brand-600">قسم مستقل · الوحدة {data.unitId}</span>
          <h1 className="mt-1 text-2xl font-black text-ink">{data.title}</h1>
          <p className="mt-2 text-sm leading-7 text-slate-600"><MathText text={data.intro} /></p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-center">
          <p className="text-[10px] font-bold text-violet-700">أنجزت في هذه الجلسة</p>
          <p className="mt-1 text-xl font-black text-violet-800" dir="ltr" data-unit-progress>{solved} / {data.exercises.length}</p>
        </div>
      </div>
      <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] font-bold leading-6 text-amber-900">{UNIT_EXERCISE_NOTICE}</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="تصفية التمرينات بحسب المهارة">
        <button type="button" aria-pressed={group === "all"} onClick={() => setGroup("all")} className={`rounded-xl border px-3 py-2 text-xs font-extrabold ${group === "all" ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}>كل التمرينات <bdi dir="ltr">({data.exercises.length})</bdi></button>
        {data.groups.map(item => <button key={item.id} type="button" aria-pressed={group === item.id} onClick={() => setGroup(item.id)} className={`rounded-xl border px-3 py-2 text-xs font-extrabold ${group === item.id ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}>{item.title}</button>)}
      </div>
      {group !== "all" && <p className="mt-3 text-xs font-bold leading-6 text-slate-500">{data.groups.find(item => item.id === group)?.description}</p>}
    </section>

    <div className="space-y-6">
      {exercises.map(exercise => {
        const entry = entryOf(exercise.key);
        const feedback = entry.attempts > 0 ? gradeUnitExercise(exercise, entry.response) : null;
        const complete = exercise.fields.every(field => (entry.response[field.key] ?? "").trim());
        const groupInfo = data.groups.find(item => item.id === exercise.group);
        return <article key={exercise.key} data-unit-exercise={exercise.key} className="card overflow-hidden p-0">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-sm font-black text-violet-700" dir="ltr">{String(exercise.number).padStart(2, "0")}</span>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`chip ${DIFFICULTY[exercise.difficulty].className}`}>{DIFFICULTY[exercise.difficulty].label}</span>
                  <span className="chip bg-slate-100 text-slate-600">{groupInfo?.title}</span>
                  {exercise.lessonId && <span className="chip bg-brand-50 text-brand-700">الدرس {exercise.lessonId}: {exercise.lessonTitle}</span>}
                </div>
                <p className="mt-1.5 text-[11px] font-bold text-slate-500">{exercise.skill}</p>
              </div>
            </div>
            {feedback?.correct && entry.attempts > 0 && <span className="chip bg-emerald-100 text-emerald-700"><CheckCircle2 size={13} /> تمرين منجز</span>}
          </header>

          <div className="space-y-4 px-5 py-5">
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-sm font-bold leading-8 text-ink"><MathText text={exercise.prompt} /></div>
            {exercise.figure && <UnitExerciseFigure figure={exercise.figure} />}
            <div className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3">
              {exercise.fields.map(field => <FieldInput key={field.key} field={field} value={entry.response[field.key] ?? ""} onChange={value => update(exercise.key, { response: { ...entry.response, [field.key]: value } })} disabled={false} />)}
            </div>

            {entry.hints > 0 && <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold text-sky-800"><Lightbulb size={14} /> تلميحات متدرجة، لا حلًّا جاهزًا</p>
              <ol className="mt-2 space-y-1.5">{exercise.hints.slice(0, entry.hints).map((hint, index) => <li key={index} className="flex items-start gap-2 text-xs font-bold leading-6 text-slate-700"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white text-[10px] text-sky-700" dir="ltr">{index + 1}</span><MathText text={hint} /></li>)}</ol>
            </div>}

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn btn-primary text-xs disabled:opacity-40" disabled={!complete} onClick={() => {
                const nextAttempts = entry.attempts + 1;
                const result = gradeUnitExercise(exercise, entry.response);
                setEntries(previous => ({ ...previous, [exercise.key]: { ...entry, attempts: nextAttempts, solved: result.correct } }));
              }}><CheckCircle2 size={15} /> تحقّق من إجابتي</button>
              <button type="button" className="btn btn-ghost text-xs disabled:opacity-40" disabled={entry.hints >= exercise.hints.length} onClick={() => update(exercise.key, { hints: Math.min(exercise.hints.length, entry.hints + 1) })}><Lightbulb size={14} /> تلميح <bdi dir="ltr">{entry.hints}/{exercise.hints.length}</bdi></button>
              <button type="button" className="btn btn-ghost text-xs disabled:opacity-40" disabled={!entry.attempts} onClick={() => update(exercise.key, { solution: !entry.solution })}><Eye size={14} /> {entry.solution ? "إخفاء الحل" : "الحل المرجعي"}</button>
              <button type="button" className="ml-auto flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-600" onClick={() => update(exercise.key, { response: {}, attempts: 0, hints: 0, solution: false, solved: false })}><RefreshCw size={12} /> محاولة جديدة</button>
            </div>

            {feedback && <div role="status" data-unit-feedback={feedback.correct ? "correct" : "wrong"} className={`rounded-xl border p-3 ${feedback.correct ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              <p className={`flex items-center gap-2 text-sm font-extrabold ${feedback.correct ? "text-emerald-900" : "text-rose-900"}`}>{feedback.correct ? <CheckCircle2 size={17} /> : <XCircle size={17} />} {feedback.correct ? "إجابة صحيحة، فكرة مثبتة." : "محاولة جيدة؛ راجع الحقول غير الصحيحة."}</p>
              {!feedback.correct && <ul className="mt-2 space-y-1.5">{feedback.fields.filter(field => !field.correct).map(field => <li key={field.key} className="flex items-start gap-2 text-xs font-bold leading-6 text-slate-700"><XCircle size={13} className="mt-1 shrink-0 text-rose-500" /><span><b><MathText text={field.label} />: </b><MathText text={field.message} /></span></li>)}</ul>}
            </div>}

            {entry.solution && <section className="rounded-xl border border-violet-200 bg-violet-50/40 p-4" data-unit-solution="true">
              <p className="flex items-center gap-2 text-sm font-black text-violet-900"><ListChecks size={16} /> الحل المرجعي خطوة بخطوة</p>
              <ol className="mt-3 space-y-2">{exercise.solution.steps.map((step, index) => <li key={index} className="rounded-lg bg-white p-3">
                <p className="text-xs font-extrabold text-violet-900"><bdi dir="ltr">{index + 1}</bdi> · {step.title}</p>
                <p className="mt-1 text-xs leading-7 text-slate-600"><MathText text={step.text} /></p>
                {step.formula && <div className="mt-2 overflow-x-auto rounded-md bg-slate-50 px-3 py-1.5" dir="ltr"><TeX tex={step.formula} /></div>}
              </li>)}</ol>
              <p className="mt-3 rounded-lg bg-white p-3 text-xs font-bold leading-7 text-emerald-900"><Target size={13} className="me-1 inline" /><MathText text={exercise.solution.final} /></p>
            </section>}

            <div data-source-citation="true" className="exercise-source"><BookOpen size={13} /><span>المصدر: كتاب الطالب · {exercise.source}</span></div>
          </div>
        </article>;
      })}
    </div>

    <p className="rounded-xl border border-slate-200 bg-white p-4 text-center text-[11px] font-bold leading-6 text-slate-500">
      ترتيب التمرينات داخل كل مهارة تصاعدي: تمهيدي ثم تطبيقي ثم تحدٍّ. وإتمام هذه الصفحة لا يغيّر حالة أي درس.
    </p>
  </div>;
}
