import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, Compass, FlaskConical, Layers3, NotebookPen, Sparkles } from "lucide-react";
import { lessons, units } from "@/lib/curriculum";
import { SITE, STAGES } from "@/lib/site";
import UnitIcon from "@/components/UnitIcon";
import MathMotif from "@/components/MathMotif";
import MathText from "@/components/MathText";


export default async function HomePage() {
  const allUnits = units;
  const allLessons = lessons;
  const available = allLessons.filter(lesson => lesson.status === "published");
  const first = available[0];
  return <div className="mx-auto max-w-7xl px-4 pb-8 pt-8">
    <section className="home-hero">
      <div className="home-hero-copy"><span className="lesson-eyebrow"><Sparkles size={14}/> للصف السابع · المنهاج السوري</span><h1>{SITE.name}<span>أفكار كبيرة،<br/>بخطوات <em>ممتعة.</em></span></h1><p>هنا لا نحفظ الإجابة فقط. نكتشف الفكرة، نفهم لماذا تعمل، ونجربها بأيدينا… حتى تصبح الرياضيات أقرب إلينا.</p><div className="mt-7 flex flex-wrap gap-3"><Link href={first ? `/lessons/${first.id}` : "/units"} className="btn btn-primary px-6 py-3">ابدأ رحلة التعلّم <ArrowLeft size={17}/></Link><Link href="/units" className="btn btn-ghost px-5 py-3"><Layers3 size={16}/> استكشف الوحدات</Link></div><div className="mt-6 flex flex-wrap items-center gap-5 text-xs font-bold text-slate-500">{["شرح يرافقك خطوةً خطوة", "مساحة للتجربة", "اختبر فهمك"].map(t => <span key={t} className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-teal-500"/>{t}</span>)}</div></div>
      <div className="home-hero-art"><MathMotif/><div className="home-art-note"><span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-700"><BookOpen size={19}/></span><div><b className="text-xs font-extrabold text-ink">الفهم أولًا، دائمًا.</b><p className="mt-1 text-[10px] text-slate-500">الخطأ بداية اكتشاف، وليس نهاية المحاولة.</p></div><span className="ms-2 text-2xl text-violet-400">✦</span></div></div>
    </section>

    <div className="home-stats">
      {[{n:allUnits.length,l:"وحدات في رحلتك",c:"#8a5bea",bg:"#f0e9ff",icon:<Layers3 size={19}/>},{n:allLessons.length,l:"درسًا في الفهرس",c:"#0e9e94",bg:"#e2f9f4",icon:<BookOpen size={19}/>},{n:available.length,l:"دروس متاحة الآن",c:"#d99519",bg:"#fff6d9",icon:<CheckCircle2 size={19}/>},{n:STAGES.length,l:"محطات داخل كل درس",c:"#df6981",bg:"#fff0f3",icon:<Compass size={19}/>}].map(item => <div key={item.l} className="home-stat"><span className="grid h-11 w-11 place-items-center rounded-2xl" style={{background:item.bg,color:item.c}}>{item.icon}</span><div><b className="text-2xl font-black text-ink" dir="ltr">{item.n}</b><p className="mt-0.5 text-[11px] text-slate-500">{item.l}</p></div></div>)}
    </div>

    <section className="py-9"><div className="mb-5 flex items-center gap-2 text-sm font-black text-violet-600"><span className="h-2 w-2 rounded-full bg-amber-400"/> اختر خطوتك الأولى</div><div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      {first ? <Link href={`/lessons/${first.id}`} className="featured-lesson group"><div className="flex items-start justify-between"><span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-teal-700">جاهز للتعلّم · اختبار مرفق</span><BookOpen size={28} className="text-violet-400"/></div><h2 className="mt-5 text-2xl font-black text-ink"><MathText text={first.title}/></h2><p className="mt-2 max-w-lg text-sm leading-8 text-slate-500">{first.goals && <MathText text={first.goals}/>}</p><span className="mt-5 flex items-center gap-2 text-sm font-extrabold text-violet-700">لنفهم الفكرة معًا <ArrowLeft size={16} className="transition group-hover:-translate-x-1"/></span></Link> : <Link href="/units" className="featured-lesson"><BookOpen size={28} className="text-violet-400"/><h2 className="mt-4 text-2xl font-black">ابدأ من خريطة الوحدات</h2><p className="mt-2 text-sm leading-8 text-slate-500">تُضاف الدروس مع اختباراتها ودفاترها عند وصول صور الكتاب.</p></Link>}
      <Link href="/lab" className="lab-invitation group"><div className="relative z-10"><span className="text-xs font-extrabold text-teal-700">مساحة لفضولك</span><h2 className="mt-3 text-2xl font-black text-ink">ماذا لو غيّرنا العدد؟</h2><p className="mt-2 max-w-xs text-sm leading-8 text-teal-900/65">حرّك القيم، راقب الرسوم، واكتشف العلاقة بنفسك في المختبر التفاعلي.</p><span className="mt-5 flex items-center gap-2 text-sm font-extrabold text-teal-700">جرّب واستكشف <ArrowLeft size={16} className="transition group-hover:-translate-x-1"/></span></div><FlaskConical className="lab-invitation-art" strokeWidth={1.1}/></Link>
    </div></section>

    <section className="py-8"><div className="mb-6 flex items-end justify-between gap-3"><div><p className="text-[11px] font-extrabold text-violet-500">من فكرة إلى أخرى</p><h2 className="mt-1 text-2xl font-black text-ink">كل وحدة… عالم تكتشفه</h2></div><Link href="/units" className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-violet-600">خريطة المنهاج <ArrowLeft size={14}/></Link></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {allUnits.map(u => {const list = allLessons.filter(l => l.unitId === u.id); const ready = list.filter(l => l.status === "published").length; return <Link key={u.id} href={`/units/${u.id}`} className="unit-tile group"><div className="flex items-center justify-between"><UnitIcon icon={u.icon} color={u.color} size="h-11 w-11"/><span className="text-3xl font-black text-violet-100" dir="ltr">{String(u.order).padStart(2,"0")}</span></div><h3 className="mt-5 min-h-12 text-sm font-extrabold leading-6 text-ink">{u.title}</h3><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[10px] font-semibold text-slate-400">{list.length} دروس · {ready ? `${ready} متاح` : "بانتظار المحتوى"}</span><ArrowLeft size={14} className="text-violet-400 transition group-hover:-translate-x-1"/></div></Link>;})}
    </div></section>

    <section className="my-8 rounded-[26px] border border-violet-100 bg-white p-7"><div className="flex flex-wrap items-center justify-between gap-5"><div><span className="text-xs font-bold text-violet-500">تعلّم له معنى</span><h2 className="mt-2 text-xl font-black text-ink">ليس كتابًا على شاشة… بل رحلة فهم.</h2></div><div className="flex flex-wrap gap-5">{[{icon:<Compass size={18}/>,title:"اكتشف",color:"#d99419"},{icon:<BookOpen size={18}/>,title:"افهم",color:"#8751db"},{icon:<FlaskConical size={18}/>,title:"جرّب",color:"#14a595"},{icon:<NotebookPen size={18}/>,title:"راجع",color:"#e57282"}].map(s => <div key={s.title} className="flex items-center gap-2 text-xs font-bold text-slate-600"><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50" style={{color:s.color}}>{s.icon}</span>{s.title}</div>)}</div></div><p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-7 text-slate-500">نضيف محتوى كل درس من صور الكتاب، ونميّز الشرح الإضافي بوسم واضح. يأتي اختبار نهاية الدرس ودفتر الطالب معه في عملية النشر نفسها، بينما تبقى الدروس التي لم تصل صورها غير منشورة.</p></section>
  </div>;
}
