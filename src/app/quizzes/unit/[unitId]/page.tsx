import Link from "next/link";
import { notFound } from "next/navigation";
import { units } from "@/lib/curriculum";
import QuizPlayer from "@/components/QuizPlayer";
import { ArrowRight } from "lucide-react";

export function generateStaticParams() { return units.map(item => ({ unitId: String(item.id) })); }

export default async function UnitQuizPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
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
