import Link from "next/link";
import { notFound } from "next/navigation";
import { findLesson, findUnit, lessonPackage, publishedLessons } from "@/lib/curriculum";
import LessonShell from "@/components/LessonShell";
import type { Block, NotebookSection } from "@/components/ContentRenderer";
import { ArrowLeft, ArrowRight } from "lucide-react";

// تُصدَّر صفحات الدروس المنشورة فقط؛ الدرس غير المكتمل لا يُنشر ولا يُفهرس.
export function generateStaticParams() { return publishedLessons.map(lesson => ({ lessonId: String(lesson.id) })); }

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const id = Number(lessonId);
  if (!Number.isInteger(id)) notFound();

  const entry = findLesson(id);
  const unit = entry && findUnit(entry.unitId);
  if (!entry || !unit || entry.status !== "published") notFound();
  const lesson = lessonPackage(entry.id);
  if (!lesson) notFound();

  const siblings = publishedLessons.filter(item => item.unitId === unit.id);
  const idx = siblings.findIndex(item => item.id === id);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* مسار التنقل */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
        <Link href="/units" className="hover:text-brand-700">الوحدات</Link>
        <span>/</span>
        <Link href={`/units/${unit.id}`} className="hover:text-brand-700">{unit.title}</Link>
        <span>/</span>
        <span className="text-ink">{entry.title}</span>
      </nav>

      <LessonShell
        lessonId={entry.id}
        unitTitle={unit.title}
        title={entry.title}
        goals={lesson.content.goals}
        content={lesson.content.content as unknown as Record<string, Block[]>}
        notebook={lesson.content.notebook as unknown as NotebookSection[]}
        initialStage={0}
        unitOrder={unit.order}
      />

      {/* التنقل بين الدروس المنشورة داخل الوحدة */}
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
    </div>
  );
}
