"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ClipboardCheck, Compass, FileText, FlaskConical, Lightbulb, Loader2, NotebookPen, PenLine, Sparkles } from "lucide-react";
import { readLocal, writeLocal, stageKey, visitedKey } from "@/lib/local-progress";
import { STAGES, type StageKey } from "@/lib/site";
import ContentRenderer, { type Block, type NotebookSection } from "@/components/ContentRenderer";
import QuizPlayer from "@/components/QuizPlayer";
import StudentNotebook from "@/components/StudentNotebook";
import MathMotif from "@/components/MathMotif";
import MathText from "@/components/MathText";

const ICONS: Record<StageKey, React.ReactNode> = { intro: <Lightbulb size={18}/>, discover: <Compass size={18}/>, explain: <BookOpen size={18}/>, lab: <FlaskConical size={18}/>, check: <CheckCircle2 size={18}/>, apply: <PenLine size={18}/>, quiz: <ClipboardCheck size={18}/>, summary: <FileText size={18}/>, notebook: <NotebookPen size={18}/> };
const COLORS = [ ["#bd7600", "#fff5d2"], ["#008a87", "#dcfaf4"], ["#7145df", "#f0eaff"], ["#0089ac", "#e0f6ff"], ["#168c57", "#e4faee"], ["#d46926", "#fff0df"], ["#db557b", "#fff0f5"], ["#426ac9", "#ebf1ff"], ["#a246cf", "#f8eaff"] ];

