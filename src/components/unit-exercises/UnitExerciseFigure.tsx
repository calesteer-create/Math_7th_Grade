"use client";

import { GridPlane } from "@/components/figures/CoordinatePlaneFigures";
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
  return null;
}
