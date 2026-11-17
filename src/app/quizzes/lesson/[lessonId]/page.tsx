import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { lessons, units } from "@/db/schema";
import { eq } from "drizzle-orm";
import QuizPlayer from "@/components/QuizPlayer";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LessonQuizPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const id = Number(lessonId);
  if (!Number.isInteger(id)) notFound();

  const rows = await db
    .select({ lesson: lessons, unit: units })
    .from(lessons)
    .innerJoin(units, eq(lessons.unitId, units.id))
    .where(eq(lessons.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
        <Link href="/quizzes" className="hover:text-brand-700">الاختبارات</Link>
        <span>/</span>
        <Link href={`/units/${row.unit.id}`} className="hover:text-brand-700">{row.unit.title}</Link>
        <span>/</span>
        <span className="text-ink">اختبار درس: {row.lesson.title}</span>
      </nav>

      <QuizPlayer scope="lesson" id={row.lesson.id} title={`اختبار درس: ${row.lesson.title}`} />

      <div className="no-print mt-6 flex items-center justify-between">
        <Link href={`/lessons/${row.lesson.id}`} className="btn btn-ghost text-xs">
          <ArrowRight className="h-4 w-4" />
          العودة إلى الدرس
        </Link>
        <Link href="/student" className="btn btn-primary text-xs">
          متابعة تقدمك في منطقة الطالب
        </Link>
      </div>
    </div>
  );
}
