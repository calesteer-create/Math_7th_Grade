"use client";

import FigureFrame from "@/components/figures/FigureFrame";
import DiagramMath from "@/components/DiagramMath";
import TeX from "@/components/TeX";
import { ENVELOPE_SHAPES, type AlgebraFigureKind } from "@/lib/algebraic-expressions";

/** رسم مغلّف نقود موحّد داخل SVG. */
export function EnvelopeIcon({ x, y, w = 44, h = 30 }: { x: number; y: number; w?: number; h?: number }) {
  return <g transform={`translate(${x},${y})`}>
    <rect x={0} y={0} width={w} height={h} rx={3} fill="#e8edf5" stroke="#334155" strokeWidth={1.6} />
    <polyline points={`0,0 ${w / 2},${h * 0.62} ${w},0`} fill="none" stroke="#334155" strokeWidth={1.6} />
    <text x={w / 2} y={h - 5} textAnchor="middle" fontSize="11" fontWeight="800" fill="#4f46e5">x</text>
  </g>;
}

/** رسم قطعة نقدية موحّدة داخل SVG. */
export function CoinIcon({ cx, cy, r = 14 }: { cx: number; cy: number; r?: number }) {
  return <g>
    <circle cx={cx} cy={cy} r={r} fill="#cbd5e1" stroke="#64748b" strokeWidth={1.6} />
    <circle cx={cx} cy={cy} r={r - 3.5} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
    <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#334155">1</text>
  </g>;
}

