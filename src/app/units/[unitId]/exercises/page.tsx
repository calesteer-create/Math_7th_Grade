import Link from "next/link";
import { notFound } from "next/navigation";
import { units } from "@/lib/curriculum";
import { UNIT_EXERCISES_INDEX, hasUnitExercises } from "@/content/unit-exercise-index";
import { validateUnitExercises } from "@/lib/unit-exercises";
import UnitExercises from "@/components/UnitExercises";
import { ArrowRight, BookOpenCheck } from "lucide-react";

// تُصدَّر صفحة تمرينات الوحدة فقط إذا كانت الوحدة تملك ملف تمرينات معتمدًا.
export function generateStaticParams() {
  return Object.keys(UNIT_EXERCISES_INDEX).map(unitId => ({ unitId }));
}

export default async function UnitExercisesPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const id = Number(unitId);
  const unit = units.find(item => item.id === id);
  if (!Number.isInteger(id) || !unit || !hasUnitExercises(id)) notFound();

  const data = validateUnitExercises(UNIT_EXERCISES_INDEX[id], `unit-exercises/unit-${id}.json`);

  return <div className="mx-auto max-w-6xl px-4 py-10">
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
      <Link href="/units" className="hover:text-brand-700">الوحدات</Link>
      <span>/</span>
      <Link href={`/units/${unit.id}`} className="hover:text-brand-700">{unit.title}</Link>
      <span>/</span>
      <span className="text-ink">{data.title}</span>
    </nav>

    <UnitExercises data={data} />

    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
      <Link href={`/units/${unit.id}`} className="btn btn-ghost text-xs"><ArrowRight size={15} /> العودة إلى الوحدة</Link>
      <Link href="/student" className="btn btn-ghost text-xs"><BookOpenCheck size={15} /> منطقة الطالب</Link>
    </div>
  </div>;
}
