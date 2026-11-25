"use client";

import DiagramMath from "@/components/DiagramMath";
import FigureFrame from "@/components/figures/FigureFrame";
import {
  lerp,
  svgPoints,
  svgRightAngleMark,
  svgTickMarks,
  toSvg,
  type Pt,
  type SvgViewport,
} from "@/lib/geometry-core";
import {
  CUT_PASTE_MODEL,
  SHADED_RATIO_MODELS,
  TRAIN_FOUR_MODELS,
  TWO_HEIGHTS_MODEL,
  UNIT_MISMATCH_MODEL,
  WORKED_EXAMPLE_MODEL,
  type AreaFigureKind,
} from "@/lib/parallelogram-area";

function DoubleTicks({ a, b, color = "#e11d48" }: { a: Pt; b: Pt; color?: string }) {
  return <>
    {svgTickMarks(a, b, 2, 0.5, 5, 3.2).map(([p1, p2], i) => (
      <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    ))}
  </>;
}

function CutPasteSvg() {
  const { A, B, C, D, H, E } = CUT_PASTE_MODEL;
  const panels = [
    { step: 1, title: "1) متوازي الأضلاع الأصلي", ox: 18 },
    { step: 2, title: "2) قصّ المثلث القائم ونقله", ox: 242 },
    { step: 3, title: "3) المستطيل المكافئ بالمساحة", ox: 466 },
  ] as const;

  return (
    <svg viewBox="0 0 690 198" className="mx-auto block w-full max-w-[690px]" role="img" aria-label="خطوات قص ولصق متوازي الأضلاع لتحويله إلى مستطيل له المساحة نفسها">
      {panels.map(panel => {
        const vp: SvgViewport = { originX: panel.ox + 18, originY: 162, scale: 26 };
        const pA = toSvg(A, vp);
        const pB = toSvg(B, vp);
        const pC = toSvg(C, vp);
        const pD = toSvg(D, vp);
        const pH = toSvg(H, vp);
        const pE = toSvg(E, vp);
        return (
          <g key={panel.step}>
            <rect x={panel.ox - 8} y={10} width={212} height={178} rx={15} fill="#ffffff" stroke="#e2e8f0" />
            <text x={panel.ox + 98} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={12} fontWeight={800}>{panel.title}</text>

            {panel.step === 1 && <>
              <polygon points={svgPoints([pA, pB, pC, pD])} fill="#93c5fd" fillOpacity={0.55} stroke="#1d4ed8" strokeWidth={2.2} strokeLinejoin="round" />
              <line x1={pA.x} y1={pA.y} x2={pH.x} y2={pH.y} stroke="#dc2626" strokeWidth={2} strokeDasharray="5 3" />
              <path d={svgRightAngleMark(pA, pH, pC, 9)} fill="none" stroke="#dc2626" strokeWidth={1.8} />
            </>}

            {panel.step === 2 && <>
              <polygon points={svgPoints([pA, pB, pC, pH])} fill="#93c5fd" fillOpacity={0.55} stroke="#1d4ed8" strokeWidth={2} />
              <polygon points={svgPoints([pA, pH, pD])} fill="#60a5fa" fillOpacity={0.85} stroke="#1e40af" strokeWidth={2} />
              <line x1={pA.x} y1={pA.y} x2={pH.x} y2={pH.y} stroke="#dc2626" strokeWidth={2} strokeDasharray="5 3" />
              <path d={svgRightAngleMark(pA, pH, pC, 9)} fill="none" stroke="#dc2626" strokeWidth={1.8} />
              <path d={`M ${pD.x + 20} ${pD.y - 36} Q ${(pD.x + pE.x) / 2} ${pD.y - 84} ${pE.x - 14} ${pE.y - 30}`} fill="none" stroke="#dc2626" strokeWidth={2.2} strokeDasharray="4 3" />
              <polygon points={`${pE.x - 12},${pE.y - 29} ${pE.x - 21},${pE.y - 35} ${pE.x - 17},${pE.y - 24}`} fill="#dc2626" />
            </>}

            {panel.step === 3 && <>
              <polygon points={svgPoints([pA, pB, pC, pH])} fill="#93c5fd" fillOpacity={0.55} stroke="#1d4ed8" strokeWidth={2} />
              <polygon points={svgPoints([pB, pE, pC])} fill="#3b82f6" fillOpacity={0.75} stroke="#1e40af" strokeWidth={2} />
              <path d={svgRightAngleMark(pA, pH, pE, 9)} fill="none" stroke="#dc2626" strokeWidth={1.8} />
              <path d={svgRightAngleMark(pB, pE, pH, 9)} fill="none" stroke="#dc2626" strokeWidth={1.8} />
            </>}

            <DiagramMath tex="h" x={pH.x + 4} y={(pA.y + pH.y) / 2 - 12} width={22} height={22} fontSize={14} color="#dc2626" />
            <DiagramMath tex="\mathcal{B}" x={(pH.x + pC.x) / 2 - 4} y={pC.y + 1} width={24} height={22} fontSize={14} color="#1e3a8a" />
          </g>
        );
      })}
    </svg>
  );
}

