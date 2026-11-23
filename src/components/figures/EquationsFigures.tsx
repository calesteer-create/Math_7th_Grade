"use client";

import FigureFrame from "@/components/figures/FigureFrame";
import DiagramMath from "@/components/DiagramMath";
import MathText from "@/components/MathText";
import TeX from "@/components/TeX";
import { WARMUP_TABLE_ROWS, type EquationsFigureKind } from "@/lib/solving-equations";

/** ميزان معادلة بصري قابل لإعادة الاستعمال في الشرح والمختبر. */
export function BalanceScaleSvg({ leftLabel, rightLabel, leftVal, rightVal, caption }: {
  leftLabel: string; rightLabel: string; leftVal: number; rightVal: number; caption: string;
}) {
  const diff = leftVal - rightVal;
  const tilt = diff === 0 ? 0 : diff > 0 ? -9 : 9;
  const balanced = diff === 0;
  return <svg viewBox="0 0 460 190" className="block w-full max-w-[440px]" role="img" aria-label={caption} direction="ltr">
    <rect x={10} y={10} width={440} height={170} rx={18} fill={balanced ? "#f0fdf4" : "#fff7ed"} stroke={balanced ? "#86efac" : "#fed7aa"} strokeWidth={1.6} />
    {/* القاعدة والعمود */}
    <polygon points="205,160 255,160 230,130" fill="#64748b" />
    <rect x={225} y={66} width={10} height={68} rx={4} fill="#475569" />
    <circle cx={230} cy={66} r={7} fill={balanced ? "#059669" : "#d97706"} />
    {/* الذراع المائلة حسب المقارنة */}
    <g transform={`rotate(${tilt} 230 66)`}>
      <rect x={76} y={62} width={308} height={8} rx={4} fill="#334155" />
      {/* الكفة اليسرى */}
      <line x1={110} y1={70} x2={92} y2={110} stroke="#64748b" strokeWidth={1.8} />
      <line x1={110} y1={70} x2={128} y2={110} stroke="#64748b" strokeWidth={1.8} />
      <path d="M 74 110 Q 110 126 146 110 Z" fill="#dbeafe" stroke="#2563eb" strokeWidth={2} />
      <DiagramMath tex={leftLabel} x={64} y={24} width={96} height={32} fontSize={16} color="#1e40af" />
      {/* الكفة اليمنى */}
      <line x1={350} y1={70} x2={332} y2={110} stroke="#64748b" strokeWidth={1.8} />
      <line x1={350} y1={70} x2={368} y2={110} stroke="#64748b" strokeWidth={1.8} />
      <path d="M 314 110 Q 350 126 386 110 Z" fill="#f3e8ff" stroke="#7c3aed" strokeWidth={2} />
      <DiagramMath tex={rightLabel} x={302} y={24} width={96} height={32} fontSize={16} color="#6d28d9" />
    </g>
    <text x={230} y={172} textAnchor="middle" fontSize="12" fontWeight="800" fill={balanced ? "#065f46" : "#9a3412"}>{caption}</text>
  </svg>;
}

function EquationBalanceFigure() {
  return <div className="grid gap-4 md:grid-cols-2">
    <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-white p-3">
      <p className="mb-2 text-xs font-extrabold text-emerald-800">عند <TeX tex="x = 3" />: <TeX tex="2(3) - 5 = 1" /></p>
      <BalanceScaleSvg leftLabel="2(3)-5=1" rightLabel="1" leftVal={1} rightVal={1} caption="الكفّتان متعادلتان ← العدد 3 حلّ للمعادلة" />
    </div>
    <div className="flex flex-col items-center rounded-2xl border border-amber-200 bg-white p-3">
      <p className="mb-2 text-xs font-extrabold text-amber-800">عند <TeX tex="x = 4" />: <TeX tex="2(4) - 5 = 3 \neq 1" /></p>
      <BalanceScaleSvg leftLabel="2(4)-5=3" rightLabel="1" leftVal={3} rightVal={1} caption="الميزان يميل ← العدد 4 ليس حلًّا للمعادلة" />
    </div>
  </div>;
}

function OrderOfOpsTableFigure() {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
    <table className="w-full min-w-[540px] border-collapse text-sm" dir="rtl">
      <thead>
        <tr className="bg-lime-100/80 text-xs font-black text-slate-800">
          <th className="border border-slate-200 px-3 py-2.5 text-right">العبارة أو السؤال</th>
          <th className="border border-slate-200 px-3 py-2.5 text-center" dir="ltr">A</th>
          <th className="border border-slate-200 px-3 py-2.5 text-center" dir="ltr">B</th>
          <th className="border border-slate-200 px-3 py-2.5 text-center" dir="ltr">C</th>
        </tr>
      </thead>
      <tbody>
        {WARMUP_TABLE_ROWS.map((row, idx) => <tr key={row.id} className={idx % 2 === 0 ? "bg-white" : "bg-lime-50/40"}>
          <td className="border border-slate-200 px-3 py-2.5 font-bold text-slate-700"><MathText text={row.prompt} /></td>
          <td className="border border-slate-200 px-3 py-2.5 text-center font-bold text-slate-700" dir="ltr"><TeX tex={row.options.A} /></td>
          <td className="border border-slate-200 px-3 py-2.5 text-center font-bold text-slate-700" dir="ltr"><TeX tex={row.options.B} /></td>
          <td className="border border-slate-200 px-3 py-2.5 text-center font-bold text-slate-700" dir="ltr"><TeX tex={row.options.C} /></td>
        </tr>)}
      </tbody>
    </table>
  </div>;
}