function EnvelopesModelsFigure() {
  return <div className="grid gap-4 sm:grid-cols-2" dir="rtl">
    {ENVELOPE_SHAPES.map(shape => <div key={shape.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3.5 py-2 text-xs font-extrabold text-slate-700">
        <span>{shape.label}</span>
        <span className="text-[11px] font-bold text-slate-500">{shape.envelopes} مغلّف · {shape.coins} قطع</span>
      </div>
      <div className="p-3">
        <svg viewBox="0 0 260 112" className="block w-full" role="img" aria-label={`${shape.label}: ${shape.envelopes} مغلّفات و${shape.coins} قطع نقدية`} direction="ltr">
          <rect x={8} y={6} width={244} height={100} rx={12} fill="#f7a897" fillOpacity={0.65} stroke="#c2410c" strokeOpacity={0.4} strokeWidth={1.5} />
          {Array.from({ length: shape.envelopes }, (_, i) => <EnvelopeIcon key={i} x={24 + i * 54} y={18} />)}
          {Array.from({ length: shape.coins }, (_, i) => <CoinIcon key={i} cx={46 + i * 48} cy={78} />)}
        </svg>
      </div>
      <div className="border-t border-slate-100 bg-violet-50/50 px-3 py-2 text-center text-sm font-black text-violet-900">
        {shape.shown ? <TeX tex={shape.tex} /> : <span className="text-xs font-bold text-slate-500">عبّر عنه بعبارة جبرية: <TeX tex={shape.tex} /></span>}
      </div>
    </div>)}
  </div>;
}

function ExpressionAnatomyFigure() {
  return <div className="flex justify-center">
    <svg viewBox="0 0 560 180" className="block w-full max-w-[540px]" role="img" aria-label="أجزاء العبارة الجبرية ax + b: مَثَل المتغير a، المتغير x، والحد الثابت +b" direction="ltr">
      <rect x={16} y={12} width={528} height={156} rx={18} fill="#faf7ff" stroke="#ddd6fe" strokeWidth={1.5} />
      <DiagramMath tex="a" x={208} y={24} width={44} height={44} fontSize={32} color="#1d4ed8" />
      <DiagramMath tex="x" x={246} y={24} width={44} height={44} fontSize={32} color="#047857" />
      <DiagramMath tex="+" x={286} y={26} width={36} height={44} fontSize={28} color="#334155" />
      <DiagramMath tex="b" x={318} y={24} width={44} height={44} fontSize={32} color="#dc2626" />

      <defs>
        <marker id="alg-arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#1d4ed8" /></marker>
        <marker id="alg-arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#047857" /></marker>
        <marker id="alg-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#dc2626" /></marker>
      </defs>

      <line x1={226} y1={72} x2={125} y2={114} stroke="#1d4ed8" strokeWidth={2.2} markerEnd="url(#alg-arrow-blue)" />
      <line x1={268} y1={72} x2={268} y2={114} stroke="#047857" strokeWidth={2.2} markerEnd="url(#alg-arrow-green)" />
      <line x1={336} y1={72} x2={435} y2={114} stroke="#dc2626" strokeWidth={2.2} markerEnd="url(#alg-arrow-red)" />

      <rect x={44} y={120} width={160} height={36} rx={10} fill="#dbeafe" />
      <text x={124} y={143} textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#1e40af">مَثَل المتغيّر (معامله)</text>

      <rect x={218} y={120} width={104} height={36} rx={10} fill="#d1fae5" />
      <text x={270} y={143} textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#065f46">المتغيّر</text>

      <rect x={366} y={120} width={144} height={36} rx={10} fill="#fee2e2" />
      <text x={438} y={143} textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#991b1b">الحدّ الثابت</text>
    </svg>
  </div>;
}

function EnvelopesAdditionFigure() {
  return <div className="overflow-x-auto">
    <svg viewBox="0 0 720 215" className="block w-full min-w-[580px]" role="img" aria-label="جمع 2x + 3 مع 3x + 1 يعطي 5 مغلّفات و4 قطع نقدية أي 5x + 4" direction="ltr">
      {/* الصندوق الأول: 2x + 3 */}
      <rect x={16} y={18} width={146} height={134} rx={12} fill="#ffffff" stroke="#475569" strokeWidth={1.6} />
      <EnvelopeIcon x={28} y={32} w={42} h={28} />
      <EnvelopeIcon x={28} y={108} w={42} h={28} />
      <CoinIcon cx={124} cy={46} r={13} />
      <CoinIcon cx={124} cy={84} r={13} />
      <CoinIcon cx={124} cy={122} r={13} />
      <DiagramMath tex="2x + 3" x={28} y={164} width={120} height={34} fontSize={18} color="#1e293b" />

      {/* علامة الجمع */}
      <rect x={182} y={76} width={28} height={8} rx={3} fill="#84cc16" />
      <rect x={192} y={66} width={8} height={28} rx={3} fill="#84cc16" />
      <DiagramMath tex="+" x={180} y={164} width={32} height={34} fontSize={20} color="#4d7c0f" />

      {/* الصندوق الثاني: 3x + 1 */}
      <rect x={228} y={18} width={146} height={134} rx={12} fill="#ffffff" stroke="#475569" strokeWidth={1.6} />
      <EnvelopeIcon x={242} y={28} w={42} h={28} />
      <EnvelopeIcon x={242} y={70} w={42} h={28} />
      <EnvelopeIcon x={242} y={112} w={42} h={28} />
      <CoinIcon cx={336} cy={84} r={13} />
      <DiagramMath tex="3x + 1" x={240} y={164} width={120} height={34} fontSize={18} color="#1e293b" />

      {/* السهم الأخضر */}
      <path d="M 392 78 L 434 78 L 434 68 L 456 84 L 434 100 L 434 90 L 392 90 Z" fill="#84cc16" />
      <DiagramMath tex="=" x={408} y={164} width={32} height={34} fontSize={20} color="#334155" />

      {/* صندوق الناتج: 5x + 4 */}
      <rect x={472} y={18} width={232} height={134} rx={12} fill="#f5f3ff" stroke="#7c3aed" strokeWidth={2} />
      <EnvelopeIcon x={486} y={32} w={40} h={26} />
      <EnvelopeIcon x={486} y={108} w={40} h={26} />
      <EnvelopeIcon x={542} y={28} w={40} h={26} />
      <EnvelopeIcon x={542} y={70} w={40} h={26} />
      <EnvelopeIcon x={542} y={112} w={40} h={26} />
      <CoinIcon cx={626} cy={46} r={12.5} />
      <CoinIcon cx={626} cy={84} r={12.5} />
      <CoinIcon cx={626} cy={122} r={12.5} />
      <CoinIcon cx={674} cy={84} r={12.5} />
      <DiagramMath tex="5x + 4" x={528} y={164} width={120} height={34} fontSize={19} color="#6d28d9" />
    </svg>
  </div>;
}

function TrianglePerimeterFigure() {
  return <div className="flex justify-center">
    <svg viewBox="0 0 380 205" className="block w-full max-w-[360px]" role="img" aria-label="مثلث أطوال أضلاعه x و 8 و 2x + 1" direction="ltr">
      <polygon points="92,32 56,158 320,158" fill="#fff7ed" stroke="#dc2626" strokeWidth={2.4} strokeLinejoin="round" />
      <DiagramMath tex="x" x={32} y={80} width={34} height={30} fontSize={18} color="#1e293b" />
      <DiagramMath tex="8" x={202} y={62} width={34} height={30} fontSize={18} color="#1e293b" />
      <DiagramMath tex="2x + 1" x={148} y={164} width={88} height={32} fontSize={18} color="#1e293b" />
    </svg>
  </div>;
}

export default function AlgebraBookFigure({ figure }: { figure: AlgebraFigureKind }) {
  switch (figure) {
    case "envelopesModels":
      return <FigureFrame
        kind={figure}
        title="نماذج المغلّفات والنقود"
        detail="كل مغلّف يحتوي كمية متساوية من النقود رمزها \(x\)، وكل قطعة نقدية تمثّل وحدة واحدة."
      >
        <EnvelopesModelsFigure />
      </FigureFrame>;
    case "expressionAnatomy":
      return <FigureFrame
        kind={figure}
        title="مكوّنات العبارة الجبرية"
        detail="كل عبارة من الشكل \(ax + b\) تتكوّن من حدّين جبريين: حدّ متغيّر معامله \(a\)، وحدّ ثابت \(b\)."
      >
        <ExpressionAnatomyFigure />
      </FigureFrame>;
    case "envelopesAddition":
      return <FigureFrame
        kind={figure}
        title="جمع عبارتين جبريتين بالنموذج"
        detail="نجمع المغلّفات مع المغلّفات (الحدود المتشابهة) ونجمع النقود مع النقود (الحدود الثابتة): \((2x + 3) + (3x + 1) = 5x + 4\)."
      >
        <EnvelopesAdditionFigure />
      </FigureFrame>;
    case "trianglePerimeter":
      return <FigureFrame
        kind={figure}
        title="محيط المثلث بدلالة المتغيّر"
        detail="محيط المثلث يساوي مجموع أطوال أضلاعه الثلاثة: \(x\) و\(8\) و\(2x + 1\)."
      >
        <TrianglePerimeterFigure />
      </FigureFrame>;
  }
}