function UnitMismatchSvg() {
  const vp: SvgViewport = { originX: 72, originY: 165, scale: 82 };
  const { A, B, C, D, H } = UNIT_MISMATCH_MODEL;
  const pA = toSvg(A, vp);
  const pB = toSvg(B, vp);
  const pC = toSvg(C, vp);
  const pD = toSvg(D, vp);
  const pH = toSvg(H, vp);

  return (
    <svg viewBox="0 0 430 205" className="mx-auto block w-full max-w-[430px]" role="img" aria-label="متوازي أضلاع قاعدته 300 cm وارتفاعه 1 m لتوضيح ضرورة توحيد الواحدات">
      <polygon points={svgPoints([pC, pB, pA, pD])} fill="#ecfdf5" stroke="#0f766e" strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={pD.x} y1={pD.y} x2={pH.x} y2={pH.y} stroke="#dc2626" strokeWidth={2.2} strokeDasharray="5 3" />
      <path d={svgRightAngleMark(pD, pH, pB, 11)} fill="none" stroke="#dc2626" strokeWidth={2} />
      {[pA, pB, pC, pD, pH].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.8} fill="#0f766e" />)}
      <DiagramMath tex="C" x={pC.x - 22} y={pC.y - 4} width={22} height={22} fontSize={15} color="#0f766e" />
      <DiagramMath tex="B" x={pB.x + 8} y={pB.y - 4} width={22} height={22} fontSize={15} color="#0f766e" />
      <DiagramMath tex="A" x={pA.x + 8} y={pA.y - 18} width={22} height={22} fontSize={15} color="#0f766e" />
      <DiagramMath tex="D" x={pD.x - 22} y={pD.y - 20} width={22} height={22} fontSize={15} color="#0f766e" />
      <DiagramMath tex="H" x={pH.x - 10} y={pH.y + 6} width={22} height={22} fontSize={14} color="#dc2626" />
      <DiagramMath tex="1\text{ m}" x={pH.x + 6} y={(pD.y + pH.y) / 2 - 12} width={54} height={24} fontSize={15} color="#dc2626" />
      <DiagramMath tex="300\text{ cm}" x={(pC.x + pB.x) / 2 - 22} y={pB.y + 6} width={78} height={24} fontSize={15} color="#1e3a8a" />
    </svg>
  );
}

