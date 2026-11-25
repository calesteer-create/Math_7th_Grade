"use client";

import DiagramMath from "@/components/DiagramMath";
import FigureFrame from "@/components/figures/FigureFrame";
import {
  lerp,
  pt,
  svgAngleArc,
  svgParallelArrow,
  svgPoints,
  svgTickMarks,
  toSvg,
  type Pt,
  type SvgViewport,
} from "@/lib/geometry-core";
import {
  BOOK_PARALLELOGRAM_ABCD,
  DOUBLE_PARALLELOGRAM_EXAMPLE,
  IDENTIFY_FIVE_SHAPES,
  SYMMETRY_PROOF_BCDH,
  TRAIN_CENTER_G,
  TRAIN_COORD_OBCD,
  UNIT_LAUNCH_ANGLES,
  UNIT_LAUNCH_QUAD,
  UNIT_LAUNCH_Z,
  type ParallelogramFigureKind,
} from "@/lib/parallelogram-symmetry";

function TickGroup({ a, b, count = 1, t = 0.5, color = "#e11d48" }: {
  a: Pt; b: Pt; count?: 1 | 2; t?: number; color?: string;
}) {
  return <>
    {svgTickMarks(a, b, count, t).map(([p1, p2], i) => (
      <line key={i} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={color} strokeWidth={2} strokeLinecap="round" />
    ))}
  </>;
}

