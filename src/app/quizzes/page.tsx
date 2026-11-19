import type { ElementType } from "react";
import Link from "next/link";
import { lessons, lessonPackage, units } from "@/lib/curriculum";
import { fmtNum } from "@/lib/site";
import { LESSON_PUBLICATION_NOTICE } from "@/lib/lesson-publication";
import { ClipboardCheck, Hourglass, Info, Lock } from "lucide-react";


export default async function QuizzesPage() {
  const allUnits = units;
  // عدد الأسئلة يُقرأ من حزمة كل درس منشور، لا من بنك واحد مفترض.
  const allLessons = lessons.map(lesson => ({
    ...lesson,
    qCount: lesson.status === "published" ? lessonPackage(lesson.id)?.assessment.questions.length ?? 0 : 0,
  }));
  const unitQuestionCount = 0; // لا يوجد بنك اختبار وحدة بعد؛ يبقى السلوك الحالي كما هو.

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-ink">منطقة الاختبارات</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
          {LESSON_PUBLICATION_NOTICE}{" "} تُصحح إجاباتك فورًا
          وتحصل على تغذية راجعة تشرح سبب كل إجابة، وتُحفظ محاولاتك في منطقة الطالب.
        </p>
      </header>

      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm font-bold leading-relaxed text-sky-900">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        أسئلة نهاية الدرس جديدة وليست من أمثلته أو تمارين الكتاب، لكنها تقيس مهاراته نفسها.
        يُصحّح الاختبار داخل متصفحك وتظهر التغذية الراجعة بعد التسليم. مفاتيح الإجابة جزء من ملفات الموقع العامة.
      </div>

      {/* اختبارات الدروس */}
      <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-ink">
        <ClipboardCheck className="h-5 w-5 text-brand-600" />
        اختبارات الدروس
      </h2>
      <div className="space-y-8">
        {allUnits.map((unit) => {
          const unitLessons = allLessons.filter((l) => l.unitId === unit.id);
          return (
            <section key={unit.id}>
              <h3 className="mb-3 text-sm font-black text-slate-400">{unit.title}</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {unitLessons.map((lesson) => {
                  const qCount = lesson.qCount;
                  const isPublished = lesson.status === "published" && qCount > 0;
                  // الدرس غير المنشور لا يُصدَّر له مسار؛ تبقى البطاقة نفسها دون رابط ميت.
                  const Card = (isPublished ? Link : "div") as ElementType;
                  return (
                    <Card
                      key={lesson.id}
                      {...(isPublished ? { href: `/quizzes/lesson/${lesson.id}` } : {})}
                      className={isPublished
                        ? "card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
                        : "card flex items-center gap-4 p-4"}
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                          isPublished ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {isPublished ? (
                          <ClipboardCheck className="h-5 w-5" />
                        ) : (
                          <Lock className="h-5 w-5" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-black text-ink">{lesson.title}</div>
                        <div className="mt-0.5 text-xs font-bold text-slate-500">
                          {isPublished
                            ? `${fmtNum(qCount)} أسئلة بانتظار محاولتك`
                            : "سيُتاح الاختبار مع إضافة الدرس في العملية نفسها"}
                        </div>
                      </div>
                      <span
                        className={`chip shrink-0 ${
                          isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isPublished ? "ابدأ الاختبار" : "قريبًا"}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* اختبارات الوحدات */}
      <h2 className="mb-4 mt-12 flex items-center gap-2 text-xl font-black text-ink">
        <Lock className="h-5 w-5 text-brand-600" />
        اختبارات الوحدات
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {allUnits.map((unit) => {
          const qCount = unitQuestionCount;
          return (
            <div
              key={unit.id}
              className="card flex items-center gap-4 p-4 opacity-90"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400">
                <Hourglass className="h-5 w-5" />
              </span>
              <div>
                <div className="font-black text-ink">{unit.title}</div>
                <div className="mt-0.5 text-xs font-bold text-slate-500">
                  {qCount > 0
                    ? `${fmtNum(qCount)} أسئلة — متاح الآن`
                    : "يُنشأ بعد اكتمال الوحدة وبموافقة المعلم"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