function TwoHeightsSvg() {
  const { A, B, C, D, E, F } = TWO_HEIGHTS_MODEL;
  const vp1: SvgViewport = { originX: 34, originY: 162, scale: 36 };
  const vp2: SvgViewport = { originX: 364, originY: 162, scale: 36 };

  const p1 = { A: toSvg(A, vp1), B: toSvg(B, vp1), C: toSvg(C, vp1), D: toSvg(D, vp1), E: toSvg(E, vp1) };
  const p2 = { A: toSvg(A, vp2), B: toSvg(B, vp2), C: toSvg(C, vp2), D: toSvg(D, vp2), F: toSvg(F, vp2) };

  return (
    <svg viewBox="0 0 680 212" className="mx-auto block w-full max-w-[680px]" role="img" aria-label="طريقتان لحساب مساحة متوازي الأضلاع باستخدام القاعدة BC وارتفاعها AE أو القاعدة DC وارتفاعها AF">
      {/* الشكل 1 */}
      <rect x={10} y={10} width={320} height={192} rx={16} fill="#ffffff" stroke="#e2e8f0" />
      <text x={170} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>الشكل 1: القاعدة [BC] والارتفاع [AE]</text>
      <polygon points={svgPoints([p1.A, p1.B, p1.C, p1.D])} fill="#eff6ff" stroke="#1d4ed8" strokeWidth={2.2} />
      <line x1={p1.B.x} y1={p1.B.y} x2={p1.C.x} y2={p1.C.y} stroke="#0f766e" strokeWidth={3.4} />
      <line x1={p1.A.x} y1={p1.A.y} x2={p1.E.x} y2={p1.E.y} stroke="#dc2626" strokeWidth={2.4} />
      <path d={svgRightAngleMark(p1.A, p1.E, p1.C, 10)} fill="none" stroke="#dc2626" strokeWidth={1.8} />
      <path d={svgRightAngleMark(p1.E, p1.A, p1.D, 10)} fill="none" stroke="#dc2626" strokeWidth={1.8} />
      <DiagramMath tex="A" x={p1.A.x - 16} y={p1.A.y - 24} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="D" x={p1.D.x + 4} y={p1.D.y - 20} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="B" x={p1.B.x - 20} y={p1.B.y - 4} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="C" x={p1.C.x + 6} y={p1.C.y - 4} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="E" x={p1.E.x - 10} y={p1.E.y + 4} width={22} height={22} fontSize={14} color="#dc2626" />
      <DiagramMath tex="h" x={p1.E.x + 6} y={(p1.A.y + p1.E.y) / 2 - 12} width={22} height={22} fontSize={15} color="#dc2626" />
      <DiagramMath tex="\mathcal{B}" x={(p1.E.x + p1.C.x) / 2 - 6} y={p1.C.y + 4} width={24} height={22} fontSize={15} color="#0f766e" />

      {/* الشكل 2 */}
      <rect x={346} y={10} width={324} height={192} rx={16} fill="#ffffff" stroke="#e2e8f0" />
      <text x={508} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>الشكل 2: القاعدة [DC] والارتفاع [AF]</text>
      <polygon points={svgPoints([p2.A, p2.B, p2.C, p2.D])} fill="#eff6ff" stroke="#1d4ed8" strokeWidth={2.2} />
      <line x1={p2.D.x} y1={p2.D.y} x2={p2.C.x} y2={p2.C.y} stroke="#0f766e" strokeWidth={3.4} />
      <line x1={p2.A.x} y1={p2.A.y} x2={p2.F.x} y2={p2.F.y} stroke="#dc2626" strokeWidth={2.4} />
      <path d={svgRightAngleMark(p2.A, p2.F, p2.D, 10)} fill="none" stroke="#dc2626" strokeWidth={1.8} />
      <DiagramMath tex="A" x={p2.A.x - 16} y={p2.A.y - 24} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="D" x={p2.D.x + 4} y={p2.D.y - 20} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="B" x={p2.B.x - 20} y={p2.B.y - 4} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="C" x={p2.C.x + 6} y={p2.C.y - 4} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="F" x={p2.F.x + 8} y={p2.F.y - 6} width={22} height={22} fontSize={14} color="#dc2626" />
      <DiagramMath tex="h'" x={(p2.A.x + p2.F.x) / 2 - 12} y={(p2.A.y + p2.F.y) / 2 + 2} width={26} height={22} fontSize={15} color="#dc2626" />
      <DiagramMath tex="\mathcal{B}'" x={p2.F.x + 12} y={p2.D.y + 18} width={28} height={22} fontSize={15} color="#0f766e" />
    </svg>
  );
}

