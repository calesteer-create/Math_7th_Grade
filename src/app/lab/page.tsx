import MathLab from "@/components/lab/MathLab";
import { FlaskConical } from "lucide-react";

export const dynamic = "force-dynamic";

const TOOLS = [
  { id: "fraction", name: "مستكشف الكسر", desc: "تصوّر أي كسر دائرةً وشريطًا، وقارن قيمته العشرية والمبسّطة." },
  { id: "numberline", name: "خط الأعداد النسبية", desc: "ضع الأعداد النسبية الموجبة والسالبة على خط الأعداد." },
  { id: "equation", name: "ميزان المعادلة", desc: "حل معادلات «مجهول + عدد = عدد» وفهم فكرة التوازن." },
  { id: "triangle", name: "زوايا المثلث", desc: "اكتشف أن مجموع زوايا المثلث 180° وصنّف المثلثات." },
  { id: "percent", name: "النسبة ومعدل الوحدة", desc: "استكشف النسبة المئوية والعلاقة بين الجزء والكل." },
];

export default function LabPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex items-center gap-4">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-700 to-violet-500 text-white shadow-lg">
          <FlaskConical className="h-7 w-7" />
        </span>
        <div>
          <h1 className="text-3xl font-black text-ink">المختبر التفاعلي</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            أدوات رياضية تفاعلية تخدم دروس المنهاج: غيّر القيم بنفسك ولاحظ النتيجة —
            الفهم يأتي من التجربة.
          </p>
        </div>
      </header>

      <div className="space-y-6">
        {TOOLS.map((tool) => (
          <section key={tool.id}>
            <h2 className="mb-2 text-sm font-black text-slate-400">{tool.name}</h2>
            <MathLab tool={tool.id} />
          </section>
        ))}
      </div>
    </div>
  );
}
