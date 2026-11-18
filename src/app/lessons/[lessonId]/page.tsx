import Link from "next/link";
import { notFound } from "next/navigation";
import { lessons, units } from "@/lib/curriculum";
import { STAGES, fmtNum } from "@/lib/site";
import LessonShell from "@/components/LessonShell";
import ContentRenderer, {
  Block,
  NotebookSection,
} from "@/components/ContentRenderer";
import { EngineerCard, EngineerSignature } from "@/components/Identity";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Hourglass,
  Lock,
  Map,
} from "lucide-react";

export function generateStaticParams() { return lessons.map(lesson => ({ lessonId: String(lesson.id) })); }

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const id = Number(lessonId);
  if (!Number.isInteger(id)) notFound();

  const lesson = lessons.find(lesson => lesson.id === id);
  if (!lesson) notFound();
  const unit = units.find(unit => unit.id === lesson.unitId);
  if (!unit) notFound();
  const siblings = lessons.filter(item => item.unitId === unit.id);
  const idx = siblings.findIndex(item => item.id === id);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];
  const isPublished = lesson.status === "published" && !!lesson.content;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* مسار التنقل */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
        <Link href="/units" className="hover:text-brand-700">الوحدات</Link>
        <span>/</span>
        <Link href={`/units/${unit.id}`} className="hover:text-brand-700">{unit.title}</Link>
        <span>/</span>
        <span className="text-ink">{lesson.title}</span>
      </nav>

      {isPublished ? (
        <LessonShell
          lessonId={lesson.id}
          unitTitle={unit.title}
          title={lesson.title}
          goals={lesson.goals}
          content={lesson.content as unknown as Record<string, Block[]> | null}
          notebook={(lesson.notebook as unknown as NotebookSection[] | null) ?? null}
          initialStage={0}
          unitOrder={unit.order}
        />
      ) : (
        /* الدرس ما زال بانتظار اعتماد محتواه من صور الكتاب */
        <div className="space-y-8">
          <div className="card relative overflow-hidden p-8 md:p-10">
            <div className="bg-grid absolute inset-0 opacity-60" />
            <div className="relative">
              <span className="chip bg-amber-100 text-amber-800">
                <Hourglass className="h-3.5 w-3.5" />
                المحتوى بانتظار الاعتماد
              </span>
              <h1 className="mt-4 text-2xl font-black text-ink md:text-3xl">
                الدرس {fmtNum(idx + 1)}: {lesson.title}
              </h1>
              <p className="mt-2 text-sm font-bold text-slate-500">{unit.title}</p>
              <p className="mt-4 max-w-3xl leading-loose text-slate-600">
                ما زال محتوى هذا الدرس بانتظار اعتماده من صور صفحات الكتاب المدرسي.
                سيُبنى الدرس كاملًا عند استلام الصور: شرح تعليمي موسّع مميّز عن محتوى
                الكتاب، مختبر تفاعلي، اختبار خاص بالدرس، ودفتر طالب في المرحلة الأخيرة،
                إضافةً إلى الحلول التفصيلية في منطقة المعلم.
              </p>
            </div>
          </div>

          {/* هيكل مراحل الدرس كما سيُبنى */}
          <div className="card p-6 md:p-8">
            <h2 className="flex items-center gap-2 text-lg font-black text-ink">
              <Map className="h-5 w-5 text-brand-600" />
              هيكل الدرس عند اكتماله — {fmtNum(STAGES.length)} مراحل
            </h2>
            <ol className="mt-5 grid gap-3 md:grid-cols-3">
              {STAGES.map((s, i) => (
                <li
                  key={s.key}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5"
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-xs font-black text-brand-700 shadow-sm">
                    {fmtNum(i + 1)}
                  </span>
                  <div>
                    <div className="text-sm font-black text-ink">{s.title}</div>
                    <div className="mt-0.5 text-[11px] font-semibold leading-relaxed text-slate-500">
                      {s.hint}
                    </div>
                  </div>
                  {i === STAGES.length - 1 && (
                    <Lock className="ms-auto h-3.5 w-3.5 text-slate-300" />
                  )}
                </li>
              ))}
            </ol>
          </div>

          <EngineerCard />
          <EngineerSignature />

          {/* دروس مجاورة */}
          <div className="flex items-center justify-between gap-3">
            {prev ? (
              <Link href={`/lessons/${prev.id}`} className="btn btn-ghost">
                <ArrowRight className="h-4 w-4" />
                الدرس السابق
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/lessons/${next.id}`} className="btn btn-ghost">
                الدرس التالي
                <ArrowLeft className="h-4 w-4" />
              </Link>
            ) : (
              <span />
            )}
          </div>
        </div>
      )}

      {/* التنقل بين الدروس داخل الوحدة — للدروس المنشورة أيضًا */}
      {isPublished && (
        <div className="no-print mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-6">
          {prev ? (
            <Link href={`/lessons/${prev.id}`} className="btn btn-ghost text-xs">
              <ArrowRight className="h-4 w-4" />
              {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/lessons/${next.id}`} className="btn btn-ghost text-xs">
              {next.title}
              <ArrowLeft className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}
