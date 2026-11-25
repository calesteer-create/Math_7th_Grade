"use client";

import { useState } from "react";
import DiagramMath from "@/components/DiagramMath";
import TeX from "@/components/TeX";
import {
  pt,
  rotatePoint,
  svgAngleArc,
  svgParallelArrow,
  svgPoints,
  svgTickMarks,
  toSvg,
  type SvgViewport,
} from "@/lib/geometry-core";
import {
  buildParallelogramFromSidesAngle,
  completeParallelogramFromCenter,
  coordinateParallelogram,
  type ParallelogramStudioMode,
} from "@/lib/parallelogram-symmetry";

type Tab = "explore" | "strips" | "complete" | "coord";

const TABS: { id: Tab; label: string }[] = [
  { id: "explore", label: "مستكشف التناظر والخواص" },
  { id: "strips", label: "تقاطع شريطين" },
  { id: "complete", label: "إكمال متوازي الأضلاع بالمركز" },
  { id: "coord", label: "المعلم المتعامد" },
];

export default function ParallelogramStudio({ mode = "full" }: { mode?: ParallelogramStudioMode }) {
  const initialTab: Tab = mode === "full" ? "explore" : mode;
  const [tab, setTab] = useState<Tab>(initialTab);

  // تبويب 1: مستكشف متوازي الأضلاع + دوران 180° حول M
  const [sideA, setSideA] = useState(5);
  const [sideB, setSideB] = useState(3.4);
  const [angleC, setAngleC] = useState(64);
  const [rotDeg, setRotDeg] = useState(0);

  // تبويب 2: تقاطع شريطين متوازيين
  const [stripW1, setStripW1] = useState(1.8);
  const [stripW2, setStripW2] = useState(2.2);
  const [stripAngle, setStripAngle] = useState(62);

  // تبويب 3: إكمال متوازي الأضلاع بمركزه G
  const [ax, setAx] = useState(5);
  const [ay, setAy] = useState(1);
  const [bx, setBx] = useState(1);
  const [by, setBy] = useState(1);
  const [gx, setGx] = useState(4);
  const [gy, setGy] = useState(3);
  const [showReflected, setShowReflected] = useState(true);

  // تبويب 4: المعلم المتعامد OBCD (الافتراضي من الكتاب B(8,1), D(2,3))
  const [coordBx, setCoordBx] = useState(8);
  const [coordBy, setCoordBy] = useState(1);
  const [coordDx, setCoordDx] = useState(2);
  const [coordDy, setCoordDy] = useState(3);

  const activeTab: Tab = mode === "full" ? tab : mode;

  // حسابات تبويب 1
  const pg = buildParallelogramFromSidesAngle(sideA, sideB, angleC);
  const vp1: SvgViewport = { originX: 110, originY: 220, scale: 36 };
  const pA = toSvg(pg.A, vp1), pB = toSvg(pg.B, vp1), pC = toSvg(pg.C, vp1), pD = toSvg(pg.D, vp1), pM = toSvg(pg.M, vp1);
  const rotPts = [pg.A, pg.B, pg.C, pg.D].map(p => toSvg(rotatePoint(p, pg.M, rotDeg), vp1));

  // حسابات تبويب 2
  const stripRad = (stripAngle * Math.PI) / 180;
  const sinS = Math.sin(stripRad);
  const cosS = Math.cos(stripRad);
  const sideOnH = stripW2 / sinS;
  const sideOnTilt = stripW1 / sinS;
  const spC = pt(0, 0);
  const spD = pt(sideOnH, 0);
  const spB = pt(sideOnTilt * cosS, stripW1);
  const spA = pt(spD.x + spB.x, stripW1);
  const vp2: SvgViewport = { originX: 170, originY: 205, scale: 42 };
  const sA = toSvg(spA, vp2), sB = toSvg(spB, vp2), sC = toSvg(spC, vp2), sD = toSvg(spD, vp2);

  // حسابات تبويب 3
  const comp = completeParallelogramFromCenter(pt(ax, ay), pt(bx, by), pt(gx, gy));
  const vp3: SvgViewport = { originX: 55, originY: 235, scale: 26 };

  // حسابات تبويب 4
  const crd = coordinateParallelogram(pt(coordBx, coordBy), pt(coordDx, coordDy));
  const vp4: SvgViewport = { originX: 52, originY: 230, scale: 27 };

  return (
    <section
      data-studio="parallelogram"
      aria-label="مختبر متوازي الأضلاع ومركز التناظر"
      className="rounded-[24px] border border-indigo-200 bg-gradient-to-b from-indigo-50/55 via-white to-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-4">
        <div>
          <p className="text-xs font-extrabold text-indigo-600">مختبر هندسي تفاعلي · القيود الهندسية محفوظة دائمًا</p>
          <h3 className="mt-0.5 text-lg font-extrabold text-[#1e2d52]">مختبر متوازي الأضلاع ومركز التناظر</h3>
        </div>
        {mode === "full" && (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="أقسام مختبر متوازي الأضلاع">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                  activeTab === t.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* التبويب 1: المستكشف التفاعلي والدوران 180° */}
      {activeTab === "explore" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 470 265" className="mx-auto block w-full max-w-[470px]" role="img" aria-label="متوازي أضلاع تفاعلي مع تدوير مركزي حول M">
              <polygon points={svgPoints([pA, pB, pC, pD])} fill="rgba(59,130,246,0.12)" stroke="#1d4ed8" strokeWidth={2.5} strokeLinejoin="round" />
              {rotDeg > 0 && (
                <polygon
                  points={svgPoints(rotPts)}
                  fill="rgba(220,38,38,0.12)"
                  stroke="#dc2626"
                  strokeWidth={2.2}
                  strokeDasharray="6 4"
                  strokeLinejoin="round"
                />
              )}
              <line x1={pA.x} y1={pA.y} x2={pC.x} y2={pC.y} stroke="#0f766e" strokeWidth={1.8} />
              <line x1={pB.x} y1={pB.y} x2={pD.x} y2={pD.y} stroke="#d97706" strokeWidth={1.8} />
              <path d={svgParallelArrow(pB, pA, 0.5)} fill="none" stroke="#1d4ed8" strokeWidth={2.2} />
              <path d={svgParallelArrow(pC, pD, 0.5)} fill="none" stroke="#1d4ed8" strokeWidth={2.2} />
              <path d={svgAngleArc(pB, pC, pD, 22)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
              <path d={svgAngleArc(pD, pA, pB, 22)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
              {svgTickMarks(pA, pM, 2).map(([u, v], i) => <line key={`am${i}`} x1={u.x} y1={u.y} x2={v.x} y2={v.y} stroke="#0f766e" strokeWidth={2} />)}
              {svgTickMarks(pM, pC, 2).map(([u, v], i) => <line key={`mc${i}`} x1={u.x} y1={u.y} x2={v.x} y2={v.y} stroke="#0f766e" strokeWidth={2} />)}
              {svgTickMarks(pB, pM, 1).map(([u, v], i) => <line key={`bm${i}`} x1={u.x} y1={u.y} x2={v.x} y2={v.y} stroke="#d97706" strokeWidth={2} />)}
              {svgTickMarks(pM, pD, 1).map(([u, v], i) => <line key={`md${i}`} x1={u.x} y1={u.y} x2={v.x} y2={v.y} stroke="#d97706" strokeWidth={2} />)}
              {[pA, pB, pC, pD].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4.2} fill="#1e3a8a" />)}
              <circle cx={pM.x} cy={pM.y} r={5.2} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />

              <DiagramMath tex="A" x={pA.x + 6} y={pA.y - 22} width={24} height={22} fontSize={15} color="#1e3a8a" />
              <DiagramMath tex="B" x={pB.x - 24} y={pB.y - 22} width={24} height={22} fontSize={15} color="#1e3a8a" />
              <DiagramMath tex="C" x={pC.x - 24} y={pC.y - 4} width={24} height={22} fontSize={15} color="#1e3a8a" />
              <DiagramMath tex="D" x={pD.x + 6} y={pD.y - 4} width={24} height={22} fontSize={15} color="#1e3a8a" />
              <DiagramMath tex="M" x={pM.x + 4} y={pM.y - 26} width={24} height={22} fontSize={14} color="#dc2626" />
            </svg>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                طول الضلعين المتقابلين <TeX tex="AB = DC" />: <span className="text-indigo-700" dir="ltr">{sideA.toFixed(1)}</span>
                <input type="range" min={3} max={7} step={0.2} value={sideA} onChange={e => setSideA(Number(e.target.value))} className="mt-1 w-full accent-indigo-600" />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                طول الضلعين المتقابلين <TeX tex="BC = AD" />: <span className="text-indigo-700" dir="ltr">{sideB.toFixed(1)}</span>
                <input type="range" min={2.2} max={4.6} step={0.2} value={sideB} onChange={e => setSideB(Number(e.target.value))} className="mt-1 w-full accent-indigo-600" />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                قياس الزاوية <TeX tex="\widehat{C}" />: <span className="text-indigo-700" dir="ltr">{angleC}°</span>
                <input type="range" min={38} max={135} step={1} value={angleC} onChange={e => setAngleC(Number(e.target.value))} className="mt-1 w-full accent-indigo-600" />
              </label>
              <label className="block text-xs font-bold text-rose-700">
                اختبار التناظر المركزي حول <TeX tex="M" /> (دوران <span dir="ltr">{rotDeg}°</span>):
                <input type="range" min={0} max={180} step={5} value={rotDeg} onChange={e => setRotDeg(Number(e.target.value))} className="mt-1 w-full accent-rose-600" />
              </label>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-6 text-slate-800 space-y-1.5">
              <p className="font-extrabold text-emerald-800">القياسات الحية (متطابقة دائمًا مع الرسم):</p>
              <p>• الأضلاع: <TeX tex={`AB = DC = ${pg.ab.toFixed(1)}`} /> ، <TeX tex={`BC = AD = ${pg.bc.toFixed(1)}`} /></p>
              <p>• أنصاف الأقطار: <TeX tex={`MA = MC = ${pg.ma.toFixed(2)}`} /> ، <TeX tex={`MB = MD = ${pg.mb.toFixed(2)}`} /></p>
              <p>• الزوايا: <TeX tex={`\\widehat{A}=\\widehat{C}=${pg.angleC.toFixed(0)}^\\circ`} /> ، <TeX tex={`\\widehat{B}=\\widehat{D}=${pg.angleB.toFixed(0)}^\\circ`} /></p>
              {rotDeg === 180 && (
                <p className="rounded-lg bg-white/90 px-2.5 py-1 font-extrabold text-rose-700">
                  انطبق متوازي الأضلاع تمامًا على نفسه عند <TeX tex="180^\circ" />: إذن <TeX tex="M" /> مركز تناظر!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* التبويب 2: تقاطع شريطين متوازيين */}
      {activeTab === "strips" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 470 250" className="mx-auto block w-full max-w-[470px]" role="img" aria-label="تقاطع شريطين متوازيي الحافتين ينتج متوازي أضلاع">
              {/* الشريط الأفقي */}
              <rect x={16} y={sA.y} width={438} height={sC.y - sA.y} fill="rgba(59,130,246,0.16)" stroke="#2563eb" strokeWidth={1.6} />
              {/* الشريط المائل */}
              {(() => {
                const dx = (spB.x - spC.x) * 1.4;
                const dy = (spB.y - spC.y) * 1.4;
                const e1 = toSvg(pt(spC.x - dx, spC.y - dy), vp2);
                const e2 = toSvg(pt(spD.x - dx, spD.y - dy), vp2);
                const e3 = toSvg(pt(spA.x + dx, spA.y + dy), vp2);
                const e4 = toSvg(pt(spB.x + dx, spB.y + dy), vp2);
                return <polygon points={svgPoints([e1, e2, e3, e4])} fill="rgba(234,179,8,0.18)" stroke="#ca8a04" strokeWidth={1.6} />;
              })()}
              {/* متوازي الأضلاع الناتج */}
              <polygon points={svgPoints([sA, sB, sC, sD])} fill="rgba(16,185,129,0.28)" stroke="#0f766e" strokeWidth={2.8} strokeLinejoin="round" />
              <path d={svgParallelArrow(sB, sA, 0.5)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
              <path d={svgParallelArrow(sC, sD, 0.5)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
            </svg>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                عرض الشريط الأول: <span className="text-indigo-700" dir="ltr">{stripW1.toFixed(1)}</span>
                <input type="range" min={1.2} max={2.6} step={0.1} value={stripW1} onChange={e => setStripW1(Number(e.target.value))} className="mt-1 w-full accent-indigo-600" />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                عرض الشريط الثاني: <span className="text-indigo-700" dir="ltr">{stripW2.toFixed(1)}</span>
                <input type="range" min={1.2} max={2.8} step={0.1} value={stripW2} onChange={e => setStripW2(Number(e.target.value))} className="mt-1 w-full accent-indigo-600" />
              </label>
              <label className="block text-xs font-bold text-slate-700">
                زاوية تقاطع الشريطين: <span className="text-indigo-700" dir="ltr">{stripAngle}°</span>
                <input type="range" min={40} max={135} step={1} value={stripAngle} onChange={e => setStripAngle(Number(e.target.value))} className="mt-1 w-full accent-indigo-600" />
              </label>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/75 p-4 text-xs leading-6 text-slate-800 space-y-1">
              <p className="font-extrabold text-amber-900">الاستنتاج الهندسي:</p>
              <p>كل حافّتين متقابلتين تنتميان إلى شريط واحد متوازي الحافّتين، لذا فإن منطقة التقاطع دائمًا <strong>متوازي أضلاع</strong>!</p>
              <p>طولا ضلعيه المتجاورين: <TeX tex={`${sideOnH.toFixed(2)}`} /> و <TeX tex={`${sideOnTilt.toFixed(2)}`} /> (تتساوى الأطوال تمامًا عندما يتساوى عرضا الشريطين ← معيّن، وعند <TeX tex="90^\circ" /> ← مستطيل!).</p>
            </div>
          </div>
        </div>
      )}

      {/* التبويب 3: إكمال متوازي الأضلاع بالمركز G */}
      {activeTab === "complete" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 380 265" className="mx-auto block w-full max-w-[380px]" role="img" aria-label="إكمال متوازي الأضلاع ABCD من الرأسين A و B والمركز G">
              {Array.from({ length: 11 }, (_, i) => {
                const x1 = toSvg(pt(i, 0), vp3), x2 = toSvg(pt(i, 8), vp3);
                return <line key={`gx${i}`} x1={x1.x} y1={x1.y} x2={x2.x} y2={x2.y} stroke="#e2e8f0" strokeWidth={1} />;
              })}
              {Array.from({ length: 9 }, (_, i) => {
                const y1 = toSvg(pt(0, i), vp3), y2 = toSvg(pt(10, i), vp3);
                return <line key={`gy${i}`} x1={y1.x} y1={y1.y} x2={y2.x} y2={y2.y} stroke="#e2e8f0" strokeWidth={1} />;
              })}
              {(() => {
                const qA = toSvg(comp.A, vp3), qB = toSvg(comp.B, vp3), qC = toSvg(comp.C, vp3), qD = toSvg(comp.D, vp3), qG = toSvg(comp.G, vp3);
                return <>
                  {showReflected && comp.valid && (
                    <polygon points={svgPoints([qA, qB, qC, qD])} fill="rgba(16,185,129,0.16)" stroke="#0f766e" strokeWidth={2.4} strokeLinejoin="round" />
                  )}
                  <line x1={qA.x} y1={qA.y} x2={qG.x} y2={qG.y} stroke="#1d4ed8" strokeWidth={2} />
                  <line x1={qB.x} y1={qB.y} x2={qG.x} y2={qG.y} stroke="#1d4ed8" strokeWidth={2} />
                  {showReflected && <>
                    <line x1={qG.x} y1={qG.y} x2={qC.x} y2={qC.y} stroke="#0f766e" strokeWidth={2} strokeDasharray="5 4" />
                    <line x1={qG.x} y1={qG.y} x2={qD.x} y2={qD.y} stroke="#0f766e" strokeWidth={2} strokeDasharray="5 4" />
                    <circle cx={qC.x} cy={qC.y} r={4.5} fill="#0f766e" />
                    <circle cx={qD.x} cy={qD.y} r={4.5} fill="#0f766e" />
                    <DiagramMath tex="C" x={qC.x + 6} y={qC.y - 18} width={22} height={22} fontSize={14} color="#0f766e" />
                    <DiagramMath tex="D" x={qD.x + 6} y={qD.y - 18} width={22} height={22} fontSize={14} color="#0f766e" />
                  </>}
                  <circle cx={qA.x} cy={qA.y} r={4.5} fill="#1e3a8a" />
                  <circle cx={qB.x} cy={qB.y} r={4.5} fill="#1e3a8a" />
                  <circle cx={qG.x} cy={qG.y} r={5} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />
                  <DiagramMath tex="A" x={qA.x + 6} y={qA.y - 6} width={22} height={22} fontSize={14} color="#1e3a8a" />
                  <DiagramMath tex="B" x={qB.x - 22} y={qB.y - 6} width={22} height={22} fontSize={14} color="#1e3a8a" />
                  <DiagramMath tex="G" x={qG.x + 6} y={qG.y - 20} width={22} height={22} fontSize={14} color="#dc2626" />
                </>;
              })()}
            </svg>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <label>إحداثي <TeX tex="x_A" />: {ax}<input type="range" min={2} max={7} value={ax} onChange={e => setAx(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                <label>إحداثي <TeX tex="y_A" />: {ay}<input type="range" min={0} max={3} value={ay} onChange={e => setAy(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                <label>إحداثي <TeX tex="x_B" />: {bx}<input type="range" min={0} max={4} value={bx} onChange={e => setBx(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                <label>إحداثي <TeX tex="y_B" />: {by}<input type="range" min={0} max={3} value={by} onChange={e => setBy(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                <label>مركز <TeX tex="x_G" />: {gx}<input type="range" min={3} max={6} value={gx} onChange={e => setGx(Number(e.target.value))} className="w-full accent-rose-600" /></label>
                <label>مركز <TeX tex="y_G" />: {gy}<input type="range" min={2} max={5} value={gy} onChange={e => setGy(Number(e.target.value))} className="w-full accent-rose-600" /></label>
              </div>
              <button
                type="button"
                onClick={() => setShowReflected(v => !v)}
                className="w-full rounded-xl bg-indigo-600 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-indigo-700"
              >
                {showReflected ? "إخفاء النقطتين C و D (للتخمين)" : "إظهار النقطتين C و D بالتناظر حول G"}
              </button>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-6 text-slate-800 space-y-1">
              <p className="font-extrabold text-emerald-800">قاعدة التناظر المركزي حول <TeX tex="G" />:</p>
              <p>• <TeX tex={`C = (2x_G - x_A,\\, 2y_G - y_A) = (${comp.C.x},\\, ${comp.C.y})`} /></p>
              <p>• <TeX tex={`D = (2x_G - x_B,\\, 2y_G - y_B) = (${comp.D.x},\\, ${comp.D.y})`} /></p>
              {!comp.valid && <p className="font-bold text-rose-700">ملاحظة: النقاط <TeX tex="A, B, G" /> على استقامة واحدة — غيّر موضع إحداها ليتشكّل متوازي أضلاع.</p>}
            </div>
          </div>
        </div>
      )}

      {/* التبويب 4: المعلم المتعامد OBCD */}
      {activeTab === "coord" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 430 265" className="mx-auto block w-full max-w-[430px]" role="img" aria-label="متوازي الأضلاع OBCD في المعلم المتعامد مع حساب إحداثيي C و G">
              {Array.from({ length: 14 }, (_, i) => {
                const a = toSvg(pt(i, 0), vp4), b = toSvg(pt(i, 8), vp4);
                return <g key={`cx${i}`}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={i === 0 ? "#334155" : "#e2e8f0"} strokeWidth={i === 0 ? 2 : 1} />
                  {i > 0 && i % 2 === 0 && <text x={a.x} y={a.y + 16} textAnchor="middle" fill="#64748b" fontSize={10}>{i}</text>}
                </g>;
              })}
              {Array.from({ length: 9 }, (_, i) => {
                const a = toSvg(pt(0, i), vp4), b = toSvg(pt(13, i), vp4);
                return <g key={`cy${i}`}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={i === 0 ? "#334155" : "#e2e8f0"} strokeWidth={i === 0 ? 2 : 1} />
                  {i > 0 && <text x={a.x - 12} y={a.y + 4} textAnchor="middle" fill="#64748b" fontSize={10}>{i}</text>}
                </g>;
              })}
              {(() => {
                const cO = toSvg(crd.O, vp4), cB = toSvg(crd.B, vp4), cC = toSvg(crd.C, vp4), cD = toSvg(crd.D, vp4), cG = toSvg(crd.G, vp4);
                return <>
                  <polygon points={svgPoints([cO, cB, cC, cD])} fill="rgba(37,99,235,0.14)" stroke="#1d4ed8" strokeWidth={2.4} strokeLinejoin="round" />
                  <line x1={cO.x} y1={cO.y} x2={cC.x} y2={cC.y} stroke="#475569" strokeWidth={1.5} strokeDasharray="5 4" />
                  <line x1={cB.x} y1={cB.y} x2={cD.x} y2={cD.y} stroke="#475569" strokeWidth={1.5} strokeDasharray="5 4" />
                  {[cO, cB, cC, cD].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4.2} fill="#1d4ed8" />)}
                  <circle cx={cG.x} cy={cG.y} r={5} fill="#dc2626" stroke="#fff" strokeWidth={1.5} />
                  <DiagramMath tex="O" x={cO.x - 20} y={cO.y + 2} width={22} height={20} fontSize={13} color="#0f172a" />
                  <DiagramMath tex="B" x={cB.x + 5} y={cB.y - 4} width={22} height={20} fontSize={13} color="#1d4ed8" />
                  <DiagramMath tex="D" x={cD.x - 20} y={cD.y - 18} width={22} height={20} fontSize={13} color="#1d4ed8" />
                  <DiagramMath tex="C" x={cC.x + 5} y={cC.y - 18} width={22} height={20} fontSize={13} color="#1d4ed8" />
                  <DiagramMath tex="G" x={cG.x - 4} y={cG.y - 24} width={22} height={20} fontSize={13} color="#dc2626" />
                </>;
              })()}
            </svg>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-2">
                <label><TeX tex="x_B" />: {coordBx}<input type="range" min={2} max={8} value={coordBx} onChange={e => setCoordBx(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                <label><TeX tex="y_B" />: {coordBy}<input type="range" min={0} max={3} value={coordBy} onChange={e => setCoordBy(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                <label><TeX tex="x_D" />: {coordDx}<input type="range" min={1} max={5} value={coordDx} onChange={e => setCoordDx(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
                <label><TeX tex="y_D" />: {coordDy}<input type="range" min={2} max={5} value={coordDy} onChange={e => setCoordDy(Number(e.target.value))} className="w-full accent-indigo-600" /></label>
              </div>
              <button
                type="button"
                onClick={() => { setCoordBx(8); setCoordBy(1); setCoordDx(2); setCoordDy(3); }}
                className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-extrabold text-indigo-700 hover:bg-indigo-100"
              >
                إعادة ضبط إلى مثال الكتاب: <TeX tex="B(8,1),\, D(2,3)" />
              </button>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-6 text-slate-800 space-y-1">
              <p className="font-extrabold text-emerald-800">العلاقات الإحداثية الدقيقة:</p>
              <p>• <TeX tex={`C = (x_B + x_D,\\, y_B + y_D) = (${crd.C.x},\\, ${crd.C.y})`} /></p>
              <p>• <TeX tex={`G = \\left(\\frac{x_B + x_D}{2},\\, \\frac{y_B + y_D}{2}\\right) = (${crd.G.x},\\, ${crd.G.y})`} /></p>
              <p>• تحقق مضاعفة المركز: <TeX tex={`2G = (${2 * crd.G.x},\\, ${2 * crd.G.y}) = C`} /></p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
