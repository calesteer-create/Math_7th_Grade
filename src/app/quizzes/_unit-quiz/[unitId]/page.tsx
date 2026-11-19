import Link from "next/link";
import { notFound } from "next/navigation";
import { units } from "@/lib/curriculum";
import QuizPlayer from "@/components/QuizPlayer";
import { ArrowRight } from "lucide-react";

/**
 * اختبار الوحدة — مُعطَّل مؤقتًا.
 * لا يوجد بنك اختبار وحدة معتمد بعد، وصفحة فارغة تُضلّل الطالب، لذلك لا يُسجَّل هذا المسار
 * ولا تُصدَّر صفحات `quizzes/unit/*`. المجلد `_unit-quiz` مجلد خاص لا يُوجَّه في App Router.
 * لإعادة التفعيل: انقل الملف إلى `src/app/quizzes/unit/[unitId]/page.tsx` بعد اعتماد أول بنك،
 * وأعِد رقم الوحدة إلى `unitQuizIds` في `scripts/check-export.mjs`.
 */
export const dynamicParams = false;
export function generateStaticParams() { return []; }

export default async function UnitQuizPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const id = Number(unitId);
  if (!Number.isInteger(id)) notFound();
  const unit = units.find(item => item.id === id);
  if (!unit) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
        <Link href="/quizzes" className="hover:text-brand-700">الاختبارات</Link>
        <span>/</span>
        <span className="text-ink">اختبار الوحدة: {unit.title}</span>
      </nav>

      <QuizPlayer scope="unit" id={unit.id} title={`اختبار الوحدة: ${unit.title}`} />

      <div className="no-print mt-6">
        <Link href={`/units/${unit.id}`} className="btn btn-ghost text-xs">
          <ArrowRight className="h-4 w-4" />
          العودة إلى الوحدة
        </Link>
      </div>
    </div>
  );
}