function DivideCoefficientFlowFigure() {
  return <div className="overflow-x-auto">
    <svg viewBox="0 0 680 185" className="block w-full min-w-[540px]" role="img" aria-label="حل المعادلة 3x = 24 بقسمة الطرفين على 3 لنحصل على x = 8، والقاعدة العامة ax = c تعطي x = c/a بشرط a != 0" direction="ltr">
      <defs>
        <marker id="eq-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#7c3aed" /></marker>
      </defs>
      {/* الصف العلوي: المثال العددي */}
      <rect x={20} y={18} width={150} height={58} rx={14} fill="#eef2ff" stroke="#6366f1" strokeWidth={1.8} />
      <DiagramMath tex="3x = 24" x={35} y={32} width={120} height={32} fontSize={20} color="#312e81" />

      <line x1={174} y1={47} x2={246} y2={47} stroke="#7c3aed" strokeWidth={2.4} markerEnd="url(#eq-arrow)" />
      <text x={210} y={36} textAnchor="middle" fontSize="12" fontWeight="800" fill="#6d28d9">نقسم على 3</text>

      <rect x={252} y={18} width={190} height={58} rx={14} fill="#f5f3ff" stroke="#7c3aed" strokeWidth={1.8} />
      <DiagramMath tex="x = 24 \div 3 = \frac{24}{3}" x={260} y={24} width={174} height={46} fontSize={18} color="#4c1d95" />

      <line x1={446} y1={47} x2={504} y2={47} stroke="#7c3aed" strokeWidth={2.4} markerEnd="url(#eq-arrow)" />

      <rect x={510} y={18} width={148} height={58} rx={14} fill="#dcfce7" stroke="#059669" strokeWidth={2} />
      <DiagramMath tex="x = 8" x={534} y={32} width={100} height={32} fontSize={21} color="#065f46" />

      {/* الصف السفلي: القاعدة العامة */}
      <rect x={20} y={104} width={150} height={62} rx={14} fill="#faf5ff" stroke="#9333ea" strokeWidth={1.8} />
      <DiagramMath tex="ax = c" x={35} y={120} width={120} height={32} fontSize={20} color="#581c87" />

      <line x1={174} y1={135} x2={246} y2={135} stroke="#7c3aed" strokeWidth={2.4} markerEnd="url(#eq-arrow)" />
      <text x={210} y={124} textAnchor="middle" fontSize="12" fontWeight="800" fill="#6d28d9">نقسم على a</text>

      <rect x={252} y={104} width={190} height={62} rx={14} fill="#f0fdfa" stroke="#0d9488" strokeWidth={2} />
      <DiagramMath tex="x = \frac{c}{a}" x={288} y={110} width={118} height={50} fontSize={21} color="#115e59" />

      <rect x={464} y={104} width={194} height={62} rx={14} fill="#fff1f2" stroke="#e11d48" strokeWidth={1.8} />
      <text x={561} y={126} textAnchor="middle" fontSize="12" fontWeight="800" fill="#9f1239">شرط أساسي</text>
      <DiagramMath tex="a \neq 0" x={516} y={132} width={90} height={28} fontSize={18} color="#be123c" />
    </svg>
  </div>;
}

export default function EquationsBookFigure({ figure }: { figure: EquationsFigureKind }) {
  switch (figure) {
    case "equationBalance":
      return <FigureFrame
        kind={figure}
        title="ميزان المعادلة والتحقّق من الحلّ"
        detail="المعادلة مساواة بين طرفين تحوي متغيّرًا، وحلّها هو القيمة التي تحفظ توازن الكفّتين معًا."
      >
        <EquationBalanceFigure />
      </FigureFrame>;
    case "orderOfOpsTable":
      return <FigureFrame
        kind={figure}
        title="جدول مراجعة أولوية العمليات والمعادلات"
        detail="قبل حلّ المعادلات نطبّق ترتيب العمليات: الأقواس أولًا، ثم الضرب والقسمة، ثم الجمع والطرح."
      >
        <OrderOfOpsTableFigure />
      </FigureFrame>;
    case "divideCoefficientFlow":
      return <FigureFrame
        kind={figure}
        title="قاعدة حلّ المعادلة ax = c"
        detail="لإيجاد \(x\) في المعادلة \(ax = c\) نقسم الطرف الأيمن \(c\) على أمثال المتغيّر \(a\)، بشرط \(a \neq 0\)."
      >
        <DivideCoefficientFlowFigure />
      </FigureFrame>;
  }
}