function UnitLaunchQuadSvg() {
  const vp: SvgViewport = { originX: 115, originY: 195, scale: 56 };
  const M = toSvg(UNIT_LAUNCH_QUAD.M, vp);
  const B = toSvg(UNIT_LAUNCH_QUAD.B, vp);
  const C = toSvg(UNIT_LAUNCH_QUAD.C, vp);
  const T = toSvg(UNIT_LAUNCH_QUAD.T, vp);
  return (
    <svg viewBox="0 0 420 230" className="mx-auto block w-full max-w-[420px]" role="img" aria-label="الشكل الرباعي MTCB مع قطريه BT و MC">
      <polygon points={svgPoints([M, B, C, T])} fill="#eff6ff" stroke="#1e3a8a" strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={B.x} y1={B.y} x2={T.x} y2={T.y} stroke="#0f766e" strokeWidth={1.8} strokeDasharray="6 4" />
      <line x1={M.x} y1={M.y} x2={C.x} y2={C.y} stroke="#d97706" strokeWidth={1.8} strokeDasharray="6 4" />
      {[M, B, C, T].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1e3a8a" />)}
      <DiagramMath tex="M" x={M.x - 28} y={M.y - 24} width={28} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="B" x={B.x + 8} y={B.y - 22} width={28} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="C" x={C.x + 8} y={C.y - 6} width={28} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="T" x={T.x - 26} y={T.y - 6} width={28} height={24} fontSize={16} color="#1e3a8a" />
    </svg>
  );
}

function UnitLaunchAnglesSvg() {
  const { fig1, fig2, fig3 } = UNIT_LAUNCH_ANGLES;
  const vp1: SvgViewport = { originX: 35, originY: 112, scale: 42 };
  const vp2: SvgViewport = { originX: 315, originY: 152, scale: 38 };
  const vp3: SvgViewport = { originX: 525, originY: 148, scale: 36 };

  const f1v1 = toSvg(fig1.v1, vp1);
  const f1t = toSvg(fig1.rayTop, vp1);
  const f1m = toSvg(fig1.rayMid, vp1);
  const f1v2 = toSvg(fig1.v2, vp1);
  const f1d = toSvg(fig1.rayDown, vp1);

  const f2v = toSvg(fig2.v, vp2);
  const f2l1 = toSvg(fig2.rayL1, vp2);
  const f2l2 = toSvg(fig2.rayL2, vp2);
  const f2r1 = toSvg(fig2.rayR1, vp2);
  const f2r2 = toSvg(fig2.rayR2, vp2);

  const f3t = toSvg(fig3.vTop, vp3);
  const f3b = toSvg(fig3.vBot, vp3);
  const f3tl = toSvg(fig3.topLeft, vp3);
  const f3du = toSvg(fig3.diagUp, vp3);
  const f3dd = toSvg(fig3.diagDown, vp3);
  const f3br = toSvg(fig3.botRight, vp3);

  return (
    <svg viewBox="0 0 660 205" className="mx-auto block w-full max-w-[660px]" role="img" aria-label="ثلاثة أشكال لاختبار اشتراك زاويتين بالرأس">
      {/* الشكل 1 */}
      <rect x={8} y={10} width={196} height={184} rx={14} fill="#ffffff" stroke="#e2e8f0" />
      <text x={106} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>الشكل 1</text>
      <line x1={f1v1.x} y1={f1v1.y} x2={f1t.x} y2={f1t.y} stroke="#1d4ed8" strokeWidth={2.2} />
      <line x1={f1v1.x} y1={f1v1.y} x2={f1m.x} y2={f1m.y} stroke="#1d4ed8" strokeWidth={2.2} />
      <line x1={f1v2.x} y1={f1v2.y} x2={f1d.x} y2={f1d.y} stroke="#1d4ed8" strokeWidth={2.2} />
      <path d={svgAngleArc(f1t, f1v1, f1m, 22)} fill="none" stroke="#dc2626" strokeWidth={2} />
      <path d={svgAngleArc(f1t, f1v1, f1m, 27)} fill="none" stroke="#dc2626" strokeWidth={2} />
      <path d={svgAngleArc(f1m, f1v2, f1d, 20)} fill="none" stroke="#0d9488" strokeWidth={2} />
      <circle cx={f1v1.x} cy={f1v1.y} r={3.5} fill="#dc2626" />
      <circle cx={f1v2.x} cy={f1v2.y} r={3.5} fill="#0d9488" />

      {/* الشكل 2 */}
      <rect x={218} y={10} width={206} height={184} rx={14} fill="#f0fdf4" stroke="#86efac" strokeWidth={1.6} />
      <text x={321} y={32} textAnchor="middle" fill="#15803d" fontSize={13} fontWeight={800}>الشكل 2</text>
      {[f2l1, f2l2, f2r1, f2r2].map((p, i) => (
        <line key={i} x1={f2v.x} y1={f2v.y} x2={p.x} y2={p.y} stroke="#1d4ed8" strokeWidth={2.2} />
      ))}
      <path d={svgAngleArc(f2l1, f2v, f2l2, 24)} fill="none" stroke="#0d9488" strokeWidth={2} />
      <path d={svgAngleArc(f2r1, f2v, f2r2, 22)} fill="none" stroke="#dc2626" strokeWidth={2} />
      <path d={svgAngleArc(f2r1, f2v, f2r2, 27)} fill="none" stroke="#dc2626" strokeWidth={2} />
      <circle cx={f2v.x} cy={f2v.y} r={4.5} fill="#15803d" />

      {/* الشكل 3 */}
      <rect x={438} y={10} width={214} height={184} rx={14} fill="#ffffff" stroke="#e2e8f0" />
      <text x={545} y={32} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>الشكل 3</text>
      <line x1={f3t.x} y1={f3t.y} x2={f3tl.x} y2={f3tl.y} stroke="#1d4ed8" strokeWidth={2.2} />
      <line x1={f3dd.x} y1={f3dd.y} x2={f3du.x} y2={f3du.y} stroke="#1d4ed8" strokeWidth={2.2} />
      <line x1={f3b.x} y1={f3b.y} x2={f3br.x} y2={f3br.y} stroke="#1d4ed8" strokeWidth={2.2} />
      <path d={svgAngleArc(f3tl, f3t, f3b, 22)} fill="none" stroke="#dc2626" strokeWidth={2} />
      <path d={svgAngleArc(f3tl, f3t, f3b, 27)} fill="none" stroke="#dc2626" strokeWidth={2} />
      <path d={svgAngleArc(f3t, f3b, f3br, 22)} fill="none" stroke="#0d9488" strokeWidth={2} />
      <circle cx={f3t.x} cy={f3t.y} r={3.5} fill="#dc2626" />
      <circle cx={f3b.x} cy={f3b.y} r={3.5} fill="#0d9488" />
    </svg>
  );
}

function UnitLaunchZSvg() {
  const vp: SvgViewport = { originX: 70, originY: 205, scale: 36 };
  const pts = UNIT_LAUNCH_Z.vertices.map(p => toSvg(p, vp));
  const center = toSvg(UNIT_LAUNCH_Z.center, vp);
  const grid = Array.from({ length: UNIT_LAUNCH_Z.gridSize + 1 }, (_, i) => i);
  return (
    <svg viewBox="0 0 320 230" className="mx-auto block w-full max-w-[320px]" role="img" aria-label="الحرف Z على شبكة متعامدة مع مركز تناظره">
      {grid.map(i => {
        const a = toSvg(pt(i, 0), vp);
        const b = toSvg(pt(i, 5), vp);
        const c = toSvg(pt(0, i), vp);
        const d = toSvg(pt(5, i), vp);
        return <g key={i}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
          <line x1={c.x} y1={c.y} x2={d.x} y2={d.y} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
        </g>;
      })}
      <polyline points={svgPoints(pts)} fill="none" stroke="#dc2626" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={center.x} cy={center.y} r={4.5} fill="#1e3a8a" stroke="#fff" strokeWidth={1.5} />
      <DiagramMath tex="O" x={center.x + 8} y={center.y - 16} width={24} height={24} fontSize={14} color="#1e3a8a" />
    </svg>
  );
}

function IdentifyFiveSvg() {
  return (
    <svg viewBox="0 0 690 285" className="mx-auto block w-full max-w-[690px]" role="img" aria-label="الأشكال الخمسة لتحديد متوازي الأضلاع مع تقاطع شريطين">
      {IDENTIFY_FIVE_SHAPES.map((shape, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const boxX = 12 + col * 224;
        const boxY = 10 + row * 136;
        const vp: SvgViewport = { originX: boxX + 34, originY: boxY + 108, scale: 36 };
        const pts = shape.vertices.map(p => toSvg(p, vp));
        return (
          <g key={shape.id}>
            <rect x={boxX} y={boxY} width={212} height={124} rx={14} fill="#ffffff" stroke="#cbd5e1" />
            <text x={boxX + 106} y={boxY + 23} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>{shape.label}</text>
            <polygon
              points={svgPoints(pts)}
              fill={idx === 4 ? "rgba(251,146,60,0.18)" : "rgba(59,130,246,0.12)"}
              stroke="#1d4ed8"
              strokeWidth={2.3}
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* الصندوق السادس: تقاطع شريطين متوازيين */}
      <g>
        <rect x={460} y={146} width={212} height={124} rx={14} fill="#fefce8" stroke="#fde047" />
        <text x={566} y={168} textAnchor="middle" fill="#854d0e" fontSize={12} fontWeight={800}>تقاطع شريطين متوازيين</text>
        {/* شريط أفقي */}
        <polygon points="478,200 654,200 654,238 478,238" fill="rgba(59,130,246,0.18)" stroke="#2563eb" strokeWidth={1.5} />
        {/* شريط مائل */}
        <polygon points="548,176 592,176 566,262 522,262" fill="rgba(234,179,8,0.22)" stroke="#ca8a04" strokeWidth={1.5} />
        {/* منطقة التقاطع (متوازي الأضلاع) */}
        <polygon points="540.7,200 584.7,200 573.3,238 529.3,238" fill="rgba(22,163,74,0.28)" stroke="#15803d" strokeWidth={2.4} />
      </g>
    </svg>
  );
}

function SymmetryProofSvg() {
  const vp: SvgViewport = { originX: 115, originY: 225, scale: 68 };
  const { B, C, D, H, M } = SYMMETRY_PROOF_BCDH;
  const pB = toSvg(B, vp);
  const pC = toSvg(C, vp);
  const pD = toSvg(D, vp);
  const pH = toSvg(H, vp);
  const pM = toSvg(M, vp);
  const dLeft = toSvg(pt(B.x - 1.15, B.y), vp);
  const dRight = toSvg(pt(C.x + 1.0, C.y), vp);
  const dpTop = toSvg(pt(C.x + 0.32, C.y + 0.5), vp);
  const dpBot = toSvg(pt(D.x - 0.35, D.y - 0.55), vp);

  return (
    <svg viewBox="0 0 560 275" className="mx-auto block w-full max-w-[560px]" role="img" aria-label="إثبات أن منتصف القطر M مركز تناظر لمتوازي الأضلاع BCDH">
      <polygon points={svgPoints([pB, pC, pD, pH])} fill="#eff6ff" stroke="#1e40af" strokeWidth={2.2} />
      {/* المستقيمان Δ و Δ' */}
      <line x1={dLeft.x} y1={dLeft.y} x2={dRight.x} y2={dRight.y} stroke="#dc2626" strokeWidth={2.4} />
      <line x1={dpTop.x} y1={dpTop.y} x2={dpBot.x} y2={dpBot.y} stroke="#dc2626" strokeWidth={2.4} />
      {/* القطر [BD] والقطر [CH] */}
      <line x1={pB.x} y1={pB.y} x2={pD.x} y2={pD.y} stroke="#0f766e" strokeWidth={2} />
      <line x1={pC.x} y1={pC.y} x2={pH.x} y2={pH.y} stroke="#6366f1" strokeWidth={1.6} strokeDasharray="5 4" />
      <TickGroup a={pB} b={pM} count={1} color="#0f766e" />
      <TickGroup a={pM} b={pD} count={1} color="#0f766e" />
      <path d={svgParallelArrow(pB, pC, 0.45)} fill="none" stroke="#1d4ed8" strokeWidth={2} />
      <path d={svgParallelArrow(pH, pD, 0.45)} fill="none" stroke="#1d4ed8" strokeWidth={2} />

      {[pB, pC, pD, pH].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1e3a8a" />)}
      <circle cx={pM.x} cy={pM.y} r={5} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />

      <DiagramMath tex="B" x={pB.x - 10} y={pB.y - 32} width={26} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="C" x={pC.x + 6} y={pC.y - 30} width={26} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="D" x={pD.x + 8} y={pD.y + 4} width={26} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="H" x={pH.x - 24} y={pH.y + 4} width={26} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="M" x={pM.x + 6} y={pM.y - 24} width={26} height={24} fontSize={15} color="#dc2626" />
      <DiagramMath tex="\Delta" x={dLeft.x - 6} y={dLeft.y - 28} width={26} height={24} fontSize={16} color="#dc2626" />
      <DiagramMath tex="\Delta'" x={dpTop.x + 6} y={dpTop.y - 10} width={28} height={24} fontSize={16} color="#dc2626" />
    </svg>
  );
}

function FourPropertiesSvg() {
  const { A, B, C, D, M } = BOOK_PARALLELOGRAM_ABCD;
  const panels = [
    { key: "p1", title: "التعريف ومركز التناظر", x: 10, y: 10 },
    { key: "p2", title: "القطران متناصفان", x: 350, y: 10 },
    { key: "p3", title: "الأضلاع المتقابلة متساوية", x: 10, y: 185 },
    { key: "p4", title: "الزوايا المتقابلة متساوية", x: 350, y: 185 },
  ] as const;

  return (
    <svg viewBox="0 0 680 355" className="mx-auto block w-full max-w-[680px]" role="img" aria-label="الخواص الأربع لمتوازي الأضلاع ABCD">
      {panels.map(panel => {
        const vp: SvgViewport = { originX: panel.x + 56, originY: panel.y + 136, scale: 42 };
        const pA = toSvg(A, vp);
        const pB = toSvg(B, vp);
        const pC = toSvg(C, vp);
        const pD = toSvg(D, vp);
        const pM = toSvg(M, vp);
        return (
          <g key={panel.key}>
            <rect x={panel.x} y={panel.y} width={320} height={162} rx={16} fill="#ffffff" stroke="#e2e8f0" />
            <text x={panel.x + 160} y={panel.y + 24} textAnchor="middle" fill="#1e3a8a" fontSize={13} fontWeight={800}>{panel.title}</text>
            <polygon points={svgPoints([pA, pB, pC, pD])} fill="#f8fafc" stroke="#1d4ed8" strokeWidth={2.2} strokeLinejoin="round" />

            {panel.key === "p1" && <>
              <path d={svgParallelArrow(pB, pA, 0.5)} fill="none" stroke="#0d9488" strokeWidth={2.2} />
              <path d={svgParallelArrow(pC, pD, 0.5)} fill="none" stroke="#0d9488" strokeWidth={2.2} />
              <path d={svgParallelArrow(pC, pB, 0.5)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
              <path d={svgParallelArrow(pD, pA, 0.5)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
              <line x1={pA.x} y1={pA.y} x2={pC.x} y2={pC.y} stroke="#94a3b8" strokeWidth={1.4} strokeDasharray="4 4" />
              <line x1={pB.x} y1={pB.y} x2={pD.x} y2={pD.y} stroke="#94a3b8" strokeWidth={1.4} strokeDasharray="4 4" />
              <circle cx={pM.x} cy={pM.y} r={4.5} fill="#dc2626" />
              <DiagramMath tex="M" x={pM.x + 4} y={pM.y - 22} width={24} height={22} fontSize={13} color="#dc2626" />
            </>}

            {panel.key === "p2" && <>
              <line x1={pA.x} y1={pA.y} x2={pC.x} y2={pC.y} stroke="#0f766e" strokeWidth={2} />
              <line x1={pB.x} y1={pB.y} x2={pD.x} y2={pD.y} stroke="#dc2626" strokeWidth={2} />
              <TickGroup a={pA} b={pM} count={2} color="#0f766e" />
              <TickGroup a={pM} b={pC} count={2} color="#0f766e" />
              <TickGroup a={pB} b={pM} count={1} color="#dc2626" />
              <TickGroup a={pM} b={pD} count={1} color="#dc2626" />
              <circle cx={pM.x} cy={pM.y} r={4} fill="#1e3a8a" />
              <DiagramMath tex="M" x={pM.x + 4} y={pM.y - 22} width={24} height={22} fontSize={13} color="#1e3a8a" />
            </>}

            {panel.key === "p3" && <>
              <TickGroup a={pA} b={pB} count={2} color="#0f766e" />
              <TickGroup a={pD} b={pC} count={2} color="#0f766e" />
              <TickGroup a={pB} b={pC} count={1} color="#dc2626" />
              <TickGroup a={pA} b={pD} count={1} color="#dc2626" />
            </>}

            {panel.key === "p4" && <>
              <path d={svgAngleArc(pB, pA, pD, 18)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
              <path d={svgAngleArc(pD, pC, pB, 18)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
              <path d={svgAngleArc(pC, pB, pA, 16)} fill="none" stroke="#0f766e" strokeWidth={2} />
              <path d={svgAngleArc(pC, pB, pA, 21)} fill="none" stroke="#0f766e" strokeWidth={2} />
              <path d={svgAngleArc(pA, pD, pC, 16)} fill="none" stroke="#0f766e" strokeWidth={2} />
              <path d={svgAngleArc(pA, pD, pC, 21)} fill="none" stroke="#0f766e" strokeWidth={2} />
            </>}

            <DiagramMath tex="A" x={pA.x + 5} y={pA.y - 16} width={22} height={22} fontSize={14} color="#1e3a8a" />
            <DiagramMath tex="B" x={pB.x - 22} y={pB.y - 16} width={22} height={22} fontSize={14} color="#1e3a8a" />
            <DiagramMath tex="C" x={pC.x - 22} y={pC.y - 6} width={22} height={22} fontSize={14} color="#1e3a8a" />
            <DiagramMath tex="D" x={pD.x + 5} y={pD.y - 6} width={22} height={22} fontSize={14} color="#1e3a8a" />
          </g>
        );
      })}
    </svg>
  );
}

function DoubleMidpointSvg() {
  const vp: SvgViewport = { originX: 75, originY: 185, scale: 72 };
  const { T, D, H, C, B } = DOUBLE_PARALLELOGRAM_EXAMPLE;
  const pT = toSvg(T, vp);
  const pD = toSvg(D, vp);
  const pH = toSvg(H, vp);
  const pC = toSvg(C, vp);
  const pB = toSvg(B, vp);

  return (
    <svg viewBox="0 0 520 225" className="mx-auto block w-full max-w-[520px]" role="img" aria-label="متوازيا الأضلاع BCTD و BCDH المشتركان في CB، و D منتصف HT">
      <polygon points={svgPoints([pB, pC, pT, pD])} fill="rgba(59,130,246,0.12)" stroke="#1d4ed8" strokeWidth={2.2} strokeLinejoin="round" />
      <polygon points={svgPoints([pB, pC, pD, pH])} fill="rgba(16,185,129,0.14)" stroke="#0f766e" strokeWidth={2.2} strokeLinejoin="round" />
      <line x1={pT.x} y1={pT.y} x2={pH.x} y2={pH.y} stroke="#1e293b" strokeWidth={2.6} />
      <line x1={pC.x} y1={pC.y} x2={pB.x} y2={pB.y} stroke="#dc2626" strokeWidth={2.8} />

      <TickGroup a={pC} b={pB} count={2} color="#dc2626" />
      <TickGroup a={pT} b={pD} count={2} color="#dc2626" />
      <TickGroup a={pD} b={pH} count={2} color="#dc2626" />
      <path d={svgParallelArrow(pC, pB, 0.35)} fill="none" stroke="#1d4ed8" strokeWidth={2} />
      <path d={svgParallelArrow(pT, pD, 0.35)} fill="none" stroke="#1d4ed8" strokeWidth={2} />
      <path d={svgParallelArrow(pD, pH, 0.35)} fill="none" stroke="#1d4ed8" strokeWidth={2} />

      {[pT, pH, pC, pB].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1e3a8a" />)}
      <circle cx={pD.x} cy={pD.y} r={5} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />

      <DiagramMath tex="C" x={pC.x - 18} y={pC.y - 26} width={24} height={22} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="B" x={pB.x + 6} y={pB.y - 26} width={24} height={22} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="T" x={pT.x - 22} y={pT.y + 4} width={24} height={22} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="D" x={pD.x - 10} y={pD.y + 8} width={24} height={22} fontSize={16} color="#dc2626" />
      <DiagramMath tex="H" x={pH.x + 6} y={pH.y + 4} width={24} height={22} fontSize={16} color="#1e3a8a" />
    </svg>
  );
}

function CheckAbcdSvg() {
  const vp: SvgViewport = { originX: 72, originY: 185, scale: 58 };
  const { A, B, C, D, M } = BOOK_PARALLELOGRAM_ABCD;
  const pA = toSvg(A, vp);
  const pB = toSvg(B, vp);
  const pC = toSvg(C, vp);
  const pD = toSvg(D, vp);
  const pM = toSvg(M, vp);
  return (
    <svg viewBox="0 0 440 220" className="mx-auto block w-full max-w-[440px]" role="img" aria-label="متوازي الأضلاع ABCD وقطراه AC و BD المتقاطعان في M">
      <polygon points={svgPoints([pA, pB, pC, pD])} fill="#eff6ff" stroke="#1d4ed8" strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={pA.x} y1={pA.y} x2={pC.x} y2={pC.y} stroke="#0f766e" strokeWidth={1.9} />
      <line x1={pB.x} y1={pB.y} x2={pD.x} y2={pD.y} stroke="#d97706" strokeWidth={1.9} />
      {[pA, pB, pC, pD].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1e3a8a" />)}
      <circle cx={pM.x} cy={pM.y} r={4.8} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />
      <DiagramMath tex="A" x={pA.x + 8} y={pA.y - 18} width={26} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="B" x={pB.x - 24} y={pB.y - 18} width={26} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="C" x={pC.x - 24} y={pC.y - 4} width={26} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="D" x={pD.x + 8} y={pD.y - 4} width={26} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="M" x={pM.x - 8} y={pM.y - 28} width={26} height={24} fontSize={15} color="#dc2626" />
    </svg>
  );
}

function CompleteCenterSvg({ showSolution = false }: { showSolution?: boolean }) {
  const vp: SvgViewport = { originX: 70, originY: 215, scale: 56 };
  const { A, B, C, D, G } = TRAIN_CENTER_G;
  const pA = toSvg(A, vp);
  const pB = toSvg(B, vp);
  const pC = toSvg(C, vp);
  const pD = toSvg(D, vp);
  const pG = toSvg(G, vp);
  return (
    <svg viewBox="0 0 430 245" className="mx-auto block w-full max-w-[430px]" role="img" aria-label="النقاط B و A ومركز متوازي الأضلاع G لإكمال النقطتين C و D">
      {showSolution && (
        <polygon points={svgPoints([pA, pB, pC, pD])} fill="rgba(16,185,129,0.12)" stroke="#0f766e" strokeWidth={2.2} strokeDasharray="5 4" />
      )}
      <line x1={pB.x} y1={pB.y} x2={pG.x} y2={pG.y} stroke="#1d4ed8" strokeWidth={2.3} />
      <line x1={pA.x} y1={pA.y} x2={pG.x} y2={pG.y} stroke="#1d4ed8" strokeWidth={2.3} />
      <line x1={pA.x} y1={pA.y} x2={pB.x} y2={pB.y} stroke="#64748b" strokeWidth={1.6} strokeDasharray="4 4" />
      {showSolution && <>
        <line x1={pG.x} y1={pG.y} x2={pC.x} y2={pC.y} stroke="#0f766e" strokeWidth={2} strokeDasharray="5 4" />
        <line x1={pG.x} y1={pG.y} x2={pD.x} y2={pD.y} stroke="#0f766e" strokeWidth={2} strokeDasharray="5 4" />
        <TickGroup a={pA} b={pG} count={1} color="#0f766e" />
        <TickGroup a={pG} b={pC} count={1} color="#0f766e" />
        <TickGroup a={pB} b={pG} count={2} color="#dc2626" />
        <TickGroup a={pG} b={pD} count={2} color="#dc2626" />
        <circle cx={pC.x} cy={pC.y} r={4.5} fill="#0f766e" />
        <circle cx={pD.x} cy={pD.y} r={4.5} fill="#0f766e" />
        <DiagramMath tex="C" x={pC.x - 24} y={pC.y - 18} width={24} height={24} fontSize={16} color="#0f766e" />
        <DiagramMath tex="D" x={pD.x + 8} y={pD.y - 18} width={24} height={24} fontSize={16} color="#0f766e" />
      </>}
      <circle cx={pB.x} cy={pB.y} r={4.5} fill="#1e3a8a" />
      <circle cx={pA.x} cy={pA.y} r={4.5} fill="#1e3a8a" />
      <circle cx={pG.x} cy={pG.y} r={5.2} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />
      <DiagramMath tex="B" x={pB.x - 24} y={pB.y - 4} width={24} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="A" x={pA.x + 8} y={pA.y - 6} width={24} height={24} fontSize={16} color="#1e3a8a" />
      <DiagramMath tex="G" x={pG.x - 26} y={pG.y - 24} width={24} height={24} fontSize={16} color="#dc2626" />
    </svg>
  );
}

function CoordGridSvg() {
  const vp: SvgViewport = { originX: 64, originY: 220, scale: 40 };
  const { O, B, C, D, G } = TRAIN_COORD_OBCD;
  const pO = toSvg(O, vp);
  const pB = toSvg(B, vp);
  const pC = toSvg(C, vp);
  const pD = toSvg(D, vp);
  const pG = toSvg(G, vp);
  const xs = Array.from({ length: 12 }, (_, i) => i);
  const ys = Array.from({ length: 6 }, (_, i) => i);

  return (
    <svg viewBox="0 0 545 268" className="mx-auto block w-full max-w-[545px]" role="img" aria-label="متوازي الأضلاع OBCD في المعلم المتعامد O(0,0) و B(8,1) و D(2,3) و C(10,4) ومركز التناظر G(5,2)">
      {xs.map(x => {
        const a = toSvg(pt(x, 0), vp);
        const b = toSvg(pt(x, 5), vp);
        return <g key={`x${x}`}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={x === 0 ? "#334155" : "#e2e8f0"} strokeWidth={x === 0 ? 2 : 1} />
          {x > 0 && <text x={a.x} y={a.y + 18} textAnchor="middle" fill="#475569" fontSize={11} fontWeight={700}>{x}</text>}
        </g>;
      })}
      {ys.map(y => {
        const a = toSvg(pt(0, y), vp);
        const b = toSvg(pt(11, y), vp);
        return <g key={`y${y}`}>
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={y === 0 ? "#334155" : "#e2e8f0"} strokeWidth={y === 0 ? 2 : 1} />
          {y > 0 && <text x={a.x - 14} y={a.y + 4} textAnchor="middle" fill="#475569" fontSize={11} fontWeight={700}>{y}</text>}
        </g>;
      })}
      <polygon points={svgPoints([pO, pB, pC, pD])} fill="rgba(37,99,235,0.12)" stroke="#1d4ed8" strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={pO.x} y1={pO.y} x2={pC.x} y2={pC.y} stroke="#0f172a" strokeWidth={1.6} strokeDasharray="5 4" />
      <line x1={pB.x} y1={pB.y} x2={pD.x} y2={pD.y} stroke="#0f172a" strokeWidth={1.6} strokeDasharray="5 4" />

      {[pO, pB, pC, pD].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="#1d4ed8" />)}
      <circle cx={pG.x} cy={pG.y} r={5} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />

      <DiagramMath tex="O" x={pO.x - 24} y={pO.y + 2} width={22} height={22} fontSize={15} color="#0f172a" />
      <DiagramMath tex="B" x={pB.x + 6} y={pB.y - 6} width={22} height={22} fontSize={15} color="#1d4ed8" />
      <DiagramMath tex="D" x={pD.x - 24} y={pD.y - 22} width={22} height={22} fontSize={15} color="#1d4ed8" />
      <DiagramMath tex="C" x={pC.x + 6} y={pC.y - 22} width={22} height={22} fontSize={15} color="#1d4ed8" />
      <DiagramMath tex="G" x={pG.x - 8} y={pG.y - 28} width={22} height={22} fontSize={15} color="#dc2626" />
      <DiagramMath tex="x" x={toSvg(pt(11.2, 0), vp).x} y={pO.y - 12} width={20} height={22} fontSize={14} color="#334155" />
      <DiagramMath tex="y" x={pO.x - 22} y={toSvg(pt(0, 5.2), vp).y} width={20} height={22} fontSize={14} color="#334155" />
    </svg>
  );
}

export function ParallelogramSvg({ kind, showSolution = false }: { kind: ParallelogramFigureKind; showSolution?: boolean }) {
  switch (kind) {
    case "pgramUnitLaunchQuad": return <UnitLaunchQuadSvg />;
    case "pgramUnitLaunchAngles": return <UnitLaunchAnglesSvg />;
    case "pgramUnitLaunchZ": return <UnitLaunchZSvg />;
    case "pgramIdentifyFive": return <IdentifyFiveSvg />;
    case "pgramSymmetryProof": return <SymmetryProofSvg />;
    case "pgramFourProperties": return <FourPropertiesSvg />;
    case "pgramDoubleMidpoint": return <DoubleMidpointSvg />;
    case "pgramCheckAbcd": return <CheckAbcdSvg />;
    case "pgramCompleteCenter": return <CompleteCenterSvg showSolution={showSolution} />;
    case "pgramCoordGrid": return <CoordGridSvg />;
  }
}

const META: Record<ParallelogramFigureKind, { title: string; detail: string }> = {
  pgramUnitLaunchQuad: {
    title: "الرباعي MTCB وقطراه [BT] و [MC]",
    detail: "لتسمية شكل رباعي نتّبع رؤوسه بالترتيب الدوري (مع أو عكس عقارب الساعة)، والقطران يصلان كل رأسين غير متجاورين.",
  },
  pgramUnitLaunchAngles: {
    title: "متى تشترك زاويتان بالرأس؟",
    detail: "في الشكل 2 فقط تنطلق أضلاع الزاويتين من الرأس نفسه، بينما في الشكلين 1 و 3 لكل زاوية رأس مختلف.",
  },
  pgramUnitLaunchZ: {
    title: "التناظر المركزي للحرف Z على الشبكة",
    detail: "بدوران الحرف \\(Z\\) نصف دورة (\\(180^\\circ\\)) حول النقطة \\(O\\) ينطبق على نفسه، لكنه لا يقبل محور تناظر.",
  },
  pgramIdentifyFive: {
    title: "تمييز متوازيات الأضلاع وتقاطع شريطين",
    detail: "الشكلان 3 (المستطيل) و 4 هما متوازيا أضلاع؛ وتقاطع أي شريطين متوازيَي الحافّتين ينتج دائمًا متوازي أضلاع.",
  },
  pgramSymmetryProof: {
    title: "إثبات مركز التناظر M في متوازي الأضلاع BCDH",
    detail: "النقطة \\(M\\) منتصف \\([BD]\\) تحوّل المستقيم \\(\\Delta\\) إلى \\((HD)\\) والمستقيم \\(\\Delta'\\) إلى \\((BH)\\)، فتكون \\(H\\) نظيرة \\(C\\) بالنسبة إلى \\(M\\).",
  },
  pgramFourProperties: {
    title: "الخواص الأربع لمتوازي الأضلاع ABCD",
    detail: "تقاطع القطرين هو مركز تناظر؛ القطران متناصفان؛ كل ضلعين متقابلين متساويان؛ وكل زاويتين متقابلتين متساويتان.",
  },
  pgramDoubleMidpoint: {
    title: "برهان منتصف قطعة باستعمال متوازيَي أضلاع",
    detail: "بما أن \\(BCDH\\) و \\(BCTD\\) متوازيا أضلاع يشتركان بالضلع \\([CB]\\)، فإن \\((HD)\\parallel(CB)\\) و \\((DT)\\parallel(CB)\\) و \\(HD=CB=DT\\)، إذن \\(D\\) منتصف \\([HT]\\).",
  },
  pgramCheckAbcd: {
    title: "متوازي الأضلاع ABCD وتقاطع قطريه في M",
    detail: "من الشكل نستنتج توازي الأضلاع المتقابلة، وتساوي الأضلاع المتقابلة وأنصاف الأقطار، وتساوي الزوايا المتقابلة.",
  },
  pgramCompleteCenter: {
    title: "إكمال متوازي الأضلاع بمعرفة رأسيْن ومركزه G",
    detail: "المركز \\(G\\) منتصف كلٍّ من القطرين \\([AC]\\) و \\([BD]\\)، لذا نعيّن \\(C\\) نظيرة \\(A\\) و \\(D\\) نظيرة \\(B\\) بالنسبة إلى \\(G\\).",
  },
  pgramCoordGrid: {
    title: "متوازي الأضلاع OBCD في المعلم المتعامد",
    detail: "للنقاط \\(O(0,0)\\) و \\(B(8,1)\\) و \\(D(2,3)\\) نحصل على \\(C(10,4)\\) ومركز التناظر \\(G(5,2)\\)؛ لاحظ أن \\(C=B+D\\) و \\(G=\\frac{B+D}{2}\\).",
  },
};

export default function ParallelogramFigure({ kind }: { kind: ParallelogramFigureKind }) {
  const m = META[kind];
  return (
    <FigureFrame kind={kind} title={m.title} detail={m.detail}>
      <ParallelogramSvg kind={kind} showSolution={kind === "pgramCompleteCenter" ? false : true} />
    </FigureFrame>
  );
}

// إعادة تصدير lerp للاستخدام في الاستوديو عند الحاجة
export { lerp };
