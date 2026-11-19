import type { ElementType } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lessons, units } from "@/lib/curriculum";
import { STAGES, fmtNum } from "@/lib/site";
import UnitIcon from "@/components/UnitIcon";
import { ArrowLeft, ArrowRight, BookOpen, Lock } from "lucide-react";

export function generateStaticParams() { return units.map(unit => ({ unitId: String(unit.id) })); }

export default async function UnitPage({
  params,
}: {
  params: Promise<{ unitId: string }>;
}) {
  const { unitId } = await params;
  const id = Number(unitId);
  if (!Number.isInteger(id)) notFound();

  const unit = units.find(unit => unit.id === id);
  if (!unit) notFound();
  const unitLessons = lessons.filter(lesson => lesson.unitId === id);
  const allUnits = units;
  const idx = allUnits.findIndex((u) => u.id === id);
  const prev = allUnits[idx - 1];
  const next = allUnits[idx + 1];
  const publishedCount = unitLessons.filter((l) => l.status === "published").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* ترويسة الوحدة */}
      <header className="card mb-8 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <UnitIcon icon={unit.icon} color={unit.color} size="h-16 w-16" />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-brand-600">
              الوحدة {fmtNum(unit.order)} من أصل {fmtNum(allUnits.length)}
            </div>
            <h1 className="mt-1 text-2xl font-black text-ink md:text-3xl">{unit.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              {unit.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip bg-slate-100 text-slate-600">
                {fmtNum(unitLessons.length)} دروس
              </span>
              <span className="chip bg-brand-50 text-brand-700">
                {fmtNum(STAGES.length)} مراحل تعليمية لكل درس
              </span>
              {publishedCount > 0 && (
                <span className="chip bg-emerald-100 text-emerald-700">
                  {fmtNum(publishedCount)} دروس متاحة
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* قائمة الدروس */}
      <ol className="space-y-3">
        {unitLessons.map((lesson, i) => {
          const isPublished = lesson.status === "published";
          // الدرس غير المنشور لا يُصدَّر له مسار؛ تبقى البطاقة نفسها بلا رابط ميت.
          const Card = (isPublished ? Link : "div") as ElementType;
          return (
            <li key={lesson.id}>
              <Card
                {...(isPublished ? { href: `/lessons/${lesson.id}` } : {})}
                className={isPublished
                  ? "card group flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
                  : "card flex items-center gap-4 p-4"}
              >
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-black ${
                    isPublished
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isPublished ? <BookOpen className="h-5 w-5" /> : fmtNum(i + 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-ink">
                    الدرس {fmtNum(i + 1)}: {lesson.title}
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-slate-500">
                    {isPublished
                      ? "متاح للدراسة — شرح موسّع ومختبر واختبار ودفتر طالب"
                      : "المحتوى بانتظار صور الدرس"}
                  </div>
                </div>
                {isPublished ? (
                  <span className="chip shrink-0 bg-emerald-100 text-emerald-700">ابدأ الدرس</span>
                ) : (
                  <span className="chip shrink-0 bg-slate-100 text-slate-500">
                    <Lock className="h-3 w-3" /> قريبًا
                  </span>
                )}
              </Card>
            </li>
          );
        })}
      </ol>

      {/* التنقل بين الوحدات */}
      <div className="mt-8 flex items-center justify-between gap-3">
        {prev ? (
          <Link href={`/units/${prev.id}`} className="btn btn-ghost">
            <ArrowRight className="h-4 w-4" />
            الوحدة السابقة: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/units/${next.id}`} className="btn btn-ghost">
            الوحدة التالية: {next.title}
            <ArrowLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
