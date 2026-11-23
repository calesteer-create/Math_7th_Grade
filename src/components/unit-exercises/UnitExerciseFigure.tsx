"use client";

import { GridPlane } from "@/components/figures/CoordinatePlaneFigures";
import DiagramMath from "@/components/DiagramMath";
import { SQUARE_CONSTRUCTION } from "@/lib/coordinate-plane";

const WIDTH = 760;
const START = 40;
const SPAN = 680;

function lineX(value: number, min: number, max: number) {
  return START + ((value - min) / (max - min)) * SPAN;
}

/** أشكال تمرينات الوحدة: مستقيم أعداد للتمارين 1 و2، وشبكة لتمرين المربع. */
export default function UnitExerciseFigure({ figure }: { figure: string }) {
  if (figure === "line-0-12" || figure === "line-marked") {
    const marked = figure === "line-marked";
    const points = [
      { label: "K", value: 2 }, { label: "M", value: 4 }, { label: "N", value: 5 }, { label: "J", value: 8 }, { label: "L", value: 10 },
    ];
    return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3" data-unit-figure={figure}>
      <svg viewBox="0 0 760 150" className="block w-full min-w-[560px]" role="img" aria-label={marked ? "مستقيم أعداد من 0 إلى 12 عليه نقاط مسماة" : "مستقيم أعداد من 0 إلى 12"} direction="ltr" data-unit-line="true">
        <line x1={START - 20} y1={100} x2={720} y2={100} stroke="#334155" strokeWidth="2" />
        <path d="M 720 100 l -10 -5 l 0 10 z" fill="#334155" />
        {Array.from({ length: 13 }, (_, i) => i).map(tick => <g key={tick}>
          <line x1={lineX(tick, 0, 12)} x2={lineX(tick, 0, 12)} y1={tick === 0 ? 92 : 95} y2={tick === 0 ? 108 : 105} stroke={tick === 0 ? "#0f172a" : "#64748b"} strokeWidth="1.8" />
          <text x={lineX(tick, 0, 12)} y={124} textAnchor="middle" fontSize="14" fill="#475569">{tick}</text>
        </g>)}
        {marked && points.map(item => <g key={item.label} data-unit-line-point={item.label}>
          <circle cx={lineX(item.value, 0, 12)} cy={100} r="5.5" fill="#0f766e" stroke="#fff" strokeWidth="1.5" />
          <text x={lineX(item.value, 0, 12)} y={76} textAnchor="middle" fontSize="14" fontWeight="800" fill="#0f766e">{item.label}</text>
        </g>)}
      </svg>
      {!marked && <p className="mt-1 text-center text-[11px] font-bold text-slate-500">المستقيم من 0 إلى 12، والنقط A إلى E تُعين بحسب الأعداد المطلوبة في السؤال.</p>}
    </div>;
  }
  if (figure === "square-grid") {
    return <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-3" data-unit-figure={figure}>
      <GridPlane
        points={[
          { label: "A", point: SQUARE_CONSTRUCTION.a, color: "#b91c1c" },
          { label: "B", point: SQUARE_CONSTRUCTION.b, color: "#b91c1c" },
          { label: "C", point: SQUARE_CONSTRUCTION.c, color: "#b91c1c" },
        ]}
        size={340}
        domain={5}
        label="مثلث رؤوسه A(1,1) وB(4,1) وC(4,4)"
      />
    </div>;
  }
  if (figure === "u2-rect-perimeter") {
    return <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4" data-unit-figure={figure}>
      <svg viewBox="0 0 320 155" className="block w-full max-w-[300px]" role="img" aria-label="مستطيل طوله 2x وعرضه 3" direction="ltr">
        <rect x={46} y={24} width={200} height={82} rx={3} fill="#fff7ed" stroke="#dc2626" strokeWidth={2.2} />
        <DiagramMath tex="3" x={256} y={48} width={34} height={32} fontSize={18} color="#1e293b" />
        <DiagramMath tex="2x" x={122} y={114} width={52} height={32} fontSize={18} color="#1e293b" />
      </svg>
    </div>;
  }
  if (figure === "u2-cycle-diagram") {
    return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4" data-unit-figure={figure}>
      <svg viewBox="0 0 700 355" className="block w-full min-w-[560px]" role="img" aria-label="مخطط دائري للعمليات يبدأ من +180 وينتقل باتجاه عقارب الساعة عبر 5 خطوات ليعود إلى +180" direction="ltr">
        <defs>
          <marker id="u2-cyc-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <path d="M0,0 L9,4.5 L0,9 z" fill="#65a30d" />
          </marker>
        </defs>
        {/* المعين الأيسر: +180 */}
        <polygon points="86,92 146,132 86,172 26,132" fill="#facc15" stroke="#d97706" strokeWidth={2} />
        <DiagramMath tex="+180" x={46} y={116} width={80} height={32} fontSize={17} color="#1e293b" />

        {/* سهم إلى ÷ (1) */}
        <path d="M 118 96 Q 148 64 178 64" fill="none" stroke="#65a30d" strokeWidth={3} markerEnd="url(#u2-cyc-arrow)" />
        <ellipse cx={232} cy={64} rx={52} ry={26} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.8} />
        <DiagramMath tex="\div\ (1)" x={192} y={48} width={80} height={32} fontSize={16} color="#0f172a" />

        {/* سهم إلى = -60 */}
        <path d="M 286 60 L 320 56" fill="none" stroke="#65a30d" strokeWidth={3} markerEnd="url(#u2-cyc-arrow)" />
        <ellipse cx={378} cy={54} rx={56} ry={26} fill="#facc15" stroke="#d97706" strokeWidth={1.8} />
        <DiagramMath tex="= -60" x={334} y={38} width={88} height={32} fontSize={17} color="#1e293b" />

        {/* سهم إلى × (2) */}
        <path d="M 436 58 L 474 70" fill="none" stroke="#65a30d" strokeWidth={3} markerEnd="url(#u2-cyc-arrow)" />
        <ellipse cx={528} cy={84} rx={52} ry={26} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.8} />
        <DiagramMath tex="\times\ (2)" x={488} y={68} width={80} height={32} fontSize={16} color="#0f172a" />

        {/* سهم إلى = -300 */}
        <path d="M 580 96 Q 612 110 618 134" fill="none" stroke="#65a30d" strokeWidth={3} markerEnd="url(#u2-cyc-arrow)" />
        <polygon points="618,140 682,180 618,220 554,180" fill="#facc15" stroke="#d97706" strokeWidth={2} />
        <DiagramMath tex="= -300" x={570} y={164} width={96} height={32} fontSize={16} color="#1e293b" />

        {/* سهم إلى ÷ (3) */}
        <path d="M 596 222 Q 576 250 548 258" fill="none" stroke="#65a30d" strokeWidth={3} markerEnd="url(#u2-cyc-arrow)" />
        <ellipse cx={492} cy={264} rx={54} ry={26} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.8} />
        <DiagramMath tex="\div\ (3)" x={452} y={248} width={80} height={32} fontSize={16} color="#0f172a" />

        {/* سهم إلى = 10 */}
        <path d="M 436 272 L 404 278" fill="none" stroke="#65a30d" strokeWidth={3} markerEnd="url(#u2-cyc-arrow)" />
        <ellipse cx={354} cy={284} rx={48} ry={24} fill="#facc15" stroke="#d97706" strokeWidth={1.8} />
        <DiagramMath tex="= 10" x={318} y={268} width={72} height={32} fontSize={17} color="#1e293b" />

        {/* سهم إلى × (4) */}
        <path d="M 304 284 L 274 284" fill="none" stroke="#65a30d" strokeWidth={3} markerEnd="url(#u2-cyc-arrow)" />
        <ellipse cx={226} cy={284} rx={44} ry={24} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.8} />
        <DiagramMath tex="\times\ (4)" x={188} y={268} width={76} height={32} fontSize={15} color="#0f172a" />

        {/* سهم إلى = +80 */}
        <path d="M 180 280 L 154 272" fill="none" stroke="#65a30d" strokeWidth={3} markerEnd="url(#u2-cyc-arrow)" />
        <ellipse cx={106} cy={262} rx={48} ry={24} fill="#facc15" stroke="#d97706" strokeWidth={1.8} />
        <DiagramMath tex="= +80" x={68} y={246} width={76} height={32} fontSize={16} color="#1e293b" />

        {/* سهم إلى + (5) ثم عودة إلى +180 */}
        <path d="M 88 236 L 86 226" fill="none" stroke="#65a30d" strokeWidth={3} markerEnd="url(#u2-cyc-arrow)" />
        <ellipse cx={86} cy={204} rx={50} ry={20} fill="#38bdf8" stroke="#0284c7" strokeWidth={1.8} />
        <DiagramMath tex="+\ (5)" x={52} y={188} width={68} height={30} fontSize={15} color="#0f172a" />
        <path d="M 86 184 L 86 176" fill="none" stroke="#65a30d" strokeWidth={2.6} markerEnd="url(#u2-cyc-arrow)" />
      </svg>
      <p className="mt-1 text-center text-[11px] font-bold text-slate-500">تتبّع الأسهم باتجاه عقارب الساعة بدءًا من +180: الخطوة (1) القسمة، ثم (2) الضرب، ثم (3) القسمة، ثم (4) الضرب، ثم (5) الجمع للعودة إلى +180.</p>
    </div>;
  }
  if (figure === "u2-cuboid-tank") {
    return <div className="flex justify-center rounded-2xl border border-slate-200 bg-white p-4" data-unit-figure={figure}>
      <svg viewBox="0 0 360 190" className="block w-full max-w-[340px]" role="img" aria-label="خزان ماء على شكل متوازي مستطيلات حجمه 200 ديسيمتر مكعب ومساحة قاعدته 40 ديسيمتر مربع وارتفاعه h" direction="ltr">
        {/* الواجهة الخلفية والجانبية */}
        <polygon points="88,42 248,42 288,18 128,18" fill="#e0f2fe" stroke="#0284c7" strokeWidth={1.8} />
        <polygon points="248,42 288,18 288,126 248,150" fill="#bae6fd" stroke="#0284c7" strokeWidth={1.8} />
        {/* الواجهة الأمامية */}
        <rect x={88} y={42} width={160} height={108} fill="#f0f9ff" stroke="#0284c7" strokeWidth={2} />
        {/* القاعدة المظللة */}
        <polygon points="88,150 248,150 288,126 128,126" fill="#7dd3fc" fillOpacity={0.45} stroke="#0369a1" strokeWidth={1.6} strokeDasharray="4 3" />
        {/* تسميات */}
        <DiagramMath tex="V = 200\ \text{dm}^3" x={102} y={76} width={132} height={34} fontSize={16} color="#0c4a6e" />
        <DiagramMath tex="S_b = 40\ \text{dm}^2" x={102} y={154} width={136} height={32} fontSize={15} color="#0369a1" />
        <DiagramMath tex="h = ?" x={294} y={64} width={58} height={32} fontSize={16} color="#be123c" />
      </svg>
    </div>;
  }
  return null;
}
