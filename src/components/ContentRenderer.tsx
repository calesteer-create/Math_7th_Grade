import type { ReactNode } from "react";
import { AlertTriangle, BookOpen, CheckCircle2, Compass, FlaskConical, Lightbulb, ListChecks, PencilLine, Shapes, Sparkles } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import ExtraExplanationLabel from "@/components/ExtraExplanationLabel";
import InlineCheck from "@/components/InlineCheck";
import StepGuide from "@/components/StepGuide";
import PracticeTrail, { SinglePractice, type ExerciseBlock } from "@/components/practice/TextbookPractice";
import MathLab from "@/components/lab/MathLab";
import NaturalNumbersStudio from "@/components/NaturalNumbersStudio";
import IntegersStudio from "@/components/IntegersStudio";
import IntegersMulDivStudio from "@/components/IntegersMulDivStudio";
import BookFigure from "@/components/figures/BookFigure";
import type { Block, ContentOrigin, NotebookSection } from "@/lib/lesson-content";
export type { Block, NotebookSection } from "@/lib/lesson-content";

function Paragraphs({ text }: { text: string }) {
  return <div className="lesson-prose space-y-3">{text.split(/\n\s*\n/).map((paragraph, i) => <p key={i}><MathText text={paragraph}/></p>)}</div>;
}
function Frame({ tone = "violet", title, icon, origin, kind, children }: {
  tone?: string; title?: string; icon: ReactNode; origin: ContentOrigin; kind: string; children: ReactNode;
}) {
  return <section className={`learning-card tone-${tone}`} data-content-origin={origin} data-block-kind={kind}>
    <div className="learning-card-heading"><span className="learning-card-icon">{icon}</span><div className="min-w-0 flex-1">{title && <h3 className="font-extrabold leading-7 text-ink"><MathText text={title}/></h3>}</div>{origin === "supplement" && <ExtraExplanationLabel/>}</div>
    {children}
  </section>;
}

