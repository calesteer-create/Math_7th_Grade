"use client";

import { useRef, useState } from "react";
import { CheckCircle2, ClipboardCheck, Loader2, RotateCcw, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { assessmentForLesson } from "@/lib/lesson-banks";
import { readLocal, writeLocal, writeLocalOnce, quizKey, type QuizAttempt } from "@/lib/local-progress";
import { isCorrect, displayAnswer, LESSON_ASSESSMENT_NOTICE } from "@/lib/assessment";
import { LESSON_PUBLICATION_NOTICE } from "@/lib/lesson-publication";
import MathText from "@/components/MathText";

type PublicQuestion = { id: number; type: "mcq" | "truefalse" | "fill" | "problem"; question: string; options: string[] | null; difficulty: string; skill: string };
type GradeResult = { id: number; correct: boolean; answer: string; explanation: string | null; skill: string };
const DIFFICULTY: Record<string, string> = { easy: "انطلاقة", medium: "تطبيق", hard: "تحدٍّ" };
const LETTERS = ["أ", "ب", "ج", "د", "هـ"];

export default function QuizPlayer({ scope, id, title }: { scope: "lesson" | "unit"; id: number; title?: string }) {
  // بنك الدرس يأتي من السجل والمراجع؛ لا افتراض أن الاختبار يخص الدرس الأول.
  const source = scope === "lesson" ? assessmentForLesson(id)?.questions ?? [] : [];
  const questions: PublicQuestion[] = source.map((q, index) => ({ id: index + 1, type: q.type as PublicQuestion["type"], question: q.question, options: q.options ?? null, difficulty: q.difficulty, skill: q.skill }));
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<{ score: number; total: number; results: GradeResult[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const stale = false;
  const submitting = false;
  const top = useRef<HTMLDivElement>(null);

  const answeredCount = questions.filter(q => (answers[q.id] ?? "").trim()).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;
  function reloadQuiz() { setAnswers({}); setResult(null); setError(null); }
  function submit() {
    if (!allAnswered) return;
    const results = source.map((q, index) => ({ id: index + 1, correct: isCorrect(q.answer, answers[index + 1], q.type), answer: displayAnswer(q), explanation: q.explanation, skill: q.skill }));
    const score = results.filter(item => item.correct).length;
    setResult({ score, total: results.length, results });
    // المحاولة تُنسب إلى درسها عند الحفظ. لا يُحذف أي سجل قديم:
    // ما هو مصفوفة يُنقل كما هو، وما ليس مصفوفة يُحفظ في نسخة احتياطية قبل الكتابة.
    const raw = readLocal<unknown>(quizKey, []);
    const kept = Array.isArray(raw) ? raw : [];
    // النسخة الاحتياطية تُكتب مرة واحدة فقط: أي نسخة محفوظة سابقًا لا تُستبدل أبدًا.
    if (!Array.isArray(raw) && raw !== null && raw !== undefined) writeLocalOnce(`${quizKey}-backup`, raw);
    const attempt: QuizAttempt = { title: title ?? "اختبار", score, total: results.length, date: new Date().toISOString() };
    if (scope === "lesson") attempt.lessonId = id;
    // التفصيل المهاري يُحفظ مع المحاولة الجديدة فقط؛ المحاولات القديمة تبقى كما هي.
    if (results.every(item => typeof item.skill === "string" && item.skill.trim())) {
      attempt.items = results.map(item => ({ id: item.id, skill: item.skill, correct: item.correct }));
    }
    if (!writeLocal(quizKey, [attempt, ...kept].slice(0, 50))) setError("تعذر حفظ النتيجة في المتصفح، لكنها ظاهرة هنا.");
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function retry() { setAnswers({}); setResult(null); setError(null); top.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  if (!questions.length) return <div className="rounded-2xl border border-dashed border-slate-200 p-9 text-center"><ClipboardCheck className="mx-auto text-slate-300" size={36}/><h3 className="mt-3 font-bold">{error ? "تعذر تحميل الاختبار" : "لا يوجد اختبار متاح بعد"}</h3><p className="mt-2 text-sm leading-7 text-slate-500">{error ?? (scope === "lesson" ? LESSON_PUBLICATION_NOTICE : "اختبار الوحدة ينتظر تأكيد اكتمالها من المالك.")}</p>{error && <button onClick={reloadQuiz} className="btn btn-ghost mt-4 text-xs"><RotateCcw size={14}/> أعد المحاولة</button>}</div>;

  return <div ref={top} className="scroll-mt-32 space-y-5" data-quiz-player="true">
    <header className="overflow-hidden rounded-[20px] border border-indigo-100 bg-gradient-to-l from-indigo-50/80 to-white">
      <div className="flex items-start gap-3 p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#29348a] text-white"><Sparkles size={22}/></span><div><span className="text-[10px] font-extrabold tracking-wide text-indigo-600">{scope === "lesson" ? "تحدٍّ جديد · نفس المهارات" : "اختبار الوحدة"}</span><h3 className="mt-1 text-base font-extrabold text-[#253454]">{title ?? "اختبر فهمك"}</h3>{scope === "lesson" && <p className="mt-2 text-sm leading-7 text-slate-600">{LESSON_ASSESSMENT_NOTICE}</p>}</div></div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-indigo-100 bg-white/70 px-5 py-3 text-[11px] font-semibold text-slate-500"><span>{questions.length} أسئلة متنوعة · دون مؤقّت</span><span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-600"/> التصحيح والتفسير بعد التسليم فقط</span></div>
    </header>

    {result && <div className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5 ${result.score === result.total ? "border-emerald-200 bg-emerald-50" : "border-indigo-200 bg-indigo-50"}`} role="status"><div><p className="text-xs font-bold text-slate-500">نتيجتك على هذا الجهاز</p><p className="mt-1 text-xl font-extrabold text-ink">{result.score === result.total ? "ممتاز! نقلت فهمك إلى مواقف جديدة." : "خطوة جميلة! راجع تفسير كل إجابة أدناه."}</p></div><div className="flex items-center gap-4"><span className="text-3xl font-black text-indigo-700" dir="ltr" data-testid="quiz-score">{result.score} / {result.total}</span><button type="button" onClick={retry} className="btn btn-ghost text-xs"><RotateCcw size={14}/> إعادة المحاولة</button></div></div>}

    {questions.map((q, qi) => {
      const grade = result?.results.find(r => r.id === q.id);
      return <section key={q.id} data-quiz-question={q.id} aria-labelledby={`question-${q.id}`} className={`rounded-2xl border bg-white p-5 transition ${grade ? grade.correct ? "border-emerald-300" : "border-amber-300" : "border-slate-200"}`}>
        <div className="mb-4 flex items-start gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500" dir="ltr">{String(qi+1).padStart(2,"0")}</span><h4 id={`question-${q.id}`} className="flex-1 text-sm font-extrabold leading-7 text-ink"><MathText text={q.question}/></h4><span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-500">{DIFFICULTY[q.difficulty] ?? "تطبيق"}</span></div>
        {q.type === "mcq" && q.options ? <div className="grid gap-2 sm:grid-cols-2">{q.options.map((option, oi) => <button key={oi} type="button" disabled={!!result || submitting} aria-pressed={answers[q.id] === String(oi)} onClick={() => setAnswers(a => ({ ...a, [q.id]: String(oi) }))} className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-right text-sm transition focus-visible:outline-2 focus-visible:outline-indigo-500 disabled:cursor-default ${answers[q.id] === String(oi) ? "border-indigo-500 bg-indigo-50 text-indigo-900" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-black ${answers[q.id] === String(oi) ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>{LETTERS[oi]}</span><bdi dir="auto" className="font-semibold leading-6"><MathText text={option}/></bdi></button>)}</div> : q.type === "truefalse" ? <div className="flex gap-2">{["true", "false"].map(value => <button key={value} type="button" disabled={!!result || submitting} aria-pressed={answers[q.id] === value} onClick={() => setAnswers(a => ({...a, [q.id]: value}))} className={`rounded-xl border px-7 py-2.5 text-sm font-bold ${answers[q.id] === value ? "border-indigo-500 bg-indigo-50 text-indigo-800" : "border-slate-200 text-slate-500 hover:border-indigo-300"}`}>{value === "true" ? "صح" : "خطأ"}</button>)}</div> : <label className="block"><span className="mb-1.5 block text-xs font-semibold text-slate-500">إجابتك بالأرقام الإنجليزية</span><input type="text" dir="ltr" inputMode="numeric" aria-label={`إجابة السؤال ${qi + 1}`} disabled={!!result || submitting} value={answers[q.id] ?? ""} onChange={e => setAnswers(a => ({...a, [q.id]: e.target.value}))} maxLength={160} placeholder="اكتب العدد هنا" className="input max-w-sm text-left tabular-nums"/></label>}
        {grade && <div className={`mt-4 flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm leading-7 ${grade.correct ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>{grade.correct ? <CheckCircle2 size={17} className="mt-1 shrink-0"/> : <XCircle size={17} className="mt-1 shrink-0"/>}<div><p className="font-bold">{grade.correct ? "إجابة صحيحة — أحسنت!" : <>الإجابة الصحيحة: <bdi dir="auto"><MathText text={grade.answer}/></bdi></>}</p><p className="mt-1 text-xs leading-7"><MathText text={grade.explanation ?? ""}/></p></div></div>}
      </section>;
    })}
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-7 text-rose-800">{error}{stale && <button type="button" onClick={reloadQuiz} className="btn btn-ghost ms-3 text-xs">تحميل النسخة الجديدة</button>}</div>}
    {!result && <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200 bg-white/95 p-4 shadow-lg backdrop-blur"><div className="text-xs font-semibold text-slate-500">أجبت عن <bdi dir="ltr" className="font-extrabold text-indigo-600">{answeredCount} / {questions.length}</bdi><div className="mt-2 h-1.5 w-32 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{width:`${answeredCount / questions.length * 100}%`}}/></div></div><button type="button" onClick={submit} disabled={!allAnswered || submitting || stale} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-40">{submitting ? <Loader2 size={16} className="animate-spin"/> : <ClipboardCheck size={16}/>} {submitting ? "جارٍ حفظ نتيجتك…" : "تسليم الاختبار وإظهار النتيجة"}</button></div>}
  </div>;
}
