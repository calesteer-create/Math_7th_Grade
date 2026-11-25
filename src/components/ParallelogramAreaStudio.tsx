"use client";

import { useState } from "react";
import DiagramMath from "@/components/DiagramMath";
import TeX from "@/components/TeX";
import {
  lerp,
  pt,
  svgPoints,
  svgRightAngleMark,
  toSvg,
  type SvgViewport,
} from "@/lib/geometry-core";
import {
  areaWithUnits,
  solveFourthLength,
  twoHeightsCalculation,
  type AreaStudioMode,
  type LengthUnit,
} from "@/lib/parallelogram-area";

type Tab = "cutpaste" | "twoheights" | "solve" | "ratios";

const TABS: { id: Tab; label: string }[] = [
  { id: "cutpaste", label: "قصّ ولصق تفاعلي" },
  { id: "twoheights", label: "طريقتا المساحة والارتفاعان" },
  { id: "solve", label: "البعد المجهول والواحدات" },
  { id: "ratios", label: "المناطق المظلّلة" },
];

export default function ParallelogramAreaStudio({ mode = "full" }: { mode?: AreaStudioMode }) {
  const initialTab: Tab = mode === "full" ? "cutpaste" : mode;
  const [tab, setTab] = useState<Tab>(initialTab);
  const activeTab: Tab = mode === "full" ? tab : mode;

  // تبويب 1: قص ولصق تفاعلي
  const [cpBase, setCpBase] = useState(5);
  const [cpHeight, setCpHeight] = useState(3);
  const [cpSlant, setCpSlant] = useState(1.8);
  const [slidePct, setSlidePct] = useState(0);

  // تبويب 2: الارتفاعان وطريقتا المساحة
  const [b1, setB1] = useState(5);
  const [b2, setB2] = useState(4);
  const [theta, setTheta] = useState(48.59); // يعطي AH ≈ 3 و AG ≈ 3.75 كما في مثال الكتاب!

  // تبويب 3: إيجاد البعد المجهول + محوّل الواحدات
  const [knownB, setKnownB] = useState(5);
  const [knownH, setKnownH] = useState(3);
  const [knownH2, setKnownH2] = useState(3.75);
  const [uBaseVal, setUBaseVal] = useState(300);
  const [uBaseUnit, setUBaseUnit] = useState<LengthUnit>("cm");
  const [uHeightVal, setUHeightVal] = useState(1);
  const [uHeightUnit, setUHeightUnit] = useState<LengthUnit>("m");
  const [targetUnit, setTargetUnit] = useState<LengthUnit>("m");

  // تبويب 4: المناطق المظلّلة
  const [divisions, setDivisions] = useState(3);
  const [topShift, setTopShift] = useState(2);

  // حسابات تبويب 1
  const vp1: SvgViewport = { originX: 48, originY: 205, scale: 36 };
  const D1 = pt(0, 0), C1 = pt(cpBase, 0), A1 = pt(cpSlant, cpHeight), B1 = pt(cpBase + cpSlant, cpHeight), H1 = pt(cpSlant, 0);
  const shiftX = (slidePct / 100) * cpBase;
  const triA = pt(A1.x + shiftX, A1.y);
  const triH = pt(H1.x + shiftX, H1.y);
  const triD = pt(D1.x + shiftX, D1.y);

  // حسابات تبويب 2
  const th = twoHeightsCalculation(b1, b2, theta);
  const vp2: SvgViewport = { originX: 60, originY: 205, scale: 36 };
  const qA = toSvg(th.A, vp2), qB = toSvg(th.B, vp2), qC = toSvg(th.C, vp2), qD = toSvg(th.D, vp2);
  const qH1 = toSvg(th.H1, vp2), qH2 = toSvg(th.H2, vp2);

  // حسابات تبويب 3
  const solvedB2 = solveFourthLength(knownB, knownH, knownH2);
  const unitCalc = areaWithUnits(uBaseVal, uBaseUnit, uHeightVal, uHeightUnit, targetUnit);

  // حسابات تبويب 4
  const vp4: SvgViewport = { originX: 48, originY: 195, scale: 42 };
  const rC = pt(0, 0), rB = pt(6, 0), rA = pt(7.8, 3), rD = pt(1.8, 3);
  const clampedTop = Math.min(divisions - 1, topShift);
  const sBotL = lerp(rC, rB, 1 / divisions);
  const sBotR = lerp(rC, rB, 2 / divisions);
  const sTopL = lerp(rD, rA, clampedTop / divisions);
  const sTopR = lerp(rD, rA, (clampedTop + 1) / divisions);

  return (
    <section
      data-studio="parallelogram-area"
      aria-label="مختبر مساحة متوازي الأضلاع"
      className="rounded-[24px] border border-teal-200 bg-gradient-to-b from-teal-50/55 via-white to-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100 pb-4">
        <div>
          <p className="text-xs font-extrabold text-teal-700">مختبر هندسي تفاعلي · التعامد والمساحة محفوظان بدقة</p>
          <h3 className="mt-0.5 text-lg font-extrabold text-[#1e2d52]">مختبر مساحة متوازي الأضلاع</h3>
        </div>
        {mode === "full" && (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="أقسام مختبر المساحة">
            {TABS.map(t => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                  activeTab === t.id
                    ? "bg-teal-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* تبويب 1: قص ولصق تفاعلي */}
      {activeTab === "cutpaste" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 470 245" className="mx-auto block w-full max-w-[470px]" role="img" aria-label="تحريك المثلث القائم لتحويل متوازي الأضلاع إلى مستطيل">
              {/* الجزء الثابت (شبه المنحرف A-B-C-H) */}
              <polygon
                points={svgPoints([toSvg(A1, vp1), toSvg(B1, vp1), toSvg(C1, vp1), toSvg(H1, vp1)])}
                fill="rgba(59,130,246,0.22)"
                stroke="#1d4ed8"
                strokeWidth={2.2}
              />
              {/* المثلث القائم المتحرك */}
              <polygon
                points={svgPoints([toSvg(triA, vp1), toSvg(triH, vp1), toSvg(triD, vp1)])}
                fill="rgba(20,184,166,0.38)"
                stroke="#0f766e"
                strokeWidth={2.4}
              />
              {/* خط الارتفاع وعلامة التعامد */}
              <line x1={toSvg(A1, vp1).x} y1={toSvg(A1, vp1).y} x2={toSvg(H1, vp1).x} y2={toSvg(H1, vp1).y} stroke="#dc2626" strokeWidth={2.2} strokeDasharray="5 3" />
              <path d={svgRightAngleMark(toSvg(A1, vp1), toSvg(H1, vp1), toSvg(C1, vp1), 10)} fill="none" stroke="#dc2626" strokeWidth={2} />
              <DiagramMath tex={`h = ${cpHeight.toFixed(1)}`} x={toSvg(H1, vp1).x + 6} y={(toSvg(A1, vp1).y + toSvg(H1, vp1).y) / 2 - 12} width={68} height={24} fontSize={13.5} color="#dc2626" />
              <DiagramMath tex={`\\mathcal{B} = ${cpBase.toFixed(1)}`} x={(toSvg(H1, vp1).x + toSvg(C1, vp1).x) / 2 - 22} y={toSvg(C1, vp1).y + 8} width={76} height={24} fontSize={14} color="#1e3a8a" />
            </svg>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs font-bold text-slate-700">
              <label className="block">
                القاعدة <TeX tex="\mathcal{B}" />: <span dir="ltr" className="text-teal-700">{cpBase.toFixed(1)}</span>
                <input type="range" min={3} max={7} step={0.5} value={cpBase} onChange={e => setCpBase(Number(e.target.value))} className="mt-1 w-full accent-teal-600" />
              </label>
              <label className="block">
                الارتفاع <TeX tex="h" />: <span dir="ltr" className="text-teal-700">{cpHeight.toFixed(1)}</span>
                <input type="range" min={2} max={4.5} step={0.5} value={cpHeight} onChange={e => setCpHeight(Number(e.target.value))} className="mt-1 w-full accent-teal-600" />
              </label>
              <label className="block">
                مقدار الميل الجانبي: <span dir="ltr" className="text-teal-700">{cpSlant.toFixed(1)}</span>
                <input type="range" min={0.6} max={2.8} step={0.2} value={cpSlant} onChange={e => setCpSlant(Number(e.target.value))} className="mt-1 w-full accent-teal-600" />
              </label>
              <label className="block text-rose-700">
                انزلاق المثلث المقصوص إلى الطرف المقابل (<span dir="ltr">{slidePct}%</span>):
                <input type="range" min={0} max={100} step={5} value={slidePct} onChange={e => setSlidePct(Number(e.target.value))} className="mt-1 w-full accent-rose-600" />
              </label>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-6 text-slate-800 space-y-1">
              <p className="font-extrabold text-emerald-800">المساحة لا تتغيّر بالقصّ واللصق ولا بتغيّر الميل!</p>
              <p><TeX tex={`\\mathcal{S} = \\mathcal{B} \\times h = ${cpBase.toFixed(1)} \\times ${cpHeight.toFixed(1)} = ${(cpBase * cpHeight).toFixed(2)}`} /></p>
              {slidePct === 100 && <p className="font-extrabold text-teal-800">تشكّل مستطيل كامل أبعاده <TeX tex={`${cpBase.toFixed(1)} \\times ${cpHeight.toFixed(1)}`} /> بنفس المساحة تمامًا!</p>}
            </div>
          </div>
        </div>
      )}

      {/* تبويب 2: الارتفاعان وطريقتا المساحة */}
      {activeTab === "twoheights" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 470 245" className="mx-auto block w-full max-w-[470px]" role="img" aria-label="الارتفاعان المتعامدان مع القاعدتين المتجاورتين وتساوي جداء كل قاعدة بارتفاعها">
              <polygon points={svgPoints([qA, qB, qC, qD])} fill="#fefce8" stroke="#1d4ed8" strokeWidth={2.4} strokeLinejoin="round" />
              <line x1={qA.x} y1={qA.y} x2={qH1.x} y2={qH1.y} stroke="#dc2626" strokeWidth={2.2} />
              <line x1={qA.x} y1={qA.y} x2={qH2.x} y2={qH2.y} stroke="#0f766e" strokeWidth={2.2} />
              <path d={svgRightAngleMark(qA, qH1, qC, 10)} fill="none" stroke="#dc2626" strokeWidth={1.8} />
              <path d={svgRightAngleMark(qA, qH2, qD, 10)} fill="none" stroke="#0f766e" strokeWidth={1.8} />
              {[qA, qB, qC, qD, qH1, qH2].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={3.8} fill="#1e3a8a" />)}
              <DiagramMath tex="A" x={qA.x - 16} y={qA.y - 24} width={22} height={22} fontSize={14} color="#1e3a8a" />
              <DiagramMath tex="B" x={qB.x - 20} y={qB.y - 2} width={22} height={22} fontSize={14} color="#1e3a8a" />
              <DiagramMath tex="C" x={qC.x + 6} y={qC.y - 2} width={22} height={22} fontSize={14} color="#1e3a8a" />
              <DiagramMath tex="D" x={qD.x + 6} y={qD.y - 20} width={22} height={22} fontSize={14} color="#1e3a8a" />
              <DiagramMath tex="H" x={qH1.x - 8} y={qH1.y + 5} width={22} height={22} fontSize={13} color="#dc2626" />
              <DiagramMath tex="G" x={qH2.x + 6} y={qH2.y - 8} width={22} height={22} fontSize={13} color="#0f766e" />
            </svg>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs font-bold text-slate-700">
              <label className="block">القاعدة الأولى <TeX tex="\mathcal{B} = BC" />: <span dir="ltr">{b1.toFixed(1)}</span>
                <input type="range" min={3.5} max={6.5} step={0.5} value={b1} onChange={e => setB1(Number(e.target.value))} className="mt-1 w-full accent-teal-600" />
              </label>
              <label className="block">القاعدة الثانية <TeX tex="\mathcal{B}' = CD" />: <span dir="ltr">{b2.toFixed(1)}</span>
                <input type="range" min={2.5} max={5} step={0.5} value={b2} onChange={e => setB2(Number(e.target.value))} className="mt-1 w-full accent-teal-600" />
              </label>
              <label className="block">زاوية الميل: <span dir="ltr">{theta.toFixed(1)}°</span>
                <input type="range" min={35} max={85} step={0.5} value={theta} onChange={e => setTheta(Number(e.target.value))} className="mt-1 w-full accent-teal-600" />
              </label>
              <button
                type="button"
                onClick={() => { setB1(5); setB2(4); setTheta(48.59); }}
                className="w-full rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-extrabold text-teal-800 hover:bg-teal-100"
              >
                تحميل مثال الكتاب: <TeX tex="BC=5,\, CD=4,\, AH=3,\, AG=3.75" />
              </button>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-6 text-slate-800 space-y-1">
              <p className="font-extrabold text-emerald-800">المساواة بين الطريقتين محفوظة دائمًا:</p>
              <p>• الطريقة 1: <TeX tex={`\\mathcal{B}\\times h = ${b1.toFixed(1)}\\times ${th.h1.toFixed(2)} = ${th.area1.toFixed(2)}`} /></p>
              <p>• الطريقة 2: <TeX tex={`\\mathcal{B}'\\times h' = ${b2.toFixed(1)}\\times ${th.h2.toFixed(2)} = ${th.area2.toFixed(2)}`} /></p>
            </div>
          </div>
        </div>
      )}

      {/* تبويب 3: البعد المجهول وتوحيد الواحدات */}
      {activeTab === "solve" && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
            <h4 className="font-extrabold text-[#1e2d52]">1) إيجاد قاعدة مجهولة من المساحة</h4>
            <label className="block font-bold text-slate-700">القاعدة المعلومة <TeX tex="\mathcal{B}" />: {knownB}
              <input type="range" min={2} max={12} step={0.5} value={knownB} onChange={e => setKnownB(Number(e.target.value))} className="mt-1 w-full accent-indigo-600" />
            </label>
            <label className="block font-bold text-slate-700">ارتفاعها <TeX tex="h" />: {knownH}
              <input type="range" min={2} max={10} step={0.5} value={knownH} onChange={e => setKnownH(Number(e.target.value))} className="mt-1 w-full accent-indigo-600" />
            </label>
            <label className="block font-bold text-slate-700">الارتفاع الثاني <TeX tex="h'" />: {knownH2}
              <input type="range" min={1.25} max={10} step={0.25} value={knownH2} onChange={e => setKnownH2(Number(e.target.value))} className="mt-1 w-full accent-indigo-600" />
            </label>
            <div className="rounded-xl bg-indigo-50/75 p-3 leading-6 text-slate-800">
              <p>المساحة: <TeX tex={`\\mathcal{S} = ${knownB}\\times ${knownH} = ${(knownB * knownH).toFixed(2)}`} /></p>
              <p>القاعدة المجهولة: <TeX tex={`\\mathcal{B}' = \\frac{${(knownB * knownH).toFixed(2)}}{${knownH2}} = ${solvedB2.toFixed(2)}`} /></p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs">
            <h4 className="font-extrabold text-[#1e2d52]">2) مختبر توحيد الواحدات قبل الضرب</h4>
            <div className="grid grid-cols-2 gap-2">
              <label className="font-bold text-slate-700">
                القاعدة
                <input type="number" min={1} max={10000} value={uBaseVal} onChange={e => setUBaseVal(Math.max(0.1, Number(e.target.value) || 1))} className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5" dir="ltr" />
              </label>
              <label className="font-bold text-slate-700">
                واحدة القاعدة
                <select value={uBaseUnit} onChange={e => setUBaseUnit(e.target.value as LengthUnit)} className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5">
                  <option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option>
                </select>
              </label>
              <label className="font-bold text-slate-700">
                الارتفاع
                <input type="number" min={1} max={10000} value={uHeightVal} onChange={e => setUHeightVal(Math.max(0.1, Number(e.target.value) || 1))} className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5" dir="ltr" />
              </label>
              <label className="font-bold text-slate-700">
                واحدة الارتفاع
                <select value={uHeightUnit} onChange={e => setUHeightUnit(e.target.value as LengthUnit)} className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5">
                  <option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option>
                </select>
              </label>
            </div>
            <label className="block font-bold text-slate-700">
              الواحدة الموحّدة للحساب:
              <select value={targetUnit} onChange={e => setTargetUnit(e.target.value as LengthUnit)} className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5">
                <option value="m">متر (m)</option><option value="cm">سنتيمتر (cm)</option><option value="mm">مليمتر (mm)</option>
              </select>
            </label>
            <div className="rounded-xl bg-emerald-50/80 p-3 leading-6 text-slate-800">
              <p>بعد التوحيد: <TeX tex={`\\mathcal{B}=${unitCalc.base}\\text{ ${targetUnit}}`} /> ، <TeX tex={`h=${unitCalc.height}\\text{ ${targetUnit}}`} /></p>
              <p className="font-extrabold text-emerald-800">المساحة الصحيحة: <TeX tex={`\\mathcal{S}=${unitCalc.area}\\text{ ${targetUnit}}^2`} /></p>
            </div>
          </div>
        </div>
      )}

      {/* تبويب 4: المناطق المظلّلة */}
      {activeTab === "ratios" && (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#fbfcff] p-4">
            <svg viewBox="0 0 430 230" className="mx-auto block w-full max-w-[430px]" role="img" aria-label="منطقة مظللة داخل متوازي أضلاع بنسب متساوية من القاعدة ونفس الارتفاع">
              <polygon points={svgPoints([toSvg(rC, vp4), toSvg(rB, vp4), toSvg(rA, vp4), toSvg(rD, vp4)])} fill="#f8fafc" stroke="#1d4ed8" strokeWidth={2.4} />
              <polygon points={svgPoints([toSvg(sBotL, vp4), toSvg(sBotR, vp4), toSvg(sTopR, vp4), toSvg(sTopL, vp4)])} fill="rgba(59,130,246,0.34)" stroke="#1d4ed8" strokeWidth={2.2} />
              {Array.from({ length: divisions - 1 }, (_, i) => {
                const p = toSvg(lerp(rC, rB, (i + 1) / divisions), vp4);
                return <circle key={i} cx={p.x} cy={p.y} r={4} fill="#0f172a" />;
              })}
            </svg>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 text-xs font-bold text-slate-700">
              <label className="block">عدد الأجزاء المتساوية في القاعدة (<TeX tex="n" />): <span dir="ltr">{divisions}</span>
                <input type="range" min={2} max={6} step={1} value={divisions} onChange={e => setDivisions(Number(e.target.value))} className="mt-1 w-full accent-teal-600" />
              </label>
              <label className="block">إزاحة القاعدة العلوية للمنطقة المظلّلة: <span dir="ltr">{clampedTop + 1} / {divisions}</span>
                <input type="range" min={0} max={divisions - 1} step={1} value={clampedTop} onChange={e => setTopShift(Number(e.target.value))} className="mt-1 w-full accent-indigo-600" />
              </label>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs leading-6 text-slate-800 space-y-1">
              <p className="font-extrabold text-emerald-800">قاعدة نسبة المساحة:</p>
              <p>مهما تحرّكت القاعدة العلوية يمينًا أو يسارًا، يبقى الارتفاع ثابتًا والقاعدة تساوي <TeX tex={`\\frac{1}{${divisions}}`} /> من قاعدة <TeX tex="ABCD" />.</p>
              <p>إذن نسبة المساحة المظلّلة تساوي دائمًا: <TeX tex={`\\frac{1}{${divisions}}`} /></p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