export default function LessonShell({ lessonId, unitTitle, title, goals, content, notebook, initialStage = 0, unitOrder = 1 }: {
  lessonId: number; unitTitle: string; title: string; goals?: string | null;
  content: Record<string, Block[]> | null; notebook: NotebookSection[] | null;
  initialStage?: number; unitOrder?: number;
}) {
  const [stageIdx, setStageIdx] = useState(Math.min(8, Math.max(0, initialStage)));
  const [visited, setVisited] = useState<number[]>([Math.min(8, Math.max(0, initialStage))]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const stage = STAGES[stageIdx];
  const percent = Math.round((stageIdx + 1) / STAGES.length * 100);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const requested = new URLSearchParams(window.location.search).get("stage");
      const requestedIndex = STAGES.findIndex(stage => stage.key === requested);
      const saved = readLocal<number>(stageKey(lessonId), initialStage);
      const next = requestedIndex >= 0 ? requestedIndex : Number.isInteger(saved) && saved >= 0 && saved < STAGES.length ? saved : initialStage;
      const previous = readLocal<number[]>(visitedKey(lessonId), []);
      const stages = Array.isArray(previous) ? previous.filter(value => Number.isInteger(value) && value >= 0 && value < STAGES.length) : [];
      const allVisited = Array.from(new Set([...stages, next]));
      setStageIdx(next); setVisited(allVisited);
      if (!writeLocal(stageKey(lessonId), next) || !writeLocal(visitedKey(lessonId), allVisited)) setSaveError(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [lessonId, initialStage]);
  function goTo(index: number) {
    const next = Math.max(0, Math.min(STAGES.length - 1, index));
    if (next === stageIdx) return;
    const allVisited = visited.includes(next) ? visited : [...visited, next];
    const stageSaved = writeLocal(stageKey(lessonId), next);
    const visitedSaved = writeLocal(visitedKey(lessonId), allVisited);
    setSaving(false); setSaveError(!stageSaved || !visitedSaved); setVisited(allVisited); setStageIdx(next);
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  return <div className="lesson-shell space-y-7">
    <header className="lesson-hero no-print">
      <div className="lesson-hero-copy"><span className="lesson-eyebrow"><Sparkles size={14}/> الوحدة {String(unitOrder).padStart(2,"0")} · {unitTitle}</span><h1><MathText text={title}/></h1><p>{goals && <MathText text={goals}/>}</p><div className="mt-5 flex items-center gap-3 text-xs font-bold text-violet-700"><span className="flex -space-x-1.5 space-x-reverse">{["#8b5cf6", "#24c6b0", "#ffbe45"].map((c,i) => <span key={c} className="grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[10px] text-white" style={{background:c}}>{i+1}</span>)}</span>نتعلّم خطوةً خطوة… ونفهم بعمق.</div></div>
      <MathMotif compact/>
    </header>

    <div className="lesson-layout grid items-start gap-7 lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="lesson-sidebar no-print lg:sticky lg:top-[122px]">
        <div className="journey-heading"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-600"><Compass size={19}/></span><div><h2 className="text-sm font-extrabold text-ink">رحلتك في الدرس</h2><p className="mt-0.5 text-[10px] text-slate-400">9 محطات صغيرة، فهم أكبر</p></div></div>
        <div className="journey-progress"><div className="mb-2 flex justify-between text-[11px] font-bold text-slate-500"><span>موقعك في الرحلة</span><bdi dir="ltr" className="text-violet-700">{stageIdx+1} / {STAGES.length}</bdi></div><div className="h-1.5 overflow-hidden rounded-full bg-violet-50"><div className="h-full rounded-full bg-gradient-to-l from-violet-500 to-fuchsia-400 transition-all" style={{width:`${percent}%`}}/></div></div>
        <nav aria-label="مراحل الدرس"><ol className="space-y-1.5">{STAGES.map((s,i) => <li key={s.key}><button type="button" onClick={() => goTo(i)} aria-current={i === stageIdx ? "step" : undefined} className="journey-step" style={{"--step-color":COLORS[i][0],"--step-soft":COLORS[i][1]} as CSSProperties}><span className="journey-step-icon">{visited.includes(i) && i!==stageIdx ? <Check size={17}/> : ICONS[s.key]}</span><span className="flex-1 text-right text-xs font-extrabold">{s.title}</span><span className="journey-step-index" dir="ltr">{String(i+1).padStart(2,"0")}</span></button></li>)}</ol></nav>
        <Link href="/student" className="journey-footer">إنجازاتك تستحق أن تراها <ArrowLeft size={14}/></Link>
      </aside>

      <div ref={contentRef} id="lesson-content" className="min-w-0 scroll-mt-32 space-y-5">
        <div className="stage-heading" style={{"--step-color":COLORS[stageIdx][0],"--step-soft":COLORS[stageIdx][1]} as CSSProperties}><span className="stage-heading-icon">{ICONS[stage.key]}</span><div className="flex-1"><p className="text-[10px] font-extrabold text-slate-400">المحطة {String(stageIdx+1).padStart(2,"0")}</p><h2 className="mt-0.5 text-2xl font-black text-ink">{stage.title}</h2><p className="mt-1 text-xs text-slate-500">{stage.hint}</p></div><span className="stage-heading-mark" dir="ltr">{String(stageIdx+1).padStart(2,"0")}</span></div>
        <div className="lesson-workspace">
          {stage.key === "quiz" ? <QuizPlayer scope="lesson" id={lessonId} title={`اختبار درس: ${title}`}/> : stage.key === "notebook" ? <StudentNotebook lessonId={lessonId} title={title} sections={notebook ?? []}/> : content?.[stage.key]?.length ? <ContentRenderer blocks={content[stage.key]} lessonId={lessonId} groupExercises={stage.key === "apply"}/> : <p className="text-slate-500">المحتوى بانتظار اعتماد صور الكتاب.</p>}
        </div>
        <div className="lesson-navigation no-print"><button type="button" onClick={() => goTo(stageIdx-1)} disabled={stageIdx===0} className="btn btn-ghost disabled:cursor-not-allowed disabled:opacity-35"><ArrowRight size={16}/> السابق</button><span className="text-[11px] font-semibold text-slate-400">{saving ? <span className="flex items-center gap-1"><Loader2 size={13} className="animate-spin"/> جارٍ الحفظ</span> : saveError ? "تعذر حفظ التقدم؛ حاول التنقل مجددًا" : <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-teal-500"/> يُحفظ تقدّمك على هذا الجهاز</span>}</span><button type="button" onClick={() => goTo(stageIdx+1)} disabled={stageIdx===STAGES.length-1} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-35">{stageIdx===7 ? "إلى دفتر الطالب" : "المحطة التالية"}<ArrowLeft size={16}/></button></div>
      </div>
    </div>
  </div>;
}
