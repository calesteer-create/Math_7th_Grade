"use client";

import DiagramMath from "@/components/DiagramMath";
import FigureFrame from "@/components/figures/FigureFrame";
import {
  add,
  scale,
  svgAngleArc,
  svgParallelArrow,
  svgPoints,
  svgRightAngleMark,
  svgTickMarks,
  toSvg,
  unit,
  vec,
  type Pt,
  type SvgViewport,
} from "@/lib/geometry-core";
import {
  ADJACENT_MODEL,
  CHECK_ANGLE_A_MODEL,
  CONSECUTIVE_PROOF_BCDH,
  SYMMETRY_TRANSVERSAL_MODEL,
  TRAIN_ONE_ABCD,
  TRAIN_THREE_TABLE,
  TRAIN_TWO_LEFT_M,
  TRAIN_TWO_RIGHT_M,
  TRANSVERSAL_NON_PARALLEL,
  TRANSVERSAL_PARALLEL,
  VERTICAL_MODEL,
  WARMUP_FIG1,
  WARMUP_FIG2,
  type ParallelFigureKind,
} from "@/lib/parallel-lines-transversal";

function DoubleTicks({ a, b, color = "#dc2626" }: { a: Pt; b: Pt; color?: string }) {
  return <>
    {svgTickMarks(a, b, 2, 0.5, 5, 3.2).map(([p1, p2], i) => (
      <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={2} strokeLinecap="round" />
    ))}
  </>;
}