export function BlockRenderer({ block, lessonId }: { block: Block; lessonId?: number }) {
  const origin = block.origin ?? (block.kind === "book" || block.kind === "bookFigure" || block.kind === "exercise" ? "book" : "supplement");
  switch (block.kind) {
    case "lead": return <Frame tone="sunshine" title={block.title ?? "لحظة… فكّر معي!"} icon={<Lightbulb size={20}/>} origin={origin} kind={block.kind}><Paragraphs text={block.text}/></Frame>;
    case "book": return <Frame tone="paper" title={block.title ?? "الفكرة الأساسية"} icon={<BookOpen size={19}/>} origin={origin} kind={block.kind}><Paragraphs text={block.text}/></Frame>;
    case "explain": return <Frame title={block.title} icon={<Compass size={20}/>} origin={origin} kind={block.kind}><Paragraphs text={block.text}/></Frame>;
    case "def": return <Frame tone="violet" title={block.term} icon={<Shapes size={20}/>} origin={origin} kind={block.kind}><Paragraphs text={block.text}/></Frame>;
    case "law": return <Frame tone="mint" title={block.title ?? "فكرة تستحق أن تتذكّرها"} icon={<CheckCircle2 size={20}/>} origin={origin} kind={block.kind}>
      {block.formula && <div className="formula-surface"><TeX tex={block.formula} block/></div>}{block.text && <Paragraphs text={block.text}/>} {block.note && <p className="mt-3 text-sm font-bold leading-7 text-emerald-800"><MathText text={block.note}/></p>}
    </Frame>;
    case "example":
    case "steps": return <Frame tone={block.kind === "example" ? "mint" : "sky"} title={block.title ?? (block.kind === "example" ? "لنفكّر في الحل خطوةً خطوة" : "خطوات واضحة للحل")} icon={<ListChecks size={20}/>} origin={origin} kind={block.kind}>
      <ol className="solution-steps">{block.steps.map((step, i) => <li key={i}><span className="solution-step-number" dir="ltr">{i+1}</span><p className="lesson-prose"><MathText text={step}/></p></li>)}</ol>
      {block.kind === "example" && block.result && <div className="example-result"><span className="text-xs font-extrabold text-emerald-700">خلاصة الحل</span><div className="font-bold text-emerald-950"><MathText text={block.result}/></div></div>}
    </Frame>;
    case "mistake": return <Frame tone="coral" title={block.title ?? "انتبه لهذه الفكرة"} icon={<AlertTriangle size={19}/>} origin={origin} kind={block.kind}><Paragraphs text={block.text}/></Frame>;
    case "note": return <Frame tone="sky" title={block.title ?? "تفصيل صغير… فرق كبير"} icon={<Lightbulb size={19}/>} origin={origin} kind={block.kind}><Paragraphs text={block.text}/></Frame>;
    case "math": return <Frame tone="violet" title={block.caption ?? "الفكرة بلغة الرياضيات"} icon={<Sparkles size={18}/>} origin={origin} kind={block.kind}><div className="formula-surface"><TeX tex={block.tex} block className="text-lg"/></div></Frame>;
    case "check": return <InlineCheck question={block.question} answer={block.answer} hint={block.hint} options={block.options} correctOption={block.correctOption} supplementary={origin === "supplement"}/>;
    case "summary": return <Frame tone="mint" title={block.title ?? "احتفظ بهذه الأفكار"} icon={<CheckCircle2 size={20}/>} origin={origin} kind={block.kind}><ul className="space-y-3">{block.items.map((item, i) => <li key={i} className="flex items-start gap-3"><CheckCircle2 className="mt-1.5 shrink-0 text-emerald-500" size={16}/><p className="lesson-prose"><MathText text={item}/></p></li>)}</ul></Frame>;
    case "activity": return <Frame tone="sky" title={block.title ?? "جرّبها بنفسك"} icon={<FlaskConical size={20}/>} origin={origin} kind={block.kind}><Paragraphs text={block.text}/></Frame>;
    case "exercise": return lessonId && block.practiceId ? <SinglePractice lessonId={lessonId} block={block}/> : <div data-exercise="true"><Frame tone="sunshine" title={block.title} icon={<PencilLine size={20}/>} origin={origin} kind={block.kind}>
      <Paragraphs text={block.text}/>{block.figure && <div className="mt-5"><BookFigure figure={block.figure}/></div>}
      <div data-source-citation="true" className="exercise-source"><BookOpen size={13}/><span>المصدر: كتاب الطالب · <MathText text={block.source}/></span></div>
    </Frame></div>;
    case "guide": return <StepGuide title={block.title} intro={block.intro} titles={block.sections.map(s => s.title)} panels={block.sections.map((section, i) => <ContentRenderer key={i} blocks={section.blocks} lessonId={lessonId}/>)}/>;
    case "labtool": return <div className="space-y-3">{origin === "supplement" && <ExtraExplanationLabel/>}<MathLab tool={block.tool}/></div>;
    case "naturalStudio": return <div className="space-y-3">{origin === "supplement" && <ExtraExplanationLabel/>}<NaturalNumbersStudio mode={block.mode}/></div>;
    case "integersStudio": return <div className="space-y-3">{origin === "supplement" && <ExtraExplanationLabel/>}<IntegersStudio mode={block.mode}/></div>;
    case "integersMulDivStudio": return <div className="space-y-3">{origin === "supplement" && <ExtraExplanationLabel/>}<IntegersMulDivStudio mode={block.mode}/></div>;
    case "bookFigure": return <BookFigure figure={block.figure}/>;
  }
}

export default function ContentRenderer({ blocks, lessonId, groupExercises = false }: { blocks: Block[]; lessonId?: number; groupExercises?: boolean }) {
  const nodes: ReactNode[] = [];
  let group: ExerciseBlock[] = [];
  let cursor = 0;
  function flush() {
    if (!group.length) return;
    if (group.length > 1 && lessonId) nodes.push(<PracticeTrail key={`trail-${cursor++}`} lessonId={lessonId} exercises={group}/>);
    else group.forEach(block => nodes.push(<BlockRenderer key={`block-${cursor++}`} block={block} lessonId={lessonId}/>));
    group = [];
  }
  for (const block of blocks) {
    if (groupExercises && block.kind === "exercise" && block.practiceId) group.push(block);
    else { flush(); nodes.push(<BlockRenderer key={`block-${cursor++}`} block={block} lessonId={lessonId}/>); }
  }
  flush();
  return <div className="lesson-blocks space-y-5">{nodes}</div>;
}

export function NotebookRenderer({ sections }: { sections: NotebookSection[] }) {
  return <div className="space-y-8">{sections.map((section, i) => <section key={i}><h3 className="mb-4 flex items-center gap-3 text-lg font-black text-ink"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-sm font-black text-violet-700" dir="ltr">{String(i+1).padStart(2,"0")}</span>{section.title}</h3><ContentRenderer blocks={section.blocks}/></section>)}</div>;
}
