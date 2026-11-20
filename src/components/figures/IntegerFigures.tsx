"use client";

import { useEffect, useId, useRef, useState } from "react";
import { BookOpen, Maximize2, X } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import DiagramMath from "@/components/DiagramMath";
import {
  BOOK_SHORT_EXAMPLES,
  GAME_PATHS,
  INT_LINE,
  INT_WARMUP_ROWS,
  INTEGER_FIGURE_SOURCES,
  intLineX,
  type IntegerFigureKind,
} from "@/lib/integers";

/** مستقيم أعداد صحيح قابل لإعادة الاستخدام في الرسوم المرجعية والمختبر والتمارين. */
export function IntegerLineSVG({
  min = -6,
  max = 6,
  startPoint,
  endPoint,
  highlightOpposite,
  markerPoint,
  ariaTitle,
  ariaDesc,
  compact = false,
}: {
  min?: number;
  max?: number;
  startPoint?: number;
  endPoint?: number;
  highlightOpposite?: number;
  markerPoint?: { label: string; value: number };
  ariaTitle: string;
  ariaDesc: string;
  compact?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const count = max - min;
  const width = 840;
  const height = compact ? 132 : 162;
  const start = 56;
  const spacing = (width - start * 2 - 20) / count;
  const y = compact ? 84 : 106;
  const xOf = (n: number) => start + (n - min) * spacing;
  const ticks = Array.from({ length: count + 1 }, (_, i) => min + i);
  const inRange = (n: number | undefined) => n !== undefined && Number.isFinite(n) && n >= min && n <= max;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="block w-full min-w-[540px]"
      role="img"
      aria-labelledby={`${uid}-title ${uid}-desc`}
      direction="ltr"
      data-integer-line="true"
    >
      <title id={`${uid}-title`}>{ariaTitle}</title>
      <desc id={`${uid}-desc`}>{ariaDesc}</desc>
      <defs>
        <marker id={`${uid}-axis`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 8 4.5 L 0 9 L 2 4.5 Z" fill="#34416a" />
        </marker>
        <marker id={`${uid}-arc1`} markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 7.5 4 L 0 8 Z" fill="#475569" />
        </marker>
        <marker id={`${uid}-arc2`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 8 4.5 L 0 9 Z" fill="#dc2626" />
        </marker>
        <marker id={`${uid}-opp`} markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 7.5 4 L 0 8 Z" fill="#c2410c" />
        </marker>
      </defs>

      {/* المحور الرئيسي */}
      <line x1="20" y1={y} x2={width - 20} y2={y} stroke="#34416a" strokeWidth="1.9" markerEnd={`url(#${uid}-axis)`} />

      {/* التدريجات والأعداد */}
      {ticks.map(n => {
        const x = xOf(n);
        const isZero = n === 0;
        const isOpp = highlightOpposite !== undefined && Math.abs(n) === Math.abs(highlightOpposite) && highlightOpposite !== 0;
        const isEnd = endPoint === n;
        const isStart = startPoint === n;
        const color = isEnd ? "#dc2626" : isOpp ? "#c2410c" : isStart ? "#a16207" : isZero ? "#1e293b" : "#52607a";
        return (
          <g key={n} data-tick={n}>
            <line
              x1={x}
              x2={x}
              y1={y - (isZero ? 10 : 7)}
              y2={y + (isZero ? 10 : 7)}
              stroke={isZero ? "#1e293b" : "#64748b"}
              strokeWidth={isZero ? 2.4 : 1.5}
            />
            <DiagramMath
              tex={String(n)}
              x={x - 22}
              y={y + 12}
              width={44}
              height={32}
              fontSize={count > 16 ? 14 : 18}
              color={color}
            />
          </g>
        );
      })}

      {/* قوسا المتعاكسين من الصفر */}
      {highlightOpposite !== undefined && highlightOpposite !== 0 && inRange(highlightOpposite) && inRange(-highlightOpposite) && (
        <>
          <path
            d={`M ${xOf(0) - 4} ${y - 16} Q ${(xOf(0) + xOf(-Math.abs(highlightOpposite))) / 2} ${y - 68} ${xOf(-Math.abs(highlightOpposite)) + 4} ${y - 16}`}
            fill="none"
            stroke="#c2410c"
            strokeWidth="1.9"
            markerEnd={`url(#${uid}-opp)`}
          />
          <path
            d={`M ${xOf(0) + 4} ${y - 16} Q ${(xOf(0) + xOf(Math.abs(highlightOpposite))) / 2} ${y - 68} ${xOf(Math.abs(highlightOpposite)) - 4} ${y - 16}`}
            fill="none"
            stroke="#c2410c"
            strokeWidth="1.9"
            markerEnd={`url(#${uid}-opp)`}
          />
          <circle cx={xOf(-Math.abs(highlightOpposite))} cy={y} r="6" fill="#ea580c" stroke="white" strokeWidth="2" />
          <circle cx={xOf(Math.abs(highlightOpposite))} cy={y} r="6" fill="#ea580c" stroke="white" strokeWidth="2" />
        </>
      )}

      {/* قوس الانطلاق من الصفر إلى العدد الأول */}
      {inRange(startPoint) && startPoint !== 0 && (
        <path
          d={`M ${xOf(0)} ${y - 14} Q ${(xOf(0) + xOf(startPoint!)) / 2} ${y - 54} ${xOf(startPoint!) + (startPoint! < 0 ? 5 : -5)} ${y - 14}`}
          fill="none"
          stroke="#475569"
          strokeWidth="1.7"
          markerEnd={`url(#${uid}-arc1)`}
        />
      )}

      {/* قوس الانتقال من العدد الأول إلى الناتج */}
      {inRange(startPoint) && inRange(endPoint) && startPoint !== endPoint && (
        <path
          d={`M ${xOf(startPoint!)} ${y - 16} Q ${(xOf(startPoint!) + xOf(endPoint!)) / 2} ${Math.max(12, y - 82)} ${xOf(endPoint!) + (endPoint! > startPoint! ? -6 : 6)} ${y - 16}`}
          fill="none"
          stroke="#dc2626"
          strokeWidth="2.1"
          markerEnd={`url(#${uid}-arc2)`}
        />
      )}

      {/* نقطة البداية (صفراء) ونقطة النهاية (حمراء) كما في الكتاب */}
      {inRange(startPoint) && (
        <circle data-point="start" cx={xOf(startPoint!)} cy={y} r="6.5" fill="#eab308" stroke="#854d0e" strokeWidth="1.6" />
      )}
      {inRange(endPoint) && (
        <>
          <circle cx={xOf(endPoint!)} cy={y} r="14" fill="#ef4444" fillOpacity="0.12" />
          <circle data-point="end" cx={xOf(endPoint!)} cy={y} r="6.5" fill="#dc2626" stroke="white" strokeWidth="2" />
        </>
      )}

      {/* نقطة مسماة مثل M أو G */}
      {markerPoint && inRange(markerPoint.value) && (
        <>
          <circle cx={xOf(markerPoint.value)} cy={y} r="13" fill="#7c3aed" fillOpacity="0.12" />
          <circle data-point={markerPoint.label} cx={xOf(markerPoint.value)} cy={y} r="6" fill="#7c3aed" stroke="white" strokeWidth="2" />
          <DiagramMath tex={markerPoint.label} x={xOf(markerPoint.value) - 18} y={y - 46} width={36} height={32} fontSize={20} color="#5b21b6" />
        </>
      )}
    </svg>
  );
}

/** رسم ص 5: مخطط فن N ⊂ Z + مستقيم الأعداد من -6 إلى 6. */
export function SetsAndLineDiagram() {
  const id = useId();
  return (
    <div className="space-y-5">
      <div className="grid items-center gap-4 md:grid-cols-[230px_minmax(0,1fr)]">
        <svg viewBox="0 0 230 140" className="mx-auto w-full max-w-[230px]" role="img" aria-labelledby={`${id}-venn`} direction="ltr">
          <title id={`${id}-venn`}>مجموعة الأعداد الطبيعية N محتواة داخل مجموعة الأعداد الصحيحة Z</title>
          <ellipse cx="115" cy="76" rx="98" ry="52" fill="#e2e8f0" stroke="#334155" strokeWidth="1.8" />
          <ellipse cx="122" cy="84" rx="64" ry="33" fill="#f8fafc" stroke="#475569" strokeWidth="1.6" />
          <DiagramMath tex="\mathbb{Z}" x={34} y={10} width={36} height={30} fontSize={22} color="#1e293b" />
          <DiagramMath tex="\mathbb{N}" x={102} y={66} width={40} height={34} fontSize={22} color="#334155" />
        </svg>
        <div className="space-y-2 text-sm leading-7 text-slate-700" dir="rtl">
          <p><TeX tex="\mathbb{N}" /> مجموعة الأعداد الطّبيعيّة: <TeX tex="\{0,1,2,3,\ldots\}" />.</p>
          <p><TeX tex="\mathbb{Z}" /> مجموعة الأعداد الصّحيحة: <TeX tex="\{\ldots,-3,-2,-1,0,1,2,3,\ldots\}" />.</p>
          <p className="text-xs font-semibold text-violet-700">كل عدد طبيعي هو عدد صحيح، وتضيف <TeX tex="\mathbb{Z}" /> الأعداد السالبة إلى يسار الصفر.</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2">
        <IntegerLineSVG
          min={INT_LINE.min}
          max={INT_LINE.max}
          compact
          ariaTitle="مستقيم الأعداد الصحيحة من -6 إلى 6"
          ariaDesc="مستقيم مدرّج بتدريجات متساوية من -6 يسارًا حتى 6 يمينًا، ويتوسطه الصفر."
        />
      </div>
    </div>
  );
}

/** مصغّر مستقيم انطلاقة نشطة (O عند 0، 1 إلى يمينه، والنقطة M عند -2 أو G عند -3). */
export function MiniWarmupAxis({ pointLabel, pointValue }: { pointLabel: string; pointValue: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const xOf = (n: number) => 160 + n * 32;
  return (
    <svg viewBox="0 0 320 68" className="mx-auto mt-2 block w-full max-w-[300px]" role="img" aria-label={`مستقيم مدرّج عليه O عند 0 و1 و${pointLabel} عند ${pointValue}`} direction="ltr">
      <defs>
        <marker id={`${uid}-a`} markerWidth="8" markerHeight="8" refX="6.5" refY="4" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 0 0 L 7 4 L 0 8 L 1.8 4 Z" fill="#1e293b" />
        </marker>
      </defs>
      <line x1="16" y1="36" x2="306" y2="36" stroke="#1e293b" strokeWidth="1.6" markerEnd={`url(#${uid}-a)`} />
      {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(n => (
        <line key={n} x1={xOf(n)} x2={xOf(n)} y1={n === 0 ? 29 : 31} y2={n === 0 ? 43 : 41} stroke="#1e293b" strokeWidth={n === 0 ? 2.4 : 1.3} />
      ))}
      <DiagramMath tex="O" x={xOf(0) - 12} y={4} width={24} height={24} fontSize={15} color="#1e293b" />
      <DiagramMath tex="0" x={xOf(0) - 12} y={42} width={24} height={24} fontSize={14} color="#1e293b" />
      <DiagramMath tex="1" x={xOf(1) - 12} y={42} width={24} height={24} fontSize={14} color="#1e293b" />
      <circle cx={xOf(pointValue)} cy={36} r="4.5" fill="#7c3aed" stroke="white" strokeWidth="1.5" />
      <DiagramMath tex={pointLabel} x={xOf(pointValue) - 12} y={4} width={24} height={24} fontSize={15} color="#5b21b6" />
    </svg>
  );
}

/** جدول انطلاقة نشطة ص 5 مطابق لصفوف وخيارات الكتاب. */
export function IntegerWarmupDiagram() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-violet-200 bg-white">
      <table dir="ltr" className="w-full min-w-[580px] border-collapse text-center" aria-label="جدول انطلاقة نشطة للأعداد الصحيحة">
        <thead>
          <tr>
            {["A", "B", "C"].map(letter => (
              <th key={letter} scope="col" className="w-[15%] border-e border-violet-200 bg-violet-100/80 py-3 font-serif text-lg font-bold italic text-violet-900">
                <TeX tex={letter} />
              </th>
            ))}
            <th scope="col" className="bg-emerald-100/80 px-4 text-xs font-extrabold text-emerald-900" dir="rtl">
              في كل سطر إجابة واحدة صحيحة
            </th>
          </tr>
        </thead>
        <tbody>
          {INT_WARMUP_ROWS.map((row, idx) => (
            <tr key={row.id} className="border-t border-violet-200">
              {row.options.map(opt => (
                <td key={opt.key} className={`border-e border-violet-200 px-2 py-4 text-base font-bold text-[#263454] ${idx === 1 ? "bg-violet-50/70" : "bg-amber-50/60"}`}>
                  {opt.tex ? <TeX tex={opt.tex} /> : <span dir="rtl">{opt.label}</span>}
                </td>
              ))}
              <th scope="row" className="bg-emerald-50/80 px-4 py-3 text-right text-sm font-bold leading-7 text-emerald-950" dir="rtl">
                <div><MathText text={row.prompt} /></div>
                {"pointLabel" in row && <MiniWarmupAxis pointLabel={row.pointLabel} pointValue={row.pointValue} />}
              </th>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** مخطط لعبة الحاسوب ص 6 بثلاث مراحل وأربعة مسارات. */
export function GamePathsDiagram({ highlightPath }: { highlightPath?: 1 | 2 | 3 | 4 | null }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const active = highlightPath ? GAME_PATHS.find(p => p.id === highlightPath) : null;
  const activeKey = active ? `p${active.id}` : "";
  const edgeTone = (match: boolean) => (match ? "#7c3aed" : "#475569");
  const edgeWidth = (match: boolean) => (match ? 3 : 1.7);

  return (
    <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_210px]">
      <div className="overflow-x-auto">
        <svg viewBox="0 0 540 280" className="mx-auto block w-full min-w-[460px]" role="img" aria-label="مخطط مراحل لعبة الحاسوب الثلاث" direction="ltr">
          <defs>
            <marker id={`${uid}-arr`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0 0 L 7.5 4 L 0 8 Z" fill="#475569" />
            </marker>
            <marker id={`${uid}-arr-hi`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0 0 L 8 4.5 L 0 9 Z" fill="#7c3aed" />
            </marker>
          </defs>

          {/* الأعمدة الثلاثة: المرحلة (1)، (2)، (3) */}
          {[
            { x: 18, label: "المرحلة (1)" },
            { x: 196, label: "المرحلة (2)" },
            { x: 374, label: "المرحلة (3)" },
          ].map(col => (
            <g key={col.label}>
              <rect x={col.x} y="16" width="144" height="248" rx="14" fill="#fdf2f8" stroke="#f5d0fe" strokeWidth="1.2" />
              <rect x={col.x} y="16" width="144" height="38" rx="12" fill="#3b5998" />
              <text x={col.x + 72} y="40" textAnchor="middle" fill="white" fontSize="13" fontWeight="700" direction="rtl">{col.label}</text>
            </g>
          ))}

          {/* الأسهم بين المرحلة 1 و2 */}
          <path
            d="M 118 152 C 160 152, 165 112, 232 112"
            fill="none"
            stroke={edgeTone(active?.stage2Slot === "top")}
            strokeWidth={edgeWidth(active?.stage2Slot === "top")}
            markerEnd={`url(#${uid}-${active?.stage2Slot === "top" ? "arr-hi" : "arr"})`}
          />
          <path
            d="M 118 152 C 160 152, 165 196, 232 196"
            fill="none"
            stroke={edgeTone(active?.stage2Slot === "bottom")}
            strokeWidth={edgeWidth(active?.stage2Slot === "bottom")}
            markerEnd={`url(#${uid}-${active?.stage2Slot === "bottom" ? "arr-hi" : "arr"})`}
          />

          {/* الأسهم بين المرحلة 2 و3 */}
          <path
            d="M 304 112 C 344 112, 354 84, 410 84"
            fill="none"
            stroke={edgeTone(activeKey === "p1")}
            strokeWidth={edgeWidth(activeKey === "p1")}
            markerEnd={`url(#${uid}-${activeKey === "p1" ? "arr-hi" : "arr"})`}
          />
          <path
            d="M 304 112 C 344 112, 354 156, 410 156"
            fill="none"
            stroke={edgeTone(activeKey === "p2")}
            strokeWidth={edgeWidth(activeKey === "p2")}
            markerEnd={`url(#${uid}-${activeKey === "p2" ? "arr-hi" : "arr"})`}
          />
          <path
            d="M 304 196 C 344 196, 354 156, 410 156"
            fill="none"
            stroke={edgeTone(activeKey === "p3")}
            strokeWidth={edgeWidth(activeKey === "p3")}
            markerEnd={`url(#${uid}-${activeKey === "p3" ? "arr-hi" : "arr"})`}
          />
          <path
            d="M 304 196 C 344 196, 354 228, 410 228"
            fill="none"
            stroke={edgeTone(activeKey === "p4")}
            strokeWidth={edgeWidth(activeKey === "p4")}
            markerEnd={`url(#${uid}-${activeKey === "p4" ? "arr-hi" : "arr"})`}
          />

          {/* عقدة المرحلة (1): +2 */}
          <g>
            <rect x="62" y="132" width="56" height="40" rx="8" fill="#fef3c7" stroke={active ? "#7c3aed" : "#d97706"} strokeWidth={active ? 2.4 : 1.6} />
            <DiagramMath tex="+2" x={66} y={136} width={48} height={32} fontSize={18} color="#92400e" />
          </g>

          {/* عقد المرحلة (2): -6 و -4 */}
          <g>
            <rect x="240" y="92" width="64" height="40" rx="8" fill="#fde047" stroke={active?.stage2Slot === "top" ? "#7c3aed" : "#ca8a04"} strokeWidth={active?.stage2Slot === "top" ? 2.4 : 1.6} />
            <DiagramMath tex="-6" x={246} y={96} width={52} height={32} fontSize={18} color="#713f12" />
          </g>
          <g>
            <rect x="240" y="176" width="64" height="40" rx="8" fill="#fde047" stroke={active?.stage2Slot === "bottom" ? "#7c3aed" : "#ca8a04"} strokeWidth={active?.stage2Slot === "bottom" ? 2.4 : 1.6} />
            <DiagramMath tex="-4" x={246} y={180} width={52} height={32} fontSize={18} color="#713f12" />
          </g>

          {/* عقد المرحلة (3): +2 ، +5 ، +2 */}
          {[
            { y: 64, tex: "+2", on: activeKey === "p1" },
            { y: 136, tex: "+5", on: activeKey === "p2" || activeKey === "p3" },
            { y: 208, tex: "+2", on: activeKey === "p4" },
          ].map((node, i) => (
            <g key={i}>
              <rect x="418" y={node.y} width="64" height="40" rx="8" fill="#f0abfc" stroke={node.on ? "#7c3aed" : "#a21caf"} strokeWidth={node.on ? 2.4 : 1.6} />
              <DiagramMath tex={node.tex} x={424} y={node.y + 4} width={52} height={32} fontSize={18} color="#581c87" />
            </g>
          ))}
        </svg>
      </div>

      <table className="w-full border-collapse overflow-hidden rounded-xl border border-slate-200 text-center text-xs" dir="rtl" aria-label="جدول مسارات لعبة الحاسوب">
        <thead>
          <tr className="bg-[#3b5998] text-white">
            <th className="border-e border-white/20 px-3 py-2 font-extrabold">المسار</th>
            <th className="px-3 py-2 font-extrabold">الخطوات</th>
          </tr>
        </thead>
        <tbody>
          {GAME_PATHS.map(path => (
            <tr key={path.id} className={`border-t border-slate-200 ${highlightPath === path.id ? "bg-violet-50 font-bold text-violet-900" : "bg-white text-slate-600"}`}>
              <td className="border-e border-slate-200 px-3 py-2 font-black" dir="ltr">{path.id}</td>
              <td className="px-2 py-2" dir="ltr">
                <TeX tex={`(+2),(${path.stage2}),(+${path.stage3})`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** رسم ص 6: المتعاكسان +3 و -3. */
export function OppositesDiagram() {
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <IntegerLineSVG
          min={-6}
          max={6}
          highlightOpposite={3}
          ariaTitle="العددان المتعاكسان -3 و+3 على مستقيم الأعداد"
          ariaDesc="مستقيم مدرّج من -6 إلى 6، وقوسان متناظران من الصفر إلى -3 يسارًا وإلى +3 يمينًا."
        />
      </div>
      <p className="text-center text-xs font-bold text-orange-800">
        في الشكل <TeX tex="+3" /> و<TeX tex="-3" /> متعاكسان، ومجموعهما <TeX tex="(+3)+(-3)=0" />.
      </p>
    </div>
  );
}

/** رسم ص 7: تمثيل جمع عددين على مستقيم الأعداد. */
export function AdditionLinesDiagram() {
  return (
    <div className="space-y-5">
      <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_185px]">
        <div className="overflow-x-auto">
          <IntegerLineSVG
            min={-6}
            max={6}
            startPoint={-5}
            endPoint={-2}
            ariaTitle="تمثيل (-5) + (+3) = -2 على مستقيم الأعداد"
            ariaDesc="ننطلق من الصفر إلى -5 ثم ننتقل 3 وحدات إلى اليمين فنصل إلى -2."
          />
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-3 text-center">
          <TeX tex="(-5)+(+3)=-2" block />
          <p className="mt-1 text-[11px] font-bold text-emerald-800">جمع موجب ← ننتقل يمينًا</p>
        </div>
      </div>

      <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_185px]">
        <div className="overflow-x-auto">
          <IntegerLineSVG
            min={-6}
            max={6}
            startPoint={-2}
            endPoint={-5}
            ariaTitle="تمثيل (-2) + (-3) = -5 على مستقيم الأعداد"
            ariaDesc="ننطلق من الصفر إلى -2 ثم ننتقل 3 وحدات إلى اليسار فنصل إلى -5."
          />
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-3 text-center">
          <TeX tex="(-2)+(-3)=-5" block />
          <p className="mt-1 text-[11px] font-bold text-amber-900">جمع سالب ← ننتقل يسارًا</p>
        </div>
      </div>
    </div>
  );
}

/** رسم ص 8: تمثيل طرح عددين على مستقيم الأعداد. */
export function SubtractionLinesDiagram() {
  return (
    <div className="space-y-5">
      <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_185px]">
        <div className="overflow-x-auto">
          <IntegerLineSVG
            min={-6}
            max={6}
            startPoint={-4}
            endPoint={-6}
            ariaTitle="تمثيل (-4) - (+2) = -6 على مستقيم الأعداد"
            ariaDesc="ننطلق من الصفر إلى -4 ثم ننتقل وحدتين إلى اليسار لطرح عدد موجب فنصل إلى -6."
          />
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-3 text-center">
          <TeX tex="(-4)-(+2)=-6" block />
          <p className="mt-1 text-[11px] font-bold text-rose-800">طرح موجب ← ننتقل يسارًا</p>
        </div>
      </div>

      <div className="grid items-center gap-3 md:grid-cols-[minmax(0,1fr)_185px]">
        <div className="overflow-x-auto">
          <IntegerLineSVG
            min={-6}
            max={6}
            startPoint={-2}
            endPoint={5}
            ariaTitle="تمثيل (-2) - (-7) = +5 على مستقيم الأعداد"
            ariaDesc="ننطلق من الصفر إلى -2 ثم ننتقل 7 وحدات إلى اليمين لطرح عدد سالب فنصل إلى +5."
          />
        </div>
        <div className="rounded-xl border border-teal-200 bg-teal-50/70 px-3 py-3 text-center">
          <TeX tex="(-2)-(-7)=+5" block />
          <p className="mt-1 text-[11px] font-bold text-teal-800">طرح سالب ← ننتقل يمينًا</p>
        </div>
      </div>
    </div>
  );
}

/** رسم ص 7: مثالا القاعدة وجدول الكتابة المختزلة. */
export function ShortNotationDiagram() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-center">
          <TeX tex="(+8)+(-11)=-3" block className="text-lg" />
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-bold">
            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-800"><TeX tex="11-8=3" /></span>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-800">إشارة <TeX tex="-11" /> لأن <TeX tex="11>8" /></span>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-center">
          <TeX tex="(-13)+(-5)=-18" block className="text-lg" />
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-bold">
            <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-800"><TeX tex="13+5=18" /></span>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-violet-800">الإشارة المشتركة بين <TeX tex="-13" /> و<TeX tex="-5" /></span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-white">
        <table className="w-full min-w-[420px] border-collapse text-center" dir="rtl" aria-label="جدول الكتابة المختزلة لعملية الجمع">
          <thead>
            <tr className="bg-amber-100/80 text-sm font-extrabold text-amber-950">
              <th scope="col" className="border-e border-amber-200 py-3">العملية</th>
              <th scope="col" className="border-e border-amber-200 py-3">الكتابة المختزلة</th>
              <th scope="col" className="py-3">الناتج</th>
            </tr>
          </thead>
          <tbody>
            {BOOK_SHORT_EXAMPLES.map(row => (
              <tr key={row.full} className="border-t border-amber-200/80 text-base">
                <td className="border-e border-amber-200/80 py-3"><TeX tex={row.full} /></td>
                <td className="border-e border-amber-200/80 py-3 font-bold text-violet-800"><TeX tex={row.short} /></td>
                <td className="py-3 font-bold text-emerald-800"><TeX tex={row.result} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function IntegerFigureArt({ kind }: { kind: IntegerFigureKind }) {
  switch (kind) {
    case "intSetsLine": return <SetsAndLineDiagram />;
    case "intWarmup": return <IntegerWarmupDiagram />;
    case "intGamePaths": return <GamePathsDiagram />;
    case "intOpposites": return <OppositesDiagram />;
    case "intAddLine": return <AdditionLinesDiagram />;
    case "intSubLine": return <SubtractionLinesDiagram />;
    case "intShortTable": return <ShortNotationDiagram />;
  }
}

function IntegerFigureZoom({ kind, onClose }: { kind: IntegerFigureKind; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const source = INTEGER_FIGURE_SOURCES[kind];
  useEffect(() => { ref.current?.showModal(); }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={event => { event.preventDefault(); ref.current?.close(); }}
      onClick={event => { if (event.target === event.currentTarget) ref.current?.close(); }}
      className="no-print fixed inset-0 m-auto max-h-[90vh] w-[min(1100px,94vw)] max-w-none overflow-auto rounded-[24px] border-0 bg-white p-0 text-ink shadow-2xl backdrop:bg-[#0f193c]/65 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <span className="text-xs font-semibold text-indigo-500">تفاصيل أوضح · عرض مكبّر</span>
          <h3 id={titleId} className="mt-1 text-lg font-extrabold">{source.title}</h3>
        </div>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="إغلاق الرسم المكبّر"
          className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <X size={19} />
        </button>
      </div>
      <div className="overflow-x-auto bg-[#fafbfd] p-7"><IntegerFigureArt kind={kind} /></div>
      <p className="border-t border-slate-100 px-6 py-4 text-xs leading-6 text-slate-500"><MathText text={source.detail} /></p>
    </dialog>
  );
}

export default function IntegerBookFigure({ figure }: { figure: IntegerFigureKind }) {
  const [zoomed, setZoomed] = useState(false);
  const zoomButton = useRef<HTMLButtonElement>(null);
  const source = INTEGER_FIGURE_SOURCES[figure];
  const id = useId();
  return (
    <>
      <figure
        data-book-figure={figure}
        aria-labelledby={`${id}-caption`}
        className="my-1 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_35px_-25px_rgba(25,37,79,.30)] print:break-inside-avoid print:shadow-none"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen size={17} /></span>
            <div>
              <p className="text-[10px] font-extrabold text-indigo-500">تأمّل الشكل وافهم الفكرة</p>
              <h3 className="mt-0.5 text-sm font-extrabold text-[#243252]">{source.title}</h3>
            </div>
          </div>
          <button
            ref={zoomButton}
            type="button"
            onClick={() => setZoomed(true)}
            aria-label={`تكبير رسم ${source.title}`}
            className="no-print flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
          >
            <Maximize2 size={13} /> تكبير
          </button>
        </div>
        <div className="overflow-x-auto bg-[#fbfcff] px-4 py-6 md:px-6"><IntegerFigureArt kind={figure} /></div>
        <figcaption id={`${id}-caption`} className="flex flex-wrap items-start justify-between gap-2 border-t border-slate-100 px-5 py-3 text-[11px] leading-5 text-slate-500">
          <span className="max-w-xl"><MathText text={source.detail} /></span>
        </figcaption>
      </figure>
      {zoomed && <IntegerFigureZoom kind={figure} onClose={() => { setZoomed(false); zoomButton.current?.focus({ preventScroll: true }); }} />}
    </>
  );
}

// إعادة تصدير مساعدة للإحداثيات عند الحاجة في الاختبارات.
export { intLineX };