function WarmupAnglesSvg() {
  const vp1: SvgViewport = { originX: 165, originY: 162, scale: 45 };
  const vp2: SvgViewport = { originX: 435, originY: 168, scale: 45 };

  const f1A = toSvg(WARMUP_FIG1.A, vp1);
  const f1M = toSvg(WARMUP_FIG1.M, vp1);
  const f1C = toSvg(WARMUP_FIG1.C, vp1);
  const f1B = toSvg(WARMUP_FIG1.B, vp1);

  const f2G = toSvg(WARMUP_FIG2.G, vp2);
  const f2E = toSvg(WARMUP_FIG2.E, vp2);
  const f2F = toSvg(WARMUP_FIG2.F, vp2);
  const f2H = toSvg(WARMUP_FIG2.H, vp2);

  return (
    <svg viewBox="0 0 660 206" className="mx-auto block w-full max-w-[660px]" role="img" aria-label="شكل 1 يوضح زاويتين 132 درجة و 48 درجة على مستقيم واحد، وشكل 2 يوضح زاويتين 52 درجة و 38 درجة تشكلان زاوية قائمة">
      {/* شكل 1 */}
      <rect x={10} y={10} width={310} height={186} rx={16} fill="#ffffff" stroke="#e2e8f0" />
      <text x={165} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>شكل (1)</text>
      <line x1={f1C.x} y1={f1C.y} x2={f1A.x} y2={f1A.y} stroke="#1d4ed8" strokeWidth={2.5} />
      <line x1={f1M.x} y1={f1M.y} x2={f1B.x} y2={f1B.y} stroke="#1d4ed8" strokeWidth={2.5} />
      <path d={svgAngleArc(f1C, f1M, f1B, 28)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
      <path d={svgAngleArc(f1B, f1M, f1A, 24)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
      <circle cx={f1M.x} cy={f1M.y} r={4} fill="#1e3a8a" />
      <DiagramMath tex="C" x={f1C.x - 16} y={f1C.y + 4} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="M" x={f1M.x - 10} y={f1M.y + 6} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="A" x={f1A.x - 6} y={f1A.y + 4} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="B" x={f1B.x + 4} y={f1B.y - 18} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="132^\circ" x={f1M.x - 68} y={f1M.y - 44} width={48} height={22} fontSize={14} color="#dc2626" />
      <DiagramMath tex="48^\circ" x={f1M.x + 28} y={f1M.y - 34} width={42} height={22} fontSize={14} color="#0f766e" />

      {/* شكل 2 */}
      <rect x={338} y={10} width={312} height={186} rx={16} fill="#ffffff" stroke="#e2e8f0" />
      <text x={494} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>شكل (2)</text>
      <line x1={f2G.x} y1={f2G.y} x2={f2E.x} y2={f2E.y} stroke="#1d4ed8" strokeWidth={2.5} />
      <line x1={f2G.x} y1={f2G.y} x2={f2F.x} y2={f2F.y} stroke="#1d4ed8" strokeWidth={2.5} />
      <line x1={f2G.x} y1={f2G.y} x2={f2H.x} y2={f2H.y} stroke="#0f766e" strokeWidth={2.3} />
      <path d={svgAngleArc(f2F, f2G, f2H, 30)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
      <path d={svgAngleArc(f2H, f2G, f2E, 26)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
      <circle cx={f2G.x} cy={f2G.y} r={4} fill="#1e3a8a" />
      <DiagramMath tex="G" x={f2G.x - 24} y={f2G.y - 4} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="F" x={f2F.x - 24} y={f2F.y - 12} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="E" x={f2E.x + 4} y={f2E.y - 10} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="H" x={f2H.x + 6} y={f2H.y - 16} width={22} height={22} fontSize={14} color="#0f766e" />
      <DiagramMath tex="52^\circ" x={f2G.x + 8} y={f2G.y - 62} width={44} height={22} fontSize={14} color="#dc2626" />
      <DiagramMath tex="38^\circ" x={f2G.x + 46} y={f2G.y - 30} width={44} height={22} fontSize={14} color="#0f766e" />
    </svg>
  );
}

function VerticalAdjacentSvg() {
  const vp1: SvgViewport = { originX: 165, originY: 112, scale: 42 };
  const vp2: SvgViewport = { originX: 495, originY: 158, scale: 42 };

  const vA = toSvg(VERTICAL_MODEL.A, vp1);
  const vB = toSvg(VERTICAL_MODEL.B, vp1);
  const vE = toSvg(VERTICAL_MODEL.E, vp1);
  const vF = toSvg(VERTICAL_MODEL.F, vp1);
  const vM = toSvg(VERTICAL_MODEL.M, vp1);

  const aA = toSvg(ADJACENT_MODEL.A, vp2);
  const aB = toSvg(ADJACENT_MODEL.B, vp2);
  const aC = toSvg(ADJACENT_MODEL.C, vp2);
  const aM = toSvg(ADJACENT_MODEL.M, vp2);

  return (
    <svg viewBox="0 0 660 200" className="mx-auto block w-full max-w-[660px]" role="img" aria-label="الزاويتان المتقابلتان بالرأس AMB و EMF والزاويتان المتجاورتان AMB و BMC">
      {/* المتقابلتان بالرأس */}
      <rect x={10} y={10} width={310} height={180} rx={16} fill="#ffffff" stroke="#e2e8f0" />
      <text x={165} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>زاويتان متقابلتان بالرأس</text>
      <line x1={vE.x} y1={vE.y} x2={vB.x} y2={vB.y} stroke="#1d4ed8" strokeWidth={2.4} />
      <line x1={vF.x} y1={vF.y} x2={vA.x} y2={vA.y} stroke="#1d4ed8" strokeWidth={2.4} />
      <path d={svgAngleArc(vA, vM, vB, 30)} fill="none" stroke="#dc2626" strokeWidth={2.4} />
      <path d={svgAngleArc(vE, vM, vF, 30)} fill="none" stroke="#dc2626" strokeWidth={2.4} />
      <circle cx={vM.x} cy={vM.y} r={4.2} fill="#dc2626" />
      <DiagramMath tex="A" x={vA.x + 2} y={vA.y - 18} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="B" x={vB.x + 2} y={vB.y - 10} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="E" x={vE.x - 22} y={vE.y - 10} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="F" x={vF.x - 20} y={vF.y - 4} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="M" x={vM.x - 8} y={vM.y - 28} width={22} height={22} fontSize={14} color="#dc2626" />

      {/* المتجاورتان */}
      <rect x={338} y={10} width={312} height={180} rx={16} fill="#ffffff" stroke="#e2e8f0" />
      <text x={494} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>زاويتان متجاورتان (ضلع مشترك [MB))</text>
      <line x1={aM.x} y1={aM.y} x2={aA.x} y2={aA.y} stroke="#1d4ed8" strokeWidth={2.4} />
      <line x1={aM.x} y1={aM.y} x2={aB.x} y2={aB.y} stroke="#dc2626" strokeWidth={2.6} />
      <line x1={aM.x} y1={aM.y} x2={aC.x} y2={aC.y} stroke="#1d4ed8" strokeWidth={2.4} />
      <path d={svgAngleArc(aB, aM, aA, 28)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
      <path d={svgAngleArc(aC, aM, aB, 24)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
      <path d={svgAngleArc(aC, aM, aB, 30)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
      <circle cx={aM.x} cy={aM.y} r={4.2} fill="#1e3a8a" />
      <DiagramMath tex="A" x={aA.x + 2} y={aA.y - 10} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="B" x={aB.x + 4} y={aB.y - 18} width={22} height={22} fontSize={14} color="#dc2626" />
      <DiagramMath tex="C" x={aC.x - 22} y={aC.y - 18} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="M" x={aM.x - 8} y={aM.y + 4} width={22} height={22} fontSize={14} color="#1e3a8a" />
    </svg>
  );
}

function SymmetryTransversalSvg() {
  const vp: SvgViewport = { originX: 250, originY: 190, scale: 48 };
  const m = SYMMETRY_TRANSVERSAL_MODEL;
  const pX = toSvg(m.X, vp), pXp = toSvg(m.Xp, vp);
  const pY = toSvg(m.Y, vp), pYp = toSvg(m.Yp, vp);
  const pZ = toSvg(m.Z, vp), pZp = toSvg(m.Zp, vp);
  const pB = toSvg(m.B, vp), pC = toSvg(m.C, vp), pM = toSvg(m.M, vp);

  return (
    <svg viewBox="0 0 520 265" className="mx-auto block w-full max-w-[520px]" role="img" aria-label="المستقيمان المتوازيان XX' و YY' يقطعهما ZZ' في B و C ومركز التناظر M منتصف BC">
      <line x1={pX.x} y1={pX.y} x2={pXp.x} y2={pXp.y} stroke="#1d4ed8" strokeWidth={2.5} />
      <line x1={pY.x} y1={pY.y} x2={pYp.x} y2={pYp.y} stroke="#1d4ed8" strokeWidth={2.5} />
      <line x1={pZ.x} y1={pZ.y} x2={pZp.x} y2={pZp.y} stroke="#dc2626" strokeWidth={2.5} />
      <path d={svgParallelArrow(pX, pXp, 0.22)} fill="none" stroke="#1d4ed8" strokeWidth={2.2} />
      <path d={svgParallelArrow(pY, pYp, 0.22)} fill="none" stroke="#1d4ed8" strokeWidth={2.2} />
      <DoubleTicks a={pB} b={pM} color="#0f766e" />
      <DoubleTicks a={pM} b={pC} color="#0f766e" />
      <path d={svgAngleArc(pX, pB, pC, 22)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
      <path d={svgAngleArc(pYp, pC, pB, 22)} fill="none" stroke="#0f766e" strokeWidth={2.2} />

      <circle cx={pB.x} cy={pB.y} r={4.2} fill="#1e3a8a" />
      <circle cx={pC.x} cy={pC.y} r={4.2} fill="#1e3a8a" />
      <circle cx={pM.x} cy={pM.y} r={4.8} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />

      <DiagramMath tex="X" x={pX.x - 16} y={pX.y - 26} width={22} height={22} fontSize={14} color="#1d4ed8" />
      <DiagramMath tex="X'" x={pXp.x - 10} y={pXp.y - 26} width={26} height={22} fontSize={14} color="#1d4ed8" />
      <DiagramMath tex="Y" x={pY.x - 16} y={pY.y + 4} width={22} height={22} fontSize={14} color="#1d4ed8" />
      <DiagramMath tex="Y'" x={pYp.x - 10} y={pYp.y + 4} width={26} height={22} fontSize={14} color="#1d4ed8" />
      <DiagramMath tex="Z" x={pZ.x + 6} y={pZ.y - 8} width={22} height={22} fontSize={14} color="#dc2626" />
      <DiagramMath tex="Z'" x={pZp.x - 24} y={pZp.y - 16} width={26} height={22} fontSize={14} color="#dc2626" />
      <DiagramMath tex="B" x={pB.x + 8} y={pB.y - 26} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="C" x={pC.x - 24} y={pC.y + 4} width={22} height={22} fontSize={14} color="#1e3a8a" />
      <DiagramMath tex="M" x={pM.x + 8} y={pM.y - 10} width={22} height={22} fontSize={14} color="#dc2626" />
    </svg>
  );
}

function TransversalPanel({
  model,
  xOffset,
  title,
  showParallelArrows,
}: {
  model: typeof TRANSVERSAL_PARALLEL;
  xOffset: number;
  title: string;
  showParallelArrows: boolean;
}) {
  const vp: SvgViewport = { originX: xOffset + 165, originY: 186, scale: 36 };
  const d1L = toSvg(model.d1L, vp), d1R = toSvg(model.d1R, vp);
  const d2L = toSvg(model.d2L, vp), d2R = toSvg(model.d2R, vp);
  const tBot = toSvg(model.tBot, vp), tTop = toSvg(model.tTop, vp);
  const A = toSvg(model.A, vp), B = toSvg(model.B, vp);

  return (
    <g>
      <rect x={xOffset} y={10} width={324} height={240} rx={16} fill="#ffffff" stroke="#e2e8f0" />
      <text x={xOffset + 162} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={12.5} fontWeight={800}>{title}</text>
      <line x1={d1L.x} y1={d1L.y} x2={d1R.x} y2={d1R.y} stroke="#1d4ed8" strokeWidth={2.4} />
      <line x1={d2L.x} y1={d2L.y} x2={d2R.x} y2={d2R.y} stroke="#1d4ed8" strokeWidth={2.4} />
      <line x1={tBot.x} y1={tBot.y} x2={tTop.x} y2={tTop.y} stroke="#dc2626" strokeWidth={2.4} />
      {showParallelArrows && <>
        <path d={svgParallelArrow(d1L, d1R, 0.18)} fill="none" stroke="#1d4ed8" strokeWidth={2.2} />
        <path d={svgParallelArrow(d2L, d2R, 0.18)} fill="none" stroke="#1d4ed8" strokeWidth={2.2} />
        {/* إبراز زوج متبادل داخلاً A3=B1 وزوج متناظر A1=B1 */}
        <path d={svgAngleArc(d1L, A, tBot, 18)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
        <path d={svgAngleArc(d2R, B, tTop, 18)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
        <path d={svgAngleArc(d1R, A, tTop, 18)} fill="none" stroke="#d97706" strokeWidth={2.2} />
      </>}
      <circle cx={A.x} cy={A.y} r={3.5} fill="#0f172a" />
      <circle cx={B.x} cy={B.y} r={3.5} fill="#0f172a" />
      <DiagramMath tex="\Delta_1" x={d1R.x - 24} y={d1R.y - 26} width={28} height={22} fontSize={13} color="#1d4ed8" />
      <DiagramMath tex="\Delta_2" x={d2R.x - 24} y={d2R.y + 4} width={28} height={22} fontSize={13} color="#1d4ed8" />
      <DiagramMath tex="\Delta" x={tTop.x + 6} y={tTop.y - 6} width={24} height={22} fontSize={13} color="#dc2626" />

      {/* الزوايا A1..A4 و B1..B4 بالمواقع الدقيقة للكتاب */}
      <DiagramMath tex="A_1" x={A.x + 12} y={A.y - 28} width={26} height={22} fontSize={12.5} color="#b45309" />
      <DiagramMath tex="A_2" x={A.x - 32} y={A.y - 28} width={26} height={22} fontSize={12.5} color="#334155" />
      <DiagramMath tex="A_3" x={A.x - 34} y={A.y + 4} width={26} height={22} fontSize={12.5} color="#0f766e" />
      <DiagramMath tex="A_4" x={A.x + 12} y={A.y + 4} width={26} height={22} fontSize={12.5} color="#334155" />

      <DiagramMath tex="B_1" x={B.x + 12} y={B.y - 28} width={26} height={22} fontSize={12.5} color="#0f766e" />
      <DiagramMath tex="B_2" x={B.x - 32} y={B.y - 28} width={26} height={22} fontSize={12.5} color="#334155" />
      <DiagramMath tex="B_3" x={B.x - 34} y={B.y + 4} width={26} height={22} fontSize={12.5} color="#334155" />
      <DiagramMath tex="B_4" x={B.x + 12} y={B.y + 4} width={26} height={22} fontSize={12.5} color="#334155" />
    </g>
  );
}

function TransversalPositionsSvg() {
  return (
    <svg viewBox="0 0 680 262" className="mx-auto block w-full max-w-[680px]" role="img" aria-label="الزوايا الثماني الناتجة من قاطع لمستقيمين: حالة عامة للتسمية وحالة التوازي للخواص">
      <TransversalPanel model={TRANSVERSAL_NON_PARALLEL} xOffset={10} title="1) مستقيمان غير متوازيين (التسمية بالموضع)" showParallelArrows={false} />
      <TransversalPanel model={TRANSVERSAL_PARALLEL} xOffset={346} title="2) مستقيمان متوازيان (تساوي القياسات)" showParallelArrows={true} />
    </svg>
  );
}

function ProveParallelSvg() {
  const m = TRANSVERSAL_PARALLEL;
  const cards = [
    { key: "altInt", x: 10, title: "1) تبادل داخلي متساوٍ", sub: "\\widehat{A_3}=\\widehat{B_1}\\implies\\Delta_1\\parallel\\Delta_2" },
    { key: "altExt", x: 236, title: "2) تبادل خارجي متساوٍ", sub: "\\widehat{A_2}=\\widehat{B_4}\\implies\\Delta_1\\parallel\\Delta_2" },
    { key: "corr", x: 462, title: "3) تناظر متساوٍ", sub: "\\widehat{A_1}=\\widehat{B_1}\\implies\\Delta_1\\parallel\\Delta_2" },
  ] as const;

  return (
    <svg viewBox="0 0 688 232" className="mx-auto block w-full max-w-[688px]" role="img" aria-label="الطرق الثلاث لإثبات توازي مستقيمين من خلال التبادل الداخلي أو الخارجي أو التناظر">
      {cards.map(c => {
        const vp: SvgViewport = { originX: c.x + 108, originY: 148, scale: 26 };
        const d1L = toSvg(m.d1L, vp), d1R = toSvg(m.d1R, vp);
        const d2L = toSvg(m.d2L, vp), d2R = toSvg(m.d2R, vp);
        const tBot = toSvg(m.tBot, vp), tTop = toSvg(m.tTop, vp);
        const A = toSvg(m.A, vp), B = toSvg(m.B, vp);
        return (
          <g key={c.key}>
            <rect x={c.x} y={8} width={216} height={216} rx={15} fill="#ffffff" stroke="#e2e8f0" />
            <text x={c.x + 108} y={30} textAnchor="middle" fill="#1e3a8a" fontSize={12} fontWeight={800}>{c.title}</text>
            <line x1={d1L.x} y1={d1L.y} x2={d1R.x} y2={d1R.y} stroke="#1d4ed8" strokeWidth={2.2} />
            <line x1={d2L.x} y1={d2L.y} x2={d2R.x} y2={d2R.y} stroke="#1d4ed8" strokeWidth={2.2} />
            <line x1={tBot.x} y1={tBot.y} x2={tTop.x} y2={tTop.y} stroke="#dc2626" strokeWidth={2.2} />
            <path d={svgParallelArrow(d1L, d1R, 0.16)} fill="none" stroke="#15803d" strokeWidth={2} />
            <path d={svgParallelArrow(d2L, d2R, 0.16)} fill="none" stroke="#15803d" strokeWidth={2} />
            {c.key === "altInt" && <>
              <path d={svgAngleArc(d1L, A, tBot, 16)} fill="none" stroke="#0f766e" strokeWidth={2.4} />
              <path d={svgAngleArc(d2R, B, tTop, 16)} fill="none" stroke="#0f766e" strokeWidth={2.4} />
            </>}
            {c.key === "altExt" && <>
              <path d={svgAngleArc(d1L, A, tTop, 16)} fill="none" stroke="#d97706" strokeWidth={2.4} />
              <path d={svgAngleArc(d2R, B, tBot, 16)} fill="none" stroke="#d97706" strokeWidth={2.4} />
            </>}
            {c.key === "corr" && <>
              <path d={svgAngleArc(d1R, A, tTop, 16)} fill="none" stroke="#7c3aed" strokeWidth={2.4} />
              <path d={svgAngleArc(d2R, B, tTop, 16)} fill="none" stroke="#7c3aed" strokeWidth={2.4} />
            </>}
            <DiagramMath tex={c.sub} x={c.x + 12} y={190} width={192} height={26} fontSize={12.5} color="#1e3a8a" />
          </g>
        );
      })}
    </svg>
  );
}

function ConsecutiveProofSvg() {
  const vp: SvgViewport = { originX: 78, originY: 205, scale: 52 };
  const { A, B, C, D, H } = CONSECUTIVE_PROOF_BCDH;
  const pA = toSvg(A, vp), pB = toSvg(B, vp), pC = toSvg(C, vp), pD = toSvg(D, vp), pH = toSvg(H, vp);
  return (
    <svg viewBox="0 0 430 236" className="mx-auto block w-full max-w-[430px]" role="img" aria-label="برهان تكامل زاويتين متتاليتين في متوازي الأضلاع BCDH بتمديد DC إلى A">
      <polygon points={svgPoints([pB, pC, pD, pH])} fill="#eff6ff" stroke="#1d4ed8" strokeWidth={2.3} strokeLinejoin="round" />
      <line x1={pC.x} y1={pC.y} x2={pA.x} y2={pA.y} stroke="#1d4ed8" strokeWidth={2.3} strokeDasharray="5 3" />
      <path d={svgParallelArrow(pC, pB, 0.52)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
      <path d={svgParallelArrow(pD, pH, 0.52)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
      <path d={svgAngleArc(pA, pC, pB, 22)} fill="none" stroke="#16a34a" strokeWidth={2.4} />
      <path d={svgAngleArc(pC, pD, pH, 22)} fill="none" stroke="#16a34a" strokeWidth={2.4} />
      <path d={svgAngleArc(pB, pC, pD, 18)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
      <path d={svgAngleArc(pB, pC, pD, 24)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
      {[pA, pB, pC, pD, pH].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.8} fill="#1e3a8a" />)}
      <DiagramMath tex="A" x={pA.x + 4} y={pA.y - 16} width={22} height={22} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="C" x={pC.x - 24} y={pC.y - 14} width={22} height={22} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="B" x={pB.x + 8} y={pB.y - 16} width={22} height={22} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="D" x={pD.x - 22} y={pD.y - 2} width={22} height={22} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="H" x={pH.x + 8} y={pH.y - 2} width={22} height={22} fontSize={15} color="#1e3a8a" />
    </svg>
  );
}

function CheckAngleASvg() {
  const vp: SvgViewport = { originX: 225, originY: 205, scale: 48 };
  const m = CHECK_ANGLE_A_MODEL;
  const pA = toSvg(m.A, vp), pP = toSvg(m.P, vp), pPext = toSvg(m.Pext, vp);
  const pQ = toSvg(m.Q, vp), pQext = toSvg(m.Qext, vp);
  const d1T = toSvg(m.d1Top, vp), d1B = toSvg(m.d1Bot, vp);
  const dmT = toSvg(m.dMidTop, vp), dmB = toSvg(m.dMidBot, vp);
  const d2T = toSvg(m.d2Top, vp), d2B = toSvg(m.d2Bot, vp);

  return (
    <svg viewBox="0 0 470 250" className="mx-auto block w-full max-w-[470px]" role="img" aria-label="ثلاثة مستقيمات متوازية وزاويتان 135 درجة لحساب الزاوية A باستخدام المستقيم المساعد المتقطع">
      <line x1={d1B.x} y1={d1B.y} x2={d1T.x} y2={d1T.y} stroke="#1d4ed8" strokeWidth={2.4} />
      <line x1={dmB.x} y1={dmB.y} x2={dmT.x} y2={dmT.y} stroke="#0f766e" strokeWidth={2.1} strokeDasharray="6 4" />
      <line x1={d2B.x} y1={d2B.y} x2={d2T.x} y2={d2T.y} stroke="#1d4ed8" strokeWidth={2.4} />

      <path d={svgParallelArrow(d1B, d1T, 0.78)} fill="none" stroke="#db2777" strokeWidth={2.3} />
      <path d={svgParallelArrow(dmB, dmT, 0.8)} fill="none" stroke="#db2777" strokeWidth={2.3} />
      <path d={svgParallelArrow(d2B, d2T, 0.78)} fill="none" stroke="#db2777" strokeWidth={2.3} />

      <line x1={pPext.x} y1={pPext.y} x2={pA.x} y2={pA.y} stroke="#1e293b" strokeWidth={2.4} />
      <line x1={pQext.x} y1={pQext.y} x2={pA.x} y2={pA.y} stroke="#1e293b" strokeWidth={2.4} />

      <path d={svgAngleArc(d1B, pP, pPext, 24)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
      <path d={svgAngleArc(d2B, pQ, pQext, 24)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
      <path d={svgAngleArc(pP, pA, pQ, 22)} fill="none" stroke="#0f766e" strokeWidth={2.4} />

      <circle cx={pA.x} cy={pA.y} r={4.5} fill="#0f766e" />
      <DiagramMath tex="A" x={pA.x + 6} y={pA.y + 4} width={22} height={22} fontSize={15} color="#0f766e" />
      <DiagramMath tex="135^\circ" x={pP.x - 66} y={pP.y + 8} width={52} height={22} fontSize={14} color="#dc2626" />
      <DiagramMath tex="135^\circ" x={pQ.x + 12} y={pQ.y + 12} width={52} height={22} fontSize={14} color="#dc2626" />
    </svg>
  );
}

function TrainOneSvg() {
  const vp: SvgViewport = { originX: 72, originY: 172, scale: 62 };
  const m = TRAIN_ONE_ABCD;
  const pA = toSvg(m.A, vp), pB = toSvg(m.B, vp), pC = toSvg(m.C, vp), pD = toSvg(m.D, vp);
  const d1L = toSvg(m.d1L, vp), d1R = toSvg(m.d1R, vp);
  const d2L = toSvg(m.d2L, vp), d2R = toSvg(m.d2R, vp);

  return (
    <svg viewBox="0 0 510 218" className="mx-auto block w-full max-w-[510px]" role="img" aria-label="المستقيمان المتوازيان d1 و d2 مع الزاويتين المتناظرتين المتساويتين C1 و B1 لإثبات ABCD متوازي أضلاع">
      <line x1={d1L.x} y1={d1L.y} x2={d1R.x} y2={d1R.y} stroke="#1d4ed8" strokeWidth={2.5} />
      <line x1={d2L.x} y1={d2L.y} x2={d2R.x} y2={d2R.y} stroke="#1d4ed8" strokeWidth={2.5} />
      <path d={svgParallelArrow(d1L, d1R, 0.12)} fill="none" stroke="#1d4ed8" strokeWidth={2.3} />
      <path d={svgParallelArrow(d2L, d2R, 0.12)} fill="none" stroke="#1d4ed8" strokeWidth={2.3} />
      <line x1={pC.x} y1={pC.y} x2={pD.x} y2={pD.y} stroke="#dc2626" strokeWidth={2.6} />
      <line x1={pB.x} y1={pB.y} x2={pA.x} y2={pA.y} stroke="#dc2626" strokeWidth={2.6} />
      <path d={svgAngleArc(pD, pC, pB, 24)} fill="none" stroke="#0f766e" strokeWidth={2.3} />
      <path d={svgAngleArc(pA, pB, d2R, 24)} fill="none" stroke="#0f766e" strokeWidth={2.3} />
      {[pA, pB, pC, pD].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1e3a8a" />)}
      <DiagramMath tex="d_1" x={d1L.x + 2} y={d1L.y - 28} width={26} height={22} fontSize={15} color="#1d4ed8" />
      <DiagramMath tex="d_2" x={d2L.x + 2} y={d2L.y + 6} width={26} height={22} fontSize={15} color="#1d4ed8" />
      <DiagramMath tex="D" x={pD.x - 10} y={pD.y - 28} width={22} height={22} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="A" x={pA.x - 8} y={pA.y - 28} width={22} height={22} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="C" x={pC.x - 16} y={pC.y + 6} width={22} height={22} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="B" x={pB.x - 12} y={pB.y + 6} width={22} height={22} fontSize={15} color="#1e3a8a" />
      <DiagramMath tex="C_1" x={pC.x + 24} y={pC.y - 28} width={26} height={22} fontSize={13.5} color="#0f766e" />
      <DiagramMath tex="B_1" x={pB.x + 24} y={pB.y - 28} width={26} height={22} fontSize={13.5} color="#0f766e" />
    </svg>
  );
}

function TrainTwoMSvg() {
  // الشكل الأيمن (110° و 37° ← M = 107°)
  const vpR: SvgViewport = { originX: 495, originY: 192, scale: 36 };
  const r = TRAIN_TWO_RIGHT_M;
  const rd1L = toSvg(r.d1L, vpR), rd1R = toSvg(r.d1R, vpR);
  const rd2L = toSvg(r.d2L, vpR), rd2R = toSvg(r.d2R, vpR);
  const rM = toSvg(r.M, vpR), rP = toSvg(r.P, vpR), rPext = toSvg(r.Pext, vpR);
  const rQ = toSvg(r.Q, vpR), rQext = toSvg(r.Qext, vpR);

  // الشكل الأيسر (90° و 157° ← M = 113°)
  const vpL: SvgViewport = { originX: 162, originY: 198, scale: 35 };
  const l = TRAIN_TWO_LEFT_M;
  const lP = toSvg(l.P, vpL), lQ = toSvg(l.Q, vpL), lQext = toSvg(l.Qext, vpL);
  const lR = toSvg(l.R, vpL), lRext = toSvg(l.Rext, vpL);
  const ld1T = toSvg(l.d1Top, vpL), ld1B = toSvg(l.d1Bot, vpL);
  const ld2T = toSvg(l.d2Top, vpL), ld2B = toSvg(l.d2Bot, vpL);

  return (
    <svg viewBox="0 0 680 250" className="mx-auto block w-full max-w-[680px]" role="img" aria-label="حساب قياس الزاوية M في الشكلين: الشكل الأيمن 110 درجة و 37 درجة، والشكل الأيسر 90 درجة و 157 درجة">
      {/* الشكل الأيسر (في العرض كما في الكتاب: يسار) */}
      <rect x={10} y={10} width={320} height={230} rx={16} fill="#ffffff" stroke="#e2e8f0" />
      <text x={170} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={12.5} fontWeight={800}>الشكل الأيسر (زاوية قائمة و 157°)</text>
      <line x1={ld1B.x} y1={ld1B.y} x2={ld1T.x} y2={ld1T.y} stroke="#1d4ed8" strokeWidth={2.3} />
      <line x1={ld2B.x} y1={ld2B.y} x2={ld2T.x} y2={ld2T.y} stroke="#1d4ed8" strokeWidth={2.3} />
      <path d={svgParallelArrow(ld1T, ld1B, 0.78)} fill="none" stroke="#db2777" strokeWidth={2.2} />
      <path d={svgParallelArrow(ld2T, ld2B, 0.78)} fill="none" stroke="#db2777" strokeWidth={2.2} />
      <line x1={lRext.x} y1={lRext.y} x2={lP.x} y2={lP.y} stroke="#1e293b" strokeWidth={2.3} />
      <line x1={lP.x} y1={lP.y} x2={lQext.x} y2={lQext.y} stroke="#1e293b" strokeWidth={2.3} />
      <path d={svgRightAngleMark(lR, lP, lQ, 11)} fill="none" stroke="#0f766e" strokeWidth={2} />
      <path d={svgAngleArc(ld2B, lQ, lQext, 22)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
      <path d={svgAngleArc(lRext, lR, ld1B, 22)} fill="none" stroke="#7c3aed" strokeWidth={2.4} />
      <DiagramMath tex="157^\circ" x={lQ.x - 10} y={lQ.y + 18} width={50} height={22} fontSize={13.5} color="#dc2626" />
      <DiagramMath tex="M" x={lR.x - 42} y={lR.y - 2} width={26} height={22} fontSize={15} color="#7c3aed" />

      {/* الشكل الأيمن (في العرض كما في الكتاب: يمين) */}
      <rect x={346} y={10} width={324} height={230} rx={16} fill="#ffffff" stroke="#e2e8f0" />
      <text x={508} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={12.5} fontWeight={800}>الشكل الأيمن (110° و 37°)</text>
      <line x1={rd1L.x} y1={rd1L.y} x2={rd1R.x} y2={rd1R.y} stroke="#1d4ed8" strokeWidth={2.3} />
      <line x1={rd2L.x} y1={rd2L.y} x2={rd2R.x} y2={rd2R.y} stroke="#1d4ed8" strokeWidth={2.3} />
      <path d={svgParallelArrow(rd1L, rd1R, 0.18)} fill="none" stroke="#db2777" strokeWidth={2.2} />
      <path d={svgParallelArrow(rd2L, rd2R, 0.18)} fill="none" stroke="#db2777" strokeWidth={2.2} />
      <line x1={rPext.x} y1={rPext.y} x2={rM.x} y2={rM.y} stroke="#1e293b" strokeWidth={2.3} />
      <line x1={rM.x} y1={rM.y} x2={rQext.x} y2={rQext.y} stroke="#1e293b" strokeWidth={2.3} />
      <path d={svgAngleArc(rd1R, rP, rPext, 20)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
      <path d={svgAngleArc(rd2R, rQ, rM, 24)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
      <path d={svgAngleArc(rP, rM, rQ, 20)} fill="none" stroke="#7c3aed" strokeWidth={2.4} />
      <circle cx={rM.x} cy={rM.y} r={4} fill="#7c3aed" />
      <DiagramMath tex="110^\circ" x={rP.x + 12} y={rP.y - 34} width={48} height={22} fontSize={13.5} color="#dc2626" />
      <DiagramMath tex="37^\circ" x={rQ.x + 28} y={rQ.y - 26} width={44} height={22} fontSize={13.5} color="#0f766e" />
      <DiagramMath tex="M" x={rM.x - 42} y={rM.y - 12} width={26} height={22} fontSize={15} color="#7c3aed" />
    </svg>
  );
}

function TrainTableXSvg() {
  const vp: SvgViewport = { originX: 78, originY: 208, scale: 52 };
  const t = TRAIN_THREE_TABLE;
  const pL1 = toSvg(t.L1, vp), pL2 = toSvg(t.L2, vp), pU2 = toSvg(t.U2, vp), pU1 = toSvg(t.U1, vp);
  const leg2Pts = t.leg2.map(p => toSvg(p, vp));
  const pivot = toSvg(t.pivot, vp);
  const topY = pU1.y;
  const floorY = pL1.y;

  // اتجاه شعاع سطح الطاولة نحو اليمين عند U1
  const rightFromU1 = add(pU1, scale(unit(vec(pU1, pU2)), 52));

  return (
    <svg viewBox="0 0 430 245" className="mx-auto block w-full max-w-[430px]" role="img" aria-label="الطاولة القابلة للطي: رجل متوازي أضلاع تميل بزاوية 40 درجة لإيجاد الزاوية المتتالية x">
      {/* خط الأرض الموازي لسطح الطاولة */}
      <line x1={38} y1={floorY} x2={382} y2={floorY} stroke="#64748b" strokeWidth={2} strokeDasharray="6 4" />
      {/* الرجل الخلفية */}
      <polygon points={svgPoints(leg2Pts)} fill="#fed7aa" stroke="#9a3412" strokeWidth={2} />
      {/* الرجل الأمامية (متوازي الأضلاع المميّز) */}
      <polygon points={svgPoints([pL1, pL2, pU2, pU1])} fill="#fdba74" stroke="#7c2d12" strokeWidth={2.4} />
      {/* سطح الطاولة الأفقي الموازي للأرض */}
      <rect x={46} y={topY - 18} width={328} height={18} rx={4} fill="#b45309" stroke="#78350f" strokeWidth={2} />
      <circle cx={pivot.x} cy={pivot.y} r={5} fill="#451a03" stroke="#fef3c7" strokeWidth={1.5} />

      {/* زاوية 40° أسفل اليسار */}
      <path d={svgAngleArc(pU1, pL1, pL2, 34)} fill="none" stroke="#16a34a" strokeWidth={2.5} />
      <DiagramMath tex="40^\circ" x={pL1.x + 36} y={pL1.y - 28} width={44} height={22} fontSize={15} color="#15803d" />

      {/* زاوية x° أعلى اليسار (متتالية مع 40° داخل متوازي الأضلاع) */}
      <path d={svgAngleArc(pL1, pU1, rightFromU1, 28)} fill="none" stroke="#dc2626" strokeWidth={2.6} />
      <DiagramMath tex="x^\circ" x={pU1.x - 16} y={pU1.y + 24} width={38} height={22} fontSize={16} color="#dc2626" />
    </svg>
  );
}

export function ParallelLinesSvg({ kind }: { kind: ParallelFigureKind }) {
  switch (kind) {
    case "plWarmupAngles": return <WarmupAnglesSvg />;
    case "plVerticalAdjacent": return <VerticalAdjacentSvg />;
    case "plSymmetryTransversal": return <SymmetryTransversalSvg />;
    case "plTransversalPositions": return <TransversalPositionsSvg />;
    case "plProveParallel": return <ProveParallelSvg />;
    case "plConsecutiveProof": return <ConsecutiveProofSvg />;
    case "plCheckAngleA": return <CheckAngleASvg />;
    case "plTrainOne": return <TrainOneSvg />;
    case "plTrainTwoM": return <TrainTwoMSvg />;
    case "plTrainTableX": return <TrainTableXSvg />;
  }
}

const META: Record<ParallelFigureKind, { title: string; detail: string }> = {
  plWarmupAngles: {
    title: "الزاوية المستقيمة (180°) والزاوية القائمة (90°)",
    detail: "في الشكل (1): \\(132^\\circ+48^\\circ=180^\\circ\\) إذن \\(C,M,A\\) على استقامة واحدة؛ وفي الشكل (2): \\(52^\\circ+38^\\circ=90^\\circ\\) إذن \\([GE)\\perp[GF)\\).",
  },
  plVerticalAdjacent: {
    title: "الزاويتان المتقابلتان بالرأس والمتجاورتان",
    detail: "المتقابلتان بالرأس متساويتان بالتناظر المركزي حول \\(M\\)، والمتجاورتان تشتركان بالرأس وبضلع وتقعان على جهتين مختلفتين منه.",
  },
  plSymmetryTransversal: {
    title: "التناظر المركزي لمستقيمين متوازيين وقاطع لهما",
    detail: "النقطة \\(M\\) منتصف \\([BC]\\) تحوّل \\((XX')\\) إلى \\((YY')\\) و \\((ZZ')\\) إلى نفسه، فتنتج المساواة بين الزوايا المتبادلة داخلاً.",
  },
  plTransversalPositions: {
    title: "أوضاع الزوايا مع قاطع: التسمية أولاً ثم التساوي عند التوازي",
    detail: "التسمية (تبادل داخلي، تبادل خارجي، تناظر) تحدّدها المواضع دائمًا، أما التساوي في القياس فلا يتحقّق إلا عندما يكون \\(\\Delta_1\\parallel\\Delta_2\\).",
  },
  plProveParallel: {
    title: "قواعد إثبات توازي مستقيمين الثلاث",
    detail: "يكفي تساوي زاويتين متبادلتين داخلاً، أو متبادلتين خارجاً، أو متناظرتين لإثبات أن \\(\\Delta_1\\parallel\\Delta_2\\).",
  },
  plConsecutiveProof: {
    title: "برهان تكامل كل زاويتين متتاليتين في متوازي الأضلاع",
    detail: "بمدّ \\([DC]\\) إلى \\(A\\) تكون \\(\\widehat{ACB}=\\widehat{CDH}\\) بالتناظر، وبما أن \\(\\widehat{ACB}+\\widehat{BCD}=180^\\circ\\) فإن \\(\\widehat{CDH}+\\widehat{BCD}=180^\\circ\\).",
  },
  plCheckAngleA: {
    title: "حساب الزاوية A بالمستقيم المساعد المتقطّع",
    detail: "مكمّلة كل زاوية \\(135^\\circ\\) هي \\(45^\\circ\\)، وبالتبادل الداخلي مع المستقيم المساعد تنقسم \\(\\widehat{A}\\) إلى \\(45^\\circ+45^\\circ=90^\\circ\\).",
  },
  plTrainOne: {
    title: "إثبات التوازي ومتوازي الأضلاع في الرباعي ABCD",
    detail: "الزاويتان \\(\\widehat{C_1}\\) و \\(\\widehat{B_1}\\) متناظرتان ومتساويتان، إذن \\((DC)\\parallel(AB)\\)، ومع \\(d_1\\parallel d_2\\) يكون \\(ABCD\\) متوازي أضلاع.",
  },
  plTrainTwoM: {
    title: "حساب قياس الزاوية M في حالتَي التوازي",
    detail: "في الشكل الأيمن: \\(\\widehat{M}=(180^\\circ-110^\\circ)+37^\\circ=107^\\circ\\)؛ وفي الشكل الأيسر: \\(180^\\circ-157^\\circ=23^\\circ\\) ثم \\(90^\\circ-23^\\circ=67^\\circ\\) و \\(\\widehat{M}=180^\\circ-67^\\circ=113^\\circ\\).",
  },
  plTrainTableX: {
    title: "تطبيق عملي: الطاولة القابلة للطي",
    detail: "سطح الطاولة موازٍ للأرض ورجلها على شكل متوازي أضلاع، إذن الزاويتان \\(40^\\circ\\) و \\(x^\\circ\\) متكاملتان ومنه \\(x^\\circ=140^\\circ\\).",
  },
};

export default function ParallelLinesFigure({ kind }: { kind: ParallelFigureKind }) {
  const m = META[kind];
  return (
    <FigureFrame kind={kind} title={m.title} detail={m.detail}>
      <ParallelLinesSvg kind={kind} />
    </FigureFrame>
  );
}