function WorkedExampleSvg() {
  const vp: SvgViewport = { originX: 60, originY: 190, scale: 48 };
  const { A, B, C, D, H, G } = WORKED_EXAMPLE_MODEL;
  const pA = toSvg(A, vp);
  const pB = toSvg(B, vp);
  const pC = toSvg(C, vp);
  const pD = toSvg(D, vp);
  const pH = toSvg(H, vp);
  const pG = toSvg(G, vp);

  return (
    <svg viewBox="0 0 490 232" className="mx-auto block w-full max-w-[490px]" role="img" aria-label="المثال المحلول: BC = 5 cm و AH = 3 cm و AG = 3.75 cm لإيجاد CD = 4 cm">
      <polygon points={svgPoints([pA, pB, pC, pD])} fill="#fefce8" stroke="#1d4ed8" strokeWidth={2.4} strokeLinejoin="round" />
      <line x1={pA.x} y1={pA.y} x2={pH.x} y2={pH.y} stroke="#dc2626" strokeWidth={2.2} />
      <line x1={pA.x} y1={pA.y} x2={pG.x} y2={pG.y} stroke="#0f766e" strokeWidth={2.2} />
      <path d={svgRightAngleMark(pA, pH, pC, 10)} fill="none" stroke="#dc2626" strokeWidth={1.8} />
      <path d={svgRightAngleMark(pA, pG, pD, 10)} fill="none" stroke="#0f766e" strokeWidth={1.8} />

      {[pA, pB, pC, pD, pH, pG].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.8} fill="#1e3a8a" />)}
      <DiagramMath tex="A" x={pA.x - 16} y={pA.y - 26} width={22} height={24} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="D" x={pD.x + 6} y={pD.y - 20} width={22} height={24} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="B" x={pB.x - 22} y={pB.y - 4} width={22} height={24} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="C" x={pC.x + 6} y={pC.y - 2} width={22} height={24} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="H" x={pH.x - 10} y={pH.y + 4} width={22} height={24} fontSize={14} color="#dc2626" />
      <DiagramMath tex="G" x={pG.x + 8} y={pG.y - 10} width={22} height={24} fontSize={14} color="#0f766e" />

      <DiagramMath tex="3\text{ cm}" x={pH.x - 54} y={(pA.y + pH.y) / 2 - 10} width={54} height={24} fontSize={14} color="#dc2626" />
      <DiagramMath tex="3.75\text{ cm}" x={(pA.x + pG.x) / 2 - 12} y={(pA.y + pG.y) / 2 - 24} width={72} height={24} fontSize={14} color="#0f766e" />
      <DiagramMath tex="5\text{ cm}" x={pH.x + (pC.x - pH.x) / 2 - 22} y={pB.y + 8} width={56} height={24} fontSize={15} color="#1e3a8a" />
    </svg>
  );
}

