"use client";

import { useState } from "react";
import DiagramMath from "@/components/DiagramMath";
import TeX from "@/components/TeX";
import {
  add,
  pt,
  scale,
  svgAngleArc,
  svgParallelArrow,
  toSvg,
  type SvgViewport,
} from "@/lib/geometry-core";
import {
  auxiliaryAngleCalc,
  buildTransversalModel,
  type ParallelStudioMode,
} from "@/lib/parallel-lines-transversal";

type Tab = "pairs" | "transversal" | "converse" | "auxiliary";

const TABS: { id: Tab; label: string }[] = [
  { id: "pairs", label: "العلاقات بين زاويتين" },
  { id: "transversal", label: "مستقيمان وقاطع" },
  { id: "converse", label: "إثبات التوازي" },
  { id: "auxiliary", label: "المستقيم المساعد" },
];

type HighlightPair = "altInt" | "altExt" | "corr";

export default function ParallelLinesStudio({ mode = "full" }: { mode?: ParallelStudioMode }) {
  const initialTab: Tab = mode === "full" ? "pairs" : mode;
  const [tab, setTab] = useState<Tab>(initialTab);
  const activeTab: Tab = mode === "full" ? tab : mode;

  // تبويب 1: المتتامتان / المتكاملتان / المتقابلتان بالرأس
  const [pairMode, setPairMode] = useState<"supp" | "comp" | "vert">("supp");
  const [alpha, setAlpha] = useState(52);

  // تبويب 2: مستقيمان وقاطع (مع إمكانية إمالة \Delta_1 لكسر التوازي وملاحظة الفرق!)
  const [transDeg, setTransDeg] = useState(58);
  const [isParallel, setIsParallel] = useState(true);
  const [pairHighlight, setPairHighlight] = useState<HighlightPair>("altInt");

  // تبويب 3: إثبات التوازي (تدوير \Delta_1 حتى تتساوى الزاويتان)
  const [topAngleTarget, setTopAngleTarget] = useState(48);
  const fixedBottomAngle = 62;

  // تبويب 4: المستقيم المساعد
  const [topExt, setTopExt] = useState(110);
  const [botInt, setBotInt] = useState(37);
  const [showAux, setShowAux] = useState(true);

  const clampedAlpha = pairMode === "comp" ? Math.min(80, Math.max(10, alpha)) : Math.min(165, Math.max(15, alpha));
  const beta = pairMode === "supp" ? 180 - clampedAlpha : pairMode === "comp" ? 90 - clampedAlpha : clampedAlpha;
  const radA = (clampedAlpha * Math.PI) / 180;

  // تبويب 2 model
  const tModel = buildTransversalModel(isParallel ? 0 : -14, transDeg);
  const vpT: SvgViewport = { originX: 215, originY: 188, scale: 42 };
  const tA = toSvg(tModel.A, vpT), tB = toSvg(tModel.B, vpT);
  const td1L = toSvg(tModel.d1L, vpT), td1R = toSvg(tModel.d1R, vpT);
  const td2L = toSvg(tModel.d2L, vpT), td2R = toSvg(tModel.d2R, vpT);
  const ttB = toSvg(tModel.tBot, vpT), ttT = toSvg(tModel.tTop, vpT);

  // تبويب 3 model: نحسب زاوية ميل \Delta_1 بحيث تكون الزاوية المتناظرة العليا مساوية topAngleTarget
  const tiltForConverse = fixedBottomAngle - topAngleTarget;
  const cModel = buildTransversalModel(tiltForConverse, fixedBottomAngle);
  const cParallelNow = Math.abs(topAngleTarget - fixedBottomAngle) === 0;

  // تبويب 4 model
  const aux = auxiliaryAngleCalc(topExt, botInt);
  const vpAux: SvgViewport = { originX: 215, originY: 192, scale: 42 };
  const aM = pt(0.5, 1.2);
  const uTop = pt(Math.cos((topExt * Math.PI) / 180), Math.sin((topExt * Math.PI) / 180));
  const uBot = pt(Math.cos(((180 + botInt) * Math.PI) / 180), Math.sin(((180 + botInt) * Math.PI) / 180));
  const aP = add(aM, scale(uTop, (2.4 - aM.y) / uTop.y));
  const aPext = add(aP, scale(uTop, 0.8));
  const aQ = add(aM, scale(uBot, (0 - aM.y) / uBot.y));
  const aQext = add(aQ, scale(uBot, 0.7));

  return (
    <section
      data-studio="parallel-lines"
      aria-label="مختبر المستقيمين المتوازيين والقاطع"
      className="rounded-[24px] border border-violet-200 bg-gradient-to-b from-violet-50/55 via-white to-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-violet-100 pb-4">
        <div>
          <p className="text-xs font-extrabold text-violet-700">مختبر هندسي تفاعلي · قياسات الزوايا محسوبة إقليديًا بدقة</p>
          <h3 className="mt-0.5 text-lg font-extrabold text-[#1e2d52]">مختبر المستقيمين المتوازيين والقاطع</h3>
        </div>
        {mode === "full" && (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="أقسام مختبر التوازي">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                  activeTab === t.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* تبويب 1: العلاقات بين زاويتين */}
      {activeTab === "pairs" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 420 220" className="mx-auto block w-full max-w-[420px]" role="img" aria-label="استكشاف الزاويتين المتكاملتين والمتتامتين والمتقابلتين بالرأس">
              {(() => {
                const vp: SvgViewport = { originX: 210, originY: pairMode === "vert" ? 115 : 172, scale: 52 };
                const O = toSvg(pt(0, 0), vp);
                const R = toSvg(pt(2.8, 0), vp);
                const L = toSvg(pt(-2.8, 0), vp);
                const U = toSvg(pt(0, 2.7), vp);
                const Ray = toSvg(pt(2.6 * Math.cos(radA), 2.6 * Math.sin(radA)), vp);
                const Opp = toSvg(pt(-2.6 * Math.cos(radA), -2.6 * Math.sin(radA)), vp);
                return <>
                  <line x1={pairMode === "comp" ? O.x : L.x} y1={O.y} x2={R.x} y2={O.y} stroke="#1d4ed8" strokeWidth={2.5} />
                  {pairMode === "comp" && <line x1={O.x} y1={O.y} x2={U.x} y2={U.y} stroke="#1d4ed8" strokeWidth={2.5} />}
                  <line x1={pairMode === "vert" ? Opp.x : O.x} y1={pairMode === "vert" ? Opp.y : O.y} x2={Ray.x} y2={Ray.y} stroke="#0f766e" strokeWidth={2.5} />
                  <path d={svgAngleArc(Ray, O, R, 30)} fill="none" stroke="#0f766e" strokeWidth={2.4} />
                  {pairMode === "supp" && <path d={svgAngleArc(L, O, Ray, 34)} fill="none" stroke="#dc2626" strokeWidth={2.4} />}
                  {pairMode === "comp" && <path d={svgAngleArc(U, O, Ray, 34)} fill="none" stroke="#dc2626" strokeWidth={2.4} />}
                  {pairMode === "vert" && <path d={svgAngleArc(L, O, Opp, 30)} fill="none" stroke="#dc2626" strokeWidth={2.4} />}
                  <DiagramMath tex={`${clampedAlpha}^\\circ`} x={O.x + 36} y={O.y - 30} width={44} height={24} fontSize={14} color="#0f766e" />
                  {pairMode === "supp" && <DiagramMath tex={`${beta}^\\circ`} x={O.x - 74} y={O.y - 46} width={52} height={24} fontSize={14} color="#dc2626" />}
                  {pairMode === "comp" && <DiagramMath tex={`${beta}^\\circ`} x={O.x + 12} y={O.y - 68} width={44} height={24} fontSize={14} color="#dc2626" />}
                  {pairMode === "vert" && <DiagramMath tex={`${beta}^\\circ`} x={O.x - 76} y={O.y + 8} width={44} height={24} fontSize={14} color="#dc2626" />}
                  <circle cx={O.x} cy={O.y} r={4.5} fill="#1e3a8a" />
                </>;
              })()}
            </svg>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {([
                ["supp", "متكاملتان (180°)"],
                ["comp", "متتامّتان (90°)"],
                ["vert", "متقابلتان بالرأس"],
              ] as const).map(([id, lbl]) => (
                <button key={id} type="button" onClick={() => setPairMode(id)} className={`rounded-xl px-3 py-1.5 text-xs font-extrabold ${pairMode === id ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{lbl}</button>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-bold text-slate-700">
              <label className="block">
                قياس الزاوية الأولى <TeX tex="\alpha" />: <span dir="ltr" className="text-violet-700">{clampedAlpha}°</span>
                <input type="range" min={pairMode === "comp" ? 10 : 15} max={pairMode === "comp" ? 80 : 165} value={clampedAlpha} onChange={e => setAlpha(Number(e.target.value))} className="mt-1 w-full accent-violet-600" />
              </label>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-6 text-slate-800">
              {pairMode === "supp" && <p>مجموعهما <TeX tex={`${clampedAlpha}^\\circ + ${180 - clampedAlpha}^\\circ = 180^\\circ`} /> ← زاوية مستقيمة (النقاط على استقامة واحدة).</p>}
              {pairMode === "comp" && <p>مجموعهما <TeX tex={`${clampedAlpha}^\\circ + ${90 - clampedAlpha}^\\circ = 90^\\circ`} /> ← زاوية قائمة (الضلعان الخارجيان متعامدان).</p>}
              {pairMode === "vert" && <p>الزاويتان المتقابلتان بالرأس متساويتان بالتناظر المركزي: <TeX tex={`${clampedAlpha}^\\circ = ${clampedAlpha}^\\circ`} />.</p>}
            </div>
          </div>
        </div>
      )}

      {/* تبويب 2: مستقيمان وقاطع */}
      {activeTab === "transversal" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 430 250" className="mx-auto block w-full max-w-[430px]" role="img" aria-label="مستقيمان وقاطع مع مقارنة التساوي بين حالتي التوازي وعدم التوازي">
              <line x1={td1L.x} y1={td1L.y} x2={td1R.x} y2={td1R.y} stroke="#1d4ed8" strokeWidth={2.5} />
              <line x1={td2L.x} y1={td2L.y} x2={td2R.x} y2={td2R.y} stroke="#1d4ed8" strokeWidth={2.5} />
              <line x1={ttB.x} y1={ttB.y} x2={ttT.x} y2={ttT.y} stroke="#dc2626" strokeWidth={2.5} />
              {isParallel && <>
                <path d={svgParallelArrow(td1L, td1R, 0.16)} fill="none" stroke="#15803d" strokeWidth={2.2} />
                <path d={svgParallelArrow(td2L, td2R, 0.16)} fill="none" stroke="#15803d" strokeWidth={2.2} />
              </>}
              {pairHighlight === "altInt" && <>
                <path d={svgAngleArc(td1L, tA, ttB, 22)} fill="none" stroke="#0f766e" strokeWidth={2.8} />
                <path d={svgAngleArc(td2R, tB, ttT, 22)} fill="none" stroke="#0f766e" strokeWidth={2.8} />
              </>}
              {pairHighlight === "altExt" && <>
                <path d={svgAngleArc(td1L, tA, ttT, 22)} fill="none" stroke="#d97706" strokeWidth={2.8} />
                <path d={svgAngleArc(td2R, tB, ttB, 22)} fill="none" stroke="#d97706" strokeWidth={2.8} />
              </>}
              {pairHighlight === "corr" && <>
                <path d={svgAngleArc(td1R, tA, ttT, 22)} fill="none" stroke="#7c3aed" strokeWidth={2.8} />
                <path d={svgAngleArc(td2R, tB, ttT, 22)} fill="none" stroke="#7c3aed" strokeWidth={2.8} />
              </>}
              <DiagramMath tex="A_1" x={tA.x + 14} y={tA.y - 30} width={26} height={22} fontSize={13} color="#334155" />
              <DiagramMath tex="A_2" x={tA.x - 34} y={tA.y - 30} width={26} height={22} fontSize={13} color="#334155" />
              <DiagramMath tex="A_3" x={tA.x - 36} y={tA.y + 4} width={26} height={22} fontSize={13} color="#0f766e" />
              <DiagramMath tex="B_1" x={tB.x + 14} y={tB.y - 30} width={26} height={22} fontSize={13} color="#0f766e" />
              <DiagramMath tex="B_4" x={tB.x + 14} y={tB.y + 4} width={26} height={22} fontSize={13} color="#334155" />
            </svg>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs font-bold text-slate-700">
              <div className="flex flex-wrap gap-1.5">
                {([["altInt", "تبادل داخلي (A3, B1)"], ["altExt", "تبادل خارجي (A2, B4)"], ["corr", "تناظر (A1, B1)"]] as const).map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setPairHighlight(k)} className={`rounded-xl px-2.5 py-1.5 text-xs font-extrabold ${pairHighlight === k ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{l}</button>
                ))}
              </div>
              <label className="block">زاوية ميل القاطع: <span dir="ltr">{transDeg}°</span>
                <input type="range" min={35} max={135} value={transDeg} onChange={e => setTransDeg(Number(e.target.value))} className="mt-1 w-full accent-violet-600" />
              </label>
              <button
                type="button"
                onClick={() => setIsParallel(p => !p)}
                className={`w-full rounded-xl px-3 py-2 text-xs font-extrabold text-white transition ${isParallel ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"}`}
              >
                {isParallel ? "الحالة الآن: Δ1 ∥ Δ2 (انقر لكسر التوازي ومقارنة القياس!)" : "الحالة الآن: Δ1 غير موازٍ لـ Δ2 (انقر لإعادة التوازي)"}
              </button>
            </div>
            <div className={`rounded-2xl border p-4 text-xs leading-6 ${isParallel ? "border-emerald-200 bg-emerald-50/75" : "border-amber-200 bg-amber-50/80"}`}>
              {pairHighlight === "altInt" && <p><TeX tex={`\\widehat{A_3}=${tModel.angles.A3.toFixed(1)}^\\circ`} /> و <TeX tex={`\\widehat{B_1}=${tModel.angles.B1.toFixed(1)}^\\circ`} /></p>}
              {pairHighlight === "altExt" && <p><TeX tex={`\\widehat{A_2}=${tModel.angles.A2.toFixed(1)}^\\circ`} /> و <TeX tex={`\\widehat{B_4}=${tModel.angles.B4.toFixed(1)}^\\circ`} /></p>}
              {pairHighlight === "corr" && <p><TeX tex={`\\widehat{A_1}=${tModel.angles.A1.toFixed(1)}^\\circ`} /> و <TeX tex={`\\widehat{B_1}=${tModel.angles.B1.toFixed(1)}^\\circ`} /></p>}
              <p className="mt-1 font-extrabold">
                {isParallel ? "المستقيمان متوازيان ← القياسان متساويان تمامًا!" : "المستقيمان غير متوازيين ← التسمية تبقى صحيحة لكن القياسين مختلفان!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* تبويب 3: إثبات التوازي (العكس) */}
      {activeTab === "converse" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 430 245" className="mx-auto block w-full max-w-[430px]" role="img" aria-label="إثبات التوازي عندما تتساوى زاويتان متناظرتان">
              {(() => {
                const cA = toSvg(cModel.A, vpT), cB = toSvg(cModel.B, vpT);
                const cd1L = toSvg(cModel.d1L, vpT), cd1R = toSvg(cModel.d1R, vpT);
                const cd2L = toSvg(cModel.d2L, vpT), cd2R = toSvg(cModel.d2R, vpT);
                const ctB = toSvg(cModel.tBot, vpT), ctT = toSvg(cModel.tTop, vpT);
                return <>
                  <line x1={cd1L.x} y1={cd1L.y} x2={cd1R.x} y2={cd1R.y} stroke={cParallelNow ? "#15803d" : "#1d4ed8"} strokeWidth={2.6} />
                  <line x1={cd2L.x} y1={cd2L.y} x2={cd2R.x} y2={cd2R.y} stroke={cParallelNow ? "#15803d" : "#1d4ed8"} strokeWidth={2.6} />
                  <line x1={ctB.x} y1={ctB.y} x2={ctT.x} y2={ctT.y} stroke="#dc2626" strokeWidth={2.4} />
                  {cParallelNow && <>
                    <path d={svgParallelArrow(cd1L, cd1R, 0.16)} fill="none" stroke="#15803d" strokeWidth={2.4} />
                    <path d={svgParallelArrow(cd2L, cd2R, 0.16)} fill="none" stroke="#15803d" strokeWidth={2.4} />
                  </>}
                  <path d={svgAngleArc(cd1R, cA, ctT, 24)} fill="none" stroke="#7c3aed" strokeWidth={2.6} />
                  <path d={svgAngleArc(cd2R, cB, ctT, 24)} fill="none" stroke="#7c3aed" strokeWidth={2.6} />
                  <DiagramMath tex={`${topAngleTarget}^\\circ`} x={cA.x + 26} y={cA.y - 34} width={44} height={22} fontSize={14} color="#7c3aed" />
                  <DiagramMath tex={`${fixedBottomAngle}^\\circ`} x={cB.x + 26} y={cB.y - 34} width={44} height={22} fontSize={14} color="#7c3aed" />
                </>;
              })()}
            </svg>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs font-bold text-slate-700">
              <p>الزاوية السفلى ثابتة عند <TeX tex={`${fixedBottomAngle}^\\circ`} />؛ اضبط الزاوية المتناظرة العليا حتى يتوازى المستقيمان:</p>
              <label className="block">الزاوية العليا <TeX tex="\widehat{A_1}" />: <span dir="ltr" className="text-violet-700">{topAngleTarget}°</span>
                <input type="range" min={40} max={84} step={1} value={topAngleTarget} onChange={e => setTopAngleTarget(Number(e.target.value))} className="mt-1 w-full accent-violet-600" />
              </label>
            </div>
            <div className={`rounded-2xl border p-4 text-xs leading-6 ${cParallelNow ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
              {cParallelNow ? (
                <p className="font-extrabold text-emerald-800">تحقّق الشرط! <TeX tex="\widehat{A_1}=\widehat{B_1}=62^\circ" /> وهما متناظرتان ← إذن <TeX tex="\Delta_1 \parallel \Delta_2" />!</p>
              ) : (
                <p className="text-slate-700">بما أن <TeX tex={`${topAngleTarget}^\\circ \\neq ${fixedBottomAngle}^\\circ`} /> فالمستقيمان <TeX tex="\Delta_1" /> و <TeX tex="\Delta_2" /> متقاطعان وغير متوازيين.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* تبويب 4: المستقيم المساعد */}
      {activeTab === "auxiliary" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 430 245" className="mx-auto block w-full max-w-[430px]" role="img" aria-label="حساب زاوية كسر بين مستقيمين متوازيين باستخدام مستقيم مساعد موازٍ">
              {(() => {
                const d1L = toSvg(pt(-4, 2.4), vpAux), d1R = toSvg(pt(4.5, 2.4), vpAux);
                const d2L = toSvg(pt(-4, 0), vpAux), d2R = toSvg(pt(4.5, 0), vpAux);
                const mL = toSvg(pt(-4, aM.y), vpAux), mR = toSvg(pt(4.5, aM.y), vpAux);
                const sM = toSvg(aM, vpAux), sP = toSvg(aP, vpAux), sPext = toSvg(aPext, vpAux);
                const sQ = toSvg(aQ, vpAux), sQext = toSvg(aQext, vpAux);
                return <>
                  <line x1={d1L.x} y1={d1L.y} x2={d1R.x} y2={d1R.y} stroke="#1d4ed8" strokeWidth={2.4} />
                  <line x1={d2L.x} y1={d2L.y} x2={d2R.x} y2={d2R.y} stroke="#1d4ed8" strokeWidth={2.4} />
                  {showAux && <line x1={mL.x} y1={mL.y} x2={mR.x} y2={mR.y} stroke="#0f766e" strokeWidth={2} strokeDasharray="6 4" />}
                  <line x1={sPext.x} y1={sPext.y} x2={sM.x} y2={sM.y} stroke="#1e293b" strokeWidth={2.4} />
                  <line x1={sM.x} y1={sM.y} x2={sQext.x} y2={sQext.y} stroke="#1e293b" strokeWidth={2.4} />
                  <path d={svgParallelArrow(d1L, d1R, 0.14)} fill="none" stroke="#db2777" strokeWidth={2.2} />
                  <path d={svgParallelArrow(d2L, d2R, 0.14)} fill="none" stroke="#db2777" strokeWidth={2.2} />
                  <path d={svgAngleArc(d1R, sP, sPext, 20)} fill="none" stroke="#dc2626" strokeWidth={2.2} />
                  <path d={svgAngleArc(d2R, sQ, sM, 24)} fill="none" stroke="#0f766e" strokeWidth={2.2} />
                  <path d={svgAngleArc(sP, sM, sQ, 20)} fill="none" stroke="#7c3aed" strokeWidth={2.4} />
                  <circle cx={sM.x} cy={sM.y} r={4.2} fill="#7c3aed" />
                  <DiagramMath tex={`${topExt}^\\circ`} x={sP.x + 12} y={sP.y - 34} width={48} height={22} fontSize={13.5} color="#dc2626" />
                  <DiagramMath tex={`${botInt}^\\circ`} x={sQ.x + 26} y={sQ.y - 26} width={44} height={22} fontSize={13.5} color="#0f766e" />
                  <DiagramMath tex="M" x={sM.x + 12} y={sM.y - 14} width={24} height={22} fontSize={14} color="#7c3aed" />
                </>;
              })()}
            </svg>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs font-bold text-slate-700">
              <label className="block">الزاوية العليا الخارجية: <span dir="ltr">{topExt}°</span>
                <input type="range" min={100} max={145} value={topExt} onChange={e => setTopExt(Number(e.target.value))} className="mt-1 w-full accent-violet-600" />
              </label>
              <label className="block">الزاوية السفلى الداخلية: <span dir="ltr">{botInt}°</span>
                <input type="range" min={25} max={65} value={botInt} onChange={e => setBotInt(Number(e.target.value))} className="mt-1 w-full accent-violet-600" />
              </label>
              <button type="button" onClick={() => setShowAux(v => !v)} className="w-full rounded-xl bg-teal-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-teal-700">
                {showAux ? "إخفاء المستقيم المساعد المتقطّع" : "رسم المستقيم المساعد الموازي عبر M"}
              </button>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/75 p-4 text-xs leading-6 text-slate-800 space-y-1">
              <p className="font-extrabold text-emerald-800">تفكيك <TeX tex="\widehat{M}" /> عبر المستقيم المساعد:</p>
              <p>• الجزء العلوي (مكمّلة <TeX tex={`${topExt}^\\circ`} /> ثم تبادل داخلي): <TeX tex={`180^\\circ - ${topExt}^\\circ = ${aux.topPart}^\\circ`} /></p>
              <p>• الجزء السفلي (تبادل داخلي مباشر): <TeX tex={`${aux.botPart}^\\circ`} /></p>
              <p className="font-extrabold text-violet-800">المجموع: <TeX tex={`\\widehat{M} = ${aux.topPart}^\\circ + ${aux.botPart}^\\circ = ${aux.total}^\\circ`} /></p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
