import Link from "next/link";
import { db } from "@/db";
import { lessons, units } from "@/db/schema";
import { fmtNum } from "@/lib/site";
import UnitIcon from "@/components/UnitIcon";
import { ArrowLeft, BookOpen, Layers3, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UnitsPage() {
  const allUnits = await db.select().from(units).orderBy(units.order);
  const allLessons = await db.select().from(lessons);
  const published = allLessons.filter(l => l.status === "published").length;

  return <div className="mx-auto max-w-7xl px-4 py-10">
    <div className="relative mb-8 overflow-hidden rounded-[30px] bg-gradient-to-l from-violet-600 via-brand-600 to-fuchsia-500 px-7 py-9 text-white md:px-10 md:py-12">
      <div className="bg-grid-light pointer-events-none absolute inset-0"/>
      <div className="pointer-events-none absolute -left-10 top-0 h-56 w-56 rounded-full bg-indigo-400/20 blur-3xl"/>
      <div className="relative flex flex-wrap items-end justify-between gap-5">
        <div><span className="flex items-center gap-2 text-xs font-black text-amber-300"><Sparkles size={15}/> رحلتك تبدأ من هنا</span><h1 className="mt-3 text-3xl font-black md:text-4xl">خريطة الرياضيات</h1><p className="mt-3 max-w-xl text-sm leading-loose text-white/85">بطاقة لكل وحدة، ودروس مرتبة كما في فهرس الكتاب الذي أرسلته. تُفتح الدروس التعليمية واحدًا تلو الآخر بعد وصول صورها واعتمادها.</p></div>
        <div className="flex gap-3"><div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-center"><div className="text-2xl font-black" dir="ltr">{fmtNum(allUnits.length)}</div><div className="text-[11px] text-white/85">وحدات</div></div><div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-center"><div className="text-2xl font-black" dir="ltr">{fmtNum(published)}</div><div className="text-[11px] text-white/85">درس متاح</div></div></div>
      </div>
    </div>
    <div className="mb-5 flex items-center gap-2 text-sm font-black text-slate-500"><Layers3 size={18} className="text-indigo-600"/> وحدات الكتاب حسب الفهرس المصوّر</div>
    <div className="grid gap-5 md:grid-cols-2">
      {allUnits.map(u => {
        const items = allLessons.filter(l => l.unitId === u.id).sort((a,b) => a.order-b.order);
        const ready = items.filter(l => l.status === "published").length;
        return <Link key={u.id} href={`/units/${u.id}`} className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-900/10">
          <div className="p-6"><div className="flex items-start gap-4"><UnitIcon icon={u.icon} color={u.color} size="h-14 w-14"/><div className="min-w-0 flex-1"><div className="text-[11px] font-black tracking-wide text-indigo-600">الوحدة {String(u.order).padStart(2,"0")}</div><h2 className="mt-1 text-xl font-black text-ink">{u.title}</h2><p className="mt-1.5 text-xs leading-relaxed text-slate-500">{u.description}</p></div><ArrowLeft size={18} className="text-slate-300 transition group-hover:-translate-x-1 group-hover:text-indigo-600"/></div>
          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">{items.slice(0,3).map(l => <div key={l.id} className="flex items-center justify-between gap-2 text-xs"><span className="flex items-center gap-2 font-bold text-slate-600"><span className={`h-1.5 w-1.5 rounded-full ${l.status === "published" ? "bg-emerald-500" : "bg-slate-300"}`}/>{l.title}</span>{l.status === "published" && <span className="shrink-0 font-black text-emerald-600">متاح الآن</span>}</div>)}{items.length > 3 && <p className="pt-1 text-[11px] font-semibold text-slate-400">و{items.length-3} دروس أخرى ضمن الوحدة</p>}</div>
          </div><div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3"><span className="flex items-center gap-2 text-xs font-bold text-slate-500"><BookOpen size={14}/>{fmtNum(items.length)} دروس · {fmtNum(ready)} متاح</span><span className="flex items-center gap-1 text-xs font-black text-indigo-600">استكشف الوحدة <ArrowLeft size={14} className="transition group-hover:-translate-x-1"/></span></div>
        </Link>;
      })}
    </div>
    <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900"><b>ملاحظة المصدر:</b> بطاقات الوحدات مرتبة وفق فهرس الكتاب. ظهور عنوان الدرس لا يعني أن محتواه متاح بعد؛ تُضاف الدروس مع اختباراتها ودفاترها عند وصول الصور. العناوين غير الواضحة تبقى معلّمة حتى نتأكد منها، دون تخمين.</div>
  </div>;
}