function ShadedRatiosSvg() {
  return (
    <svg viewBox="0 0 690 198" className="mx-auto block w-full max-w-[690px]" role="img" aria-label="الأشكال الثلاثة لنسبة مساحة المنطقة المظلّلة من متوازي الأضلاع ABCD">
      {SHADED_RATIO_MODELS.map((item, idx) => {
        const ox = 10 + idx * 226;
        const vp: SvgViewport = { originX: ox + 20, originY: 152, scale: 23.5 };
        const [pC, pB, pA, pD] = item.outer.map(p => toSvg(p, vp));
        const shadedPts = item.shaded.map(p => toSvg(p, vp));
        return (
          <g key={item.id}>
            <rect x={ox} y={10} width={216} height={178} rx={15} fill="#ffffff" stroke="#e2e8f0" />
            <text x={ox + 108} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>الشكل {item.id}</text>
            <polygon points={svgPoints([pC, pB, pA, pD])} fill="#f8fafc" stroke="#1d4ed8" strokeWidth={2.2} strokeLinejoin="round" />
            <polygon points={svgPoints(shadedPts)} fill="rgba(59,130,246,0.34)" stroke="#1d4ed8" strokeWidth={2} strokeLinejoin="round" />

            {item.bottomTicks.map(([a, b], i) => (
              <DoubleTicks key={i} a={toSvg(a, vp)} b={toSvg(b, vp)} color="#dc2626" />
            ))}
            <DoubleTicks a={toSvg(item.topTick[0], vp)} b={toSvg(item.topTick[1], vp)} color="#dc2626" />
            {item.dots.map((dotPt, i) => {
              const s = toSvg(dotPt, vp);
              return <circle key={i} cx={s.x} cy={s.y} r={3.6} fill="#0f172a" />;
            })}

            <DiagramMath tex="D" x={pD.x - 16} y={pD.y - 24} width={20} height={22} fontSize={13} color="#1e3a8a" />
            <DiagramMath tex="A" x={pA.x + 2} y={pA.y - 22} width={20} height={22} fontSize={13} color="#1e3a8a" />
            <DiagramMath tex="C" x={pC.x - 18} y={pC.y - 4} width={20} height={22} fontSize={13} color="#1e3a8a" />
            <DiagramMath tex="B" x={pB.x + 4} y={pB.y - 4} width={20} height={22} fontSize={13} color="#1e3a8a" />
          </g>
        );
      })}
    </svg>
  );
}

function TrainFourSvg() {
  const configs: Record<"a" | "b" | "c" | "d", { bx: number; by: number; vp: SvgViewport; baseLbl: Pt; hLbl: Pt }> = {
    a: { bx: 10, by: 10, vp: { originX: 52, originY: 142, scale: 11.5 }, baseLbl: { x: 118, y: 146 }, hLbl: { x: 152, y: 84 } },
    b: { bx: 348, by: 10, vp: { originX: 438, originY: 142, scale: 32 }, baseLbl: { x: 472, y: 146 }, hLbl: { x: 446, y: 84 } },
    c: { bx: 10, by: 186, vp: { originX: 105, originY: 334, scale: 6.2 }, baseLbl: { x: 46, y: 274 }, hLbl: { x: 164, y: 262 } },
    d: { bx: 348, by: 186, vp: { originX: 382, originY: 324, scale: 10 }, baseLbl: { x: 458, y: 328 }, hLbl: { x: 500, y: 282 } },
  };

  return (
    <svg viewBox="0 0 680 362" className="mx-auto block w-full max-w-[680px]" role="img" aria-label="أربعة متوازيات أضلاع a و b و c و d مع قواعدها وارتفاعاتها">
      {TRAIN_FOUR_MODELS.map(m => {
        const cfg = configs[m.id];
        const pts = m.vertices.map(p => toSvg(p, cfg.vp));
        const h1 = toSvg(m.heightSeg[0], cfg.vp);
        const h2 = toSvg(m.heightSeg[1], cfg.vp);
        const rightCornerRef = m.orientation === "horizontal-base" ? pts[1] : pts[3];
        return (
          <g key={m.id}>
            <rect x={cfg.bx} y={cfg.by} width={322} height={166} rx={15} fill="#ffffff" stroke="#e2e8f0" />
            <circle cx={cfg.bx + 24} cy={cfg.by + 24} r={13} fill="#fef3c7" stroke="#f59e0b" />
            <DiagramMath tex={`${m.id})`} x={cfg.bx + 13} y={cfg.by + 12} width={26} height={24} fontSize={14} color="#b45309" />
            <polygon points={svgPoints(pts)} fill="#fde68a" fillOpacity={0.72} stroke="#b45309" strokeWidth={2.2} strokeLinejoin="round" />
            <line x1={h1.x} y1={h1.y} x2={h2.x} y2={h2.y} stroke="#dc2626" strokeWidth={2.2} />
            <path d={svgRightAngleMark(h2, h1, rightCornerRef, 9)} fill="none" stroke="#dc2626" strokeWidth={1.8} />
            <DiagramMath tex={`${m.base}\\text{ ${m.unit}}`} x={cfg.baseLbl.x} y={cfg.baseLbl.y} width={68} height={24} fontSize={14} color="#1e3a8a" />
            <DiagramMath tex={`${m.height}\\text{ ${m.unit}}`} x={cfg.hLbl.x} y={cfg.hLbl.y} width={66} height={24} fontSize={14} color="#dc2626" />
          </g>
        );
      })}
    </svg>
  );
}

