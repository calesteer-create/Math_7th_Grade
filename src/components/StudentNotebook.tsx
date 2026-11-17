"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import { Check, CheckCircle2, NotebookPen, PencilLine, Printer } from "lucide-react";
import type { NotebookSection } from "@/lib/lesson-content";
import ContentRenderer from "@/components/ContentRenderer";
import MathText from "@/components/MathText";
import { EngineerSignature } from "@/components/Identity";

type Draft = { written: Record<string, boolean>; notes: Record<string, string> };
export default function StudentNotebook({ lessonId, title, sections }: {lessonId:number;title:string;sections:NotebookSection[]}) {
  const [active,setActive]=useState(0);
  const [draft,setDraft]=useState<Draft>({written:{},notes:{}});
  const [ready,setReady]=useState(false);
  const [saveError,setSaveError]=useState(false);
  const storageKey=`math7:copybook:${lessonId}`;
  useEffect(()=>{
    let alive=true;
    Promise.resolve().then(()=>{
      try {
        const raw=localStorage.getItem(storageKey);
        const stored=raw?JSON.parse(raw):null;
        if(alive && stored && typeof stored==="object") {
          const written:Record<string,boolean>={};const notes:Record<string,string>={};
          for(const [key,value] of Object.entries(stored.written ?? {})) if(typeof value==="boolean") written[key]=value;
          for(const [key,value] of Object.entries(stored.notes ?? {})) if(typeof value==="string") notes[key]=value.slice(0,1600);
          setDraft({written,notes});
        }
      } catch {if(alive)setSaveError(true);}
      finally {if(alive)setReady(true);}
    });
    return()=>{alive=false;};
  },[storageKey]);
  function save(next:Draft) {
    setDraft(next);
    try {localStorage.setItem(storageKey,JSON.stringify(next));setSaveError(false);}
    catch {setSaveError(true);}
  }
  function navigate(event:KeyboardEvent<HTMLButtonElement>,index:number) {
    const next=event.key==="ArrowLeft"?(index+1)%sections.length:event.key==="ArrowRight"?(index+sections.length-1)%sections.length:event.key==="Home"?0:event.key==="End"?sections.length-1:null;
    if(next===null)return;event.preventDefault();setActive(next);document.getElementById(`copybook-${lessonId}-tab-${next}`)?.focus();
  }
  const completed=sections.filter(section=>draft.written[section.id]).length;
  return <div className="student-copybook" data-student-copybook="true">
    <header className="copybook-intro no-print"><span className="copybook-cover-icon"><NotebookPen size={29}/></span><div className="flex-1"><span className="text-[11px] font-extrabold text-violet-500">من فهم الفكرة… إلى كتابتها</span><h3 className="mt-1 text-xl font-black text-ink">ما أكتبه في دفتري</h3><p className="mt-2 text-sm leading-7 text-slate-500">هذه صياغة الدرس التي تنقلها إلى دفترك: تعريفات، قواعد، رسوم، وأمثلة محلولة بخطواتها. افتح دفترك واكتب بهدوء.</p></div><button type="button" disabled={!ready} onClick={()=>window.print()} className="btn btn-primary text-xs"><Printer size={15}/> طباعة أوراق الدفتر</button></header>
    <div className="copybook-toolbar no-print"><span><bdi dir="ltr">{completed} / {sections.length}</bdi> أوراق وضعت عليها علامة الكتابة</span><span className={saveError?"text-rose-600":"text-slate-400"}>{!ready?"جارٍ استعادة ملاحظاتك…":saveError?"تعذر الحفظ محليًا؛ انقل ملاحظتك قبل إغلاق الصفحة.":"العلامات والملاحظات محفوظة في هذا المتصفح فقط."}</span></div>
    <div role="tablist" aria-label="أوراق دفتر الطالب" className="copybook-tabs no-print">{sections.map((section,i)=><button type="button" role="tab" key={section.id} id={`copybook-${lessonId}-tab-${i}`} aria-selected={active===i} aria-controls={`copybook-${lessonId}-sheet-${i}`} tabIndex={active===i?0:-1} onKeyDown={event=>navigate(event,i)} onClick={()=>setActive(i)} className={active===i?"is-active":""}><span>{draft.written[section.id]?<Check size={14}/>:String(i+1).padStart(2,"0")}</span>{section.title}</button>)}</div>
    <div className="copybook-pages">{sections.map((section,i)=><article key={section.id} id={`copybook-${lessonId}-sheet-${i}`} role="tabpanel" aria-labelledby={`copybook-${lessonId}-tab-${i}`} className={`copybook-sheet ${active===i?"is-current":""}`} data-notebook-sheet={section.id}>
      <div className="copybook-binding" aria-hidden="true"/>
      <header className="copybook-sheet-header"><div><span className="copybook-subject">الرياضيات · الصف السابع</span><h3>{title}</h3><p>الاسم: .................................. <span className="ms-4">التاريخ: ....................</span></p></div><span className="copybook-page-number">ورقة <bdi dir="ltr">{String(i+1).padStart(2,"0")}</bdi></span></header>
      <div className="copybook-writing-task"><PencilLine size={16} className="mt-1 shrink-0"/><div><b className="block text-xs">أكتب في دفتري</b><p><MathText text={section.writingTask}/></p></div></div>
      <div className="copybook-paper-content"><h4 className="copybook-section-title">{section.title}</h4><ContentRenderer blocks={section.blocks}/></div>
      <div className="copybook-personal-note"><label htmlFor={`copybook-note-${lessonId}-${section.id}`} className="no-print">ملاحظة أضيفها من فهمي <span>اختياريّة، لا تُرفع إلى الخادم ولا تُصحّح تلقائيًا.</span></label><textarea id={`copybook-note-${lessonId}-${section.id}`} aria-label={`ملاحظتي: ${section.title}`} disabled={!ready} maxLength={1600} value={draft.notes[section.id] ?? ""} onChange={event=>save({...draft,notes:{...draft.notes,[section.id]:event.target.value}})} rows={3} placeholder="ما الفكرة التي أصبحت أوضح لك؟" className="no-print" dir="auto"/><div className="copybook-print-note"><b>ملاحظتي:</b><p dir="auto">{draft.notes[section.id] || "....................................................................................................................\n...................................................................................................................."}</p></div></div>
      <footer className="copybook-sheet-footer no-print"><label><input type="checkbox" disabled={!ready} checked={!!draft.written[section.id]} onChange={event=>save({...draft,written:{...draft.written,[section.id]:event.target.checked}})}/><span>أنهيت كتابة هذه الورقة في دفتري</span></label>{draft.written[section.id] && <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={14}/> خطوة مكتوبة، فكرة ثابتة</span>}</footer>
    </article>)}</div>
    <p className="no-print mt-4 text-center text-[10px] leading-6 text-slate-400">علامات الكتابة لتنظيم عملك أنت، وليست تقييمًا آليًا لما كتبته. تبويب «الملخص» منفصل للمراجعة السريعة.</p>
    <div className="mt-6"><EngineerSignature/></div>
  </div>;
}
