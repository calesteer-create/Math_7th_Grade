"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Eye, Lightbulb, Loader2, Lock, RefreshCw, Rocket, Sparkles, XCircle } from "lucide-react";
import type { Block } from "@/lib/lesson-content";
import type { PracticeEntry } from "@/lib/practice-types";
import MathText from "@/components/MathText";
import NaturalBookFigure from "@/components/figures/NaturalNumberFigures";
import PracticeWidgets from "@/components/practice/PracticeWidgets";
import SolutionSteps from "@/components/practice/SolutionSteps";

export type ExerciseBlock = Extract<Block, {kind:"exercise"}>;
const COLORS: Record<string,[string,string]> = { sets:["#d18b18","#fff8e3"],"digit-choice":["#8750d8","#f5efff"],twins:["#dc638a","#fff0f5"],"number-line":["#0b9b8a","#e7fcf6"],"digit-value":["#dc7c36","#fff4e8"],planet:["#3887cf","#eaf6ff"] };

function usePractice(lessonId: number) {
  const [entries, setEntries] = useState<PracticeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/practice?lesson=${lessonId}`, {cache:"no-store",signal:controller.signal}).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر تحميل المهمات.");
      setEntries(data.exercises); setError("");
    }).catch(e => {if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "تعذر التحميل.");}).finally(() => {if (!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  },[lessonId,reload]);
  return {entries,loading,error,retry:()=>{setLoading(true);setError("");setReload(n=>n+1);},update:(next:PracticeEntry)=>setEntries(prev=>prev.map(e=>e.key===next.key?next:e))};
}

function Loading({ error, retry }: {error:string;retry:()=>void}) {
  return <div className="practice-loading"><BookOpen size={28} className="text-violet-300"/><p className="text-sm font-bold text-slate-500">{error || "نجهّز مهماتك…"}</p>{error ? <button type="button" className="btn btn-ghost text-xs" onClick={retry}><RefreshCw size={13}/> إعادة التحميل</button> : <Loader2 size={18} className="animate-spin text-violet-400"/>}</div>;
}

function PracticeSurface({ lessonId, block, entry, onUpdate, reload }: {lessonId:number;block:ExerciseBlock;entry:PracticeEntry;onUpdate:(value:PracticeEntry)=>void;reload:()=>void}) {
  const [response,setResponse] = useState<Record<string,string>>(entry.state.response);
  const [feedback,setFeedback] = useState(entry.state.feedback);
  const [busy,setBusy] = useState<string | null>(null);
  const [error,setError] = useState("");
  const [stale,setStale] = useState(false);
  const [showSolution,setShowSolution] = useState(!!entry.solution);
  const colors = COLORS[entry.view.kind] ?? COLORS.sets;
  const complete = entry.view.fields.every(field => (response[field.key] ?? "").trim());
  function change(key:string,value:string) {setResponse(prev=>({...prev,[key]:value}));setFeedback(null);setError("");}
  async function act(action:"check"|"hint"|"solution") {
    if (busy) return;
    if (action === "solution" && entry.solution) {setShowSolution(open=>!open);return;}
    setBusy(action);setError("");
    try {
      const result = await fetch("/api/practice", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({lessonId,exerciseKey:entry.key,version:entry.version,action,response:action==="check"?response:undefined})});
      const data = await result.json();
      if (!result.ok) {setStale(result.status===409);throw new Error(data.error || "تعذر حفظ المحاولة.");}
      const next = data.exercise as PracticeEntry;
      onUpdate(next);
      if (action === "check") {setResponse(next.state.response);setFeedback(next.state.feedback);}
      if (action === "solution") setShowSolution(true);
    } catch(e) {setError(e instanceof Error?e.message:"تعذر الاتصال، أعد المحاولة.");}
    finally {setBusy(null);}
  }
  return <article data-exercise="true" data-practice-key={entry.key} className="practice-card" style={{"--practice-color":colors[0],"--practice-soft":colors[1]} as CSSProperties}>
    <header className="practice-card-header"><div><span className="practice-kicker"><Sparkles size={13}/> من كتابك… إلى تجربتك</span><h3>{entry.view.title}</h3></div>{entry.state.solved ? <span className="practice-completed"><CheckCircle2 size={15}/> مهمة منجزة</span> : <span className="practice-attempts">{entry.state.attempts ? `${entry.state.attempts} محاولات محفوظة` : "مساحة للتجربة"}</span>}</header>
    <div className="practice-body">
      <div className="practice-book-prompt"><BookOpen size={16} className="mt-1 shrink-0"/><div><span className="mb-1 block text-[10px] font-extrabold opacity-60">مطلوب الكتاب</span><p><MathText text={block.text}/></p></div></div>
      <p className="practice-instruction"><MathText text={entry.view.instruction}/></p>
      <PracticeWidgets view={entry.view} response={response} onChange={change} disabled={!!busy}/>
      {entry.state.hints.length > 0 && <div className="practice-hints"><h4><Lightbulb size={15}/> تلميح يساعدك، لا يحلّ بدلًا منك</h4><ol>{entry.state.hints.map((hint,i)=><li key={i}><span dir="ltr">{i+1}</span><MathText text={hint}/></li>)}</ol></div>}
      <div className="practice-actions"><button type="button" onClick={()=>act("check")} disabled={!complete || !!busy || stale} className="btn btn-primary disabled:opacity-35">{busy==="check"?<Loader2 size={15} className="animate-spin"/>:<CheckCircle2 size={16}/>} تحقّق من خطواتي</button><button type="button" onClick={()=>act("hint")} disabled={!!busy || stale || entry.state.hints.length>=entry.hintCount} className="btn btn-ghost text-xs disabled:opacity-35"><Lightbulb size={15}/> تلميح صغير <bdi dir="ltr">{entry.state.hints.length}/{entry.hintCount}</bdi></button><button type="button" onClick={()=>{setResponse({});setFeedback(null);setShowSolution(false);setError("");}} disabled={!!busy} className="practice-reset"><RefreshCw size={13}/> محاولة جديدة</button></div>
      {error && <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm leading-7 text-rose-800">{error}{stale && <button type="button" onClick={reload} className="btn btn-ghost ms-3 text-xs">تحديث النشاط</button>}</div>}
      {feedback && <div data-practice-feedback="true" className={`practice-feedback ${feedback.correct ? "is-correct" : "needs-work"}`} role="status"><div className="flex items-center gap-2 font-extrabold">{feedback.correct?<CheckCircle2 size={20}/>:<Lightbulb size={20}/>} {feedback.correct ? "أحسنت! اكتملت المهمة بتفكيرك." : "فكرة جيدة… لنضبط بعض الخطوات."}</div><ul>{feedback.fields.map(field=><li key={field.key}>{field.correct?<CheckCircle2 size={14}/>:<XCircle size={14}/>}<span><b>{field.label}: </b><MathText text={field.message}/></span></li>)}</ul><p className="mt-2 text-[10px] opacity-70">حُفظت هذه المحاولة. {entry.state.solved && !feedback.correct ? "ومحاولتك الناجحة السابقة محفوظة أيضًا." : "يمكنك الآن مراجعة الحل المتدرّج."}</p></div>}
      <div className="practice-solution-gate"><div><b className="text-sm text-ink">لماذا هذا هو الحل؟</b><p className="mt-1 text-[11px] text-slate-500">{entry.state.attempts ? "نشرح الفكرة والحساب وسبب كل خطوة." : "جرّب جميع أجزاء المهمة ليفتح الحل التعليمي."}</p></div><button type="button" onClick={()=>act("solution")} disabled={!entry.state.attempts || !!busy || stale} className="btn btn-ghost text-xs disabled:opacity-40">{busy==="solution"?<Loader2 size={14} className="animate-spin"/>:entry.state.attempts?<Eye size={15}/>:<Lock size={14}/>} {showSolution && entry.solution ? "إخفاء الحل" : "الحل خطوة بخطوة"}</button></div>
      {showSolution && entry.solution && <SolutionSteps solution={entry.solution}/>}
      {block.figure && <details className="practice-reference"><summary>الشكل الأصلي للكتاب</summary><div className="pt-4"><NaturalBookFigure figure={block.figure}/></div></details>}
      <div data-source-citation="true" className="exercise-source"><BookOpen size={13}/><span>المصدر: كتاب الطالب · <MathText text={block.source}/></span></div>
    </div>
  </article>;
}

export function SinglePractice({ lessonId, block }: {lessonId:number;block:ExerciseBlock}) {
  const data = usePractice(lessonId);
  const entry = data.entries.find(e=>e.key===block.practiceId);
  if (data.loading || data.error || !entry) return <Loading error={data.error || (!data.loading?"هذا النشاط غير متاح حاليًا.":"")} retry={data.retry}/>;
  return <PracticeSurface key={entry.version} lessonId={lessonId} block={block} entry={entry} onUpdate={data.update} reload={data.retry}/>;
}

export default function PracticeTrail({ lessonId, exercises }: {lessonId:number;exercises:ExerciseBlock[]}) {
  const data = usePractice(lessonId);
  const [active,setActive]=useState(0);
  const uid=useId();
  const root=useRef<HTMLDivElement>(null);
  function move(index:number) {setActive(index);root.current?.scrollIntoView({behavior:"smooth",block:"start"});}
  function handleKey(event:KeyboardEvent<HTMLButtonElement>,index:number) {
    const next=event.key==="ArrowLeft"?(index+1)%exercises.length:event.key==="ArrowRight"?(index+exercises.length-1)%exercises.length:event.key==="Home"?0:event.key==="End"?exercises.length-1:null;
    if(next===null)return;event.preventDefault();setActive(next);document.getElementById(`practice-${lessonId}-${uid}-tab-${next}`)?.focus();
  }
  const done=exercises.filter(b=>data.entries.find(e=>e.key===b.practiceId)?.state.solved).length;
  const block=exercises[active];
  const entry=data.entries.find(e=>e.key===block.practiceId);
  return <section ref={root} className="practice-trail scroll-mt-32" data-practice-trail="true">
    <header className="practice-trail-header"><div><span className="practice-kicker"><Rocket size={14}/> ورشة الكتاب</span><h3>مسائل مألوفة… مغامرة مختلفة.</h3><p>المطلوب والأعداد من الكتاب. طريقة اللعب والتلميحات أضفناها لتفهم أكثر.</p></div><div className="practice-trail-counter"><bdi dir="ltr">{done}<span> / {exercises.length}</span></bdi><span>مهام أتقنتها</span></div></header>
    <div className="practice-tabs" role="tablist" aria-label="مهمات تمارين الكتاب">{exercises.map((ex,i)=>{const exercise=data.entries.find(e=>e.key===ex.practiceId);return <button type="button" key={ex.practiceId} role="tab" id={`practice-${lessonId}-${uid}-tab-${i}`} aria-controls={`practice-${lessonId}-${uid}-panel`} aria-selected={active===i} tabIndex={active===i?0:-1} onKeyDown={event=>handleKey(event,i)} onClick={()=>setActive(i)} className={active===i?"is-active":""}><span className={exercise?.state.solved?"is-done":""}>{exercise?.state.solved?<CheckCircle2 size={15}/>:String(i+1).padStart(2,"0")}</span><b>{exercise?.view.title ?? `مهمة ${i+1}`}</b></button>;})}</div>
    <div id={`practice-${lessonId}-${uid}-panel`} role="tabpanel" aria-labelledby={`practice-${lessonId}-${uid}-tab-${active}`}>
      {data.loading || data.error || !entry ? <Loading error={data.error || (!data.loading?"النشاط غير متاح بعد.":"")} retry={data.retry}/> : <PracticeSurface key={`${entry.key}:${entry.version}`} lessonId={lessonId} block={block} entry={entry} onUpdate={data.update} reload={data.retry}/>}
    </div>
    <div className="practice-trail-nav"><button type="button" disabled={active===0} onClick={()=>move(active-1)} className="btn btn-ghost text-xs disabled:opacity-30"><ArrowRight size={14}/> المهمة السابقة</button><span className="text-[11px] font-semibold text-slate-400">تُحفظ محاولتك عند التحقق، لا عند تغيير الاختيار فقط.</span><button type="button" disabled={active===exercises.length-1} onClick={()=>move(active+1)} className="btn btn-ghost text-xs disabled:opacity-30">المهمة التالية <ArrowLeft size={14}/></button></div>
    {done===exercises.length && <p className="practice-trail-finish"><Sparkles size={17}/> أتممت جولة الكتاب! اختبر انتقال فهمك إلى مواقف جديدة في «اختبر نفسك».</p>}
  </section>;
}