export function ParallelogramAreaSvg({ kind }: { kind: AreaFigureKind }) {
  switch (kind) {
    case "areaCutPaste": return <CutPasteSvg />;
    case "areaUnitMismatch": return <UnitMismatchSvg />;
    case "areaTwoHeights": return <TwoHeightsSvg />;
    case "areaWorkedExample": return <WorkedExampleSvg />;
    case "areaShadedRatios": return <ShadedRatiosSvg />;
    case "areaTrainFour": return <TrainFourSvg />;
  }
}

const META: Record<AreaFigureKind, { title: string; detail: string }> = {
  areaCutPaste: {
    title: "قصّ ولصق متوازي الأضلاع إلى مستطيل",
    detail: "قصّ المثلث القائم على امتداد الارتفاع \\(h\\) ونقله إلى الطرف المقابل يعطي مستطيلاً قاعدته \\(\\mathcal{B}\\) وارتفاعه \\(h\\) بالمساحة نفسها: \\(\\mathcal{S}=\\mathcal{B}\\times h\\).",
  },
  areaUnitMismatch: {
    title: "ضرورة توحيد الواحدات قبل حساب المساحة",
    detail: "القاعدة \\(300\\text{ cm}=3\\text{ m}\\) والارتفاع \\(1\\text{ m}\\)؛ لا نضرب \\(300\\times 1\\) أبدًا قبل توحيد الواحدة، فتكون المساحة \\(3\\text{ m}^2=30000\\text{ cm}^2\\).",
  },
  areaTwoHeights: {
    title: "القاعدة والارتفاعان المتعلّقان بمتوازي الأضلاع",
    detail: "لكل متوازي أضلاع ارتفاعان يوافقان ضلعيه المتجاورين، وتعطي الطريقتان المساحة نفسها: \\(\\mathcal{S}=\\mathcal{B}\\times h=\\mathcal{B}'\\times h'\\).",
  },
  areaWorkedExample: {
    title: "حساب طول ضلع مجهول بطريقتَي المساحة",
    detail: "لدينا \\(BC=5\\text{ cm}\\) و \\(AH=3\\text{ cm}\\) فتكون \\(\\mathcal{S}=15\\text{ cm}^2\\)، ومن \\(CD\\times 3.75=15\\) نجد \\(CD=4\\text{ cm}\\).",
  },
  areaShadedRatios: {
    title: "نسبة مساحة المنطقة المظلّلة من متوازي الأضلاع",
    detail: "لجميع المناطق المظلّلة الارتفاع نفسه لـ \\(ABCD\\)، لذا تساوي نسبة مساحتها نسبة قاعدتها إلى \\(CB\\): \\(\\frac{1}{2}\\) و \\(\\frac{1}{3}\\) و \\(\\frac{1}{4}\\).",
  },
  areaTrainFour: {
    title: "متوازيات الأضلاع الأربعة (a, b, c, d)",
    detail: "في كل حالة نضرب طول القاعدة في الارتفاع العمودي عليها مع المحافظة على الواحدة المربّعة المناسبة (\\(\\text{cm}^2\\) أو \\(\\text{m}^2\\) أو \\(\\text{mm}^2\\)).",
  },
};

export default function ParallelogramAreaFigure({ kind }: { kind: AreaFigureKind }) {
  const m = META[kind];
  return (
    <FigureFrame kind={kind} title={m.title} detail={m.detail}>
      <ParallelogramAreaSvg kind={kind} />
    </FigureFrame>
  );
}

export { lerp };
