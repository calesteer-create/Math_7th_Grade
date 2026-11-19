import { lessonPackages } from "@/lib/curriculum";
import MathText from "@/components/MathText";

export const metadata = { title: "الحلول التعليمية" };

// الحلول تأتي من حزم الدروس المنشورة في السجل، لا من ملف درس واحد ثابت.
const solutions = lessonPackages().flatMap(({ entry, content }) =>
  content.solutions.map(solution => ({ ...solution, lessonId: entry.id, lessonTitle: entry.title })));

export default function TeacherPage() {
  return <div className="mx-auto max-w-5xl space-y-6 px-4 py-10"><header><h1 className="text-3xl font-black text-ink">الحلول التعليمية وإرشادات المعلم</h1><p className="mt-3 leading-7 text-slate-600">هذه الحلول متاحة للجميع دون تسجيل دخول. لا تتوفر لوحة لمتابعة الطلاب أو تخزين مركزي.</p></header>
    {solutions.map(solution => <details key={`${solution.lessonId}-${solution.order}`} className="card p-6"><summary className="cursor-pointer text-lg font-black">{solution.title}</summary><div className="mt-4 space-y-3 text-sm leading-8 text-slate-700"><p><b>المصدر: </b><MathText text={solution.source}/></p><p><b>السؤال: </b><MathText text={solution.question}/></p><p><b>الجواب: </b><MathText text={solution.answer}/></p>{solution.law && <p><b>القاعدة: </b><MathText text={solution.law}/></p>}<ol className="list-inside list-decimal">{solution.steps.map((step,i)=><li key={i}><MathText text={step}/></li>)}</ol>{solution.commonMistakes && <p><b>أخطاء شائعة: </b>{solution.commonMistakes.map((mistake,i)=><span key={i}><MathText text={mistake}/> </span>)}</p>}{solution.notes && <p><MathText text={solution.notes}/></p>}</div></details>)}
  </div>;
}
