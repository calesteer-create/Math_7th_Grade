"use client";

import { useState } from "react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import DiagramMath from "@/components/DiagramMath";
import { fmtNum } from "@/lib/site";
import { displayRational } from "@/lib/numbers";
import { lineStatusText, percentOf, projectOnLine, unitRate } from "@/lib/lab-math";

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span className="rounded-md bg-brand-50 px-2 py-0.5 font-black text-brand-700" dir="ltr">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-700"
      />
    </label>
  );
}

// 1) مستكشف الكسر — يصور الكسر دائرةً وشريطًا ويحسب القيمة العشرية والمبسّطة
function FractionExplorer() {
  const [num, setNum] = useState(3);
  const [den, setDen] = useState(4);
  const n = Math.min(num, den);
  const g = gcd(num, den);
  const cx = 90;
  const cy = 90;
  const r = 70;
  const wedge = (i: number) => {
    const a1 = -90 + (360 / den) * i;
    const a2 = -90 + (360 / den) * (i + 1);
    const rad = (a: number) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(a1));
    const y1 = cy + r * Math.sin(rad(a1));
    const x2 = cx + r * Math.cos(rad(a2));
    const y2 = cy + r * Math.sin(rad(a2));
    const large = 360 / den > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
  };
  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Slider label="البسط" value={num} min={0} max={den} onChange={setNum} />
        <Slider label="المقام" value={den} min={1} max={12} onChange={(d) => { setDen(d); if (num > d) setNum(d); }} />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-6">
        <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="تمثيل دائري للكسر">
          <circle cx={cx} cy={cy} r={r} fill="#eef2ff" stroke="#c7d2fe" strokeWidth="2" />
          {Array.from({ length: den }).map((_, i) => (
            den === 1 ? <circle key={i} cx={cx} cy={cy} r={r} fill={num ? "#4f46e5" : "white"} stroke="#312e81" strokeWidth="1.5"/> : <path
              key={i}
              d={wedge(i)}
              fill={i < n ? "#4f46e5" : "#ffffff"}
              stroke="#312e81"
              strokeWidth="1.5"
            />
          ))}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#312e81" strokeWidth="2" />
        </svg>
        <div className="w-40 space-y-2 text-center">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-500">الكسر</div>
            <TeX tex={`\\frac{${num}}{${den}}`} block className="text-xl" />
          </div>
          <div className="rounded-xl bg-white p-3 shadow-sm">
            <div className="text-xs font-bold text-slate-500">بالنص العشري</div>
            <div className="text-xl font-black text-brand-700" dir="ltr" data-decimal-value={`${num}/${den}`}>
              {displayRational(num, den, 3)}
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="text-xs font-bold text-emerald-700">مبسّطًا</div>
            <div className="text-lg font-black text-emerald-800" dir="ltr">
              <TeX tex={`\\frac{${num / g}}{${den / g}}`}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2) خط الأعداد النسبية — ضع العدد النسبي على خط الأعداد
// القيمة الرياضية n/d هي المرجع الوحيد للرسم والقراءة؛ لا تُقصّ ولا تُقرَّب للرسم.
const NUMBER_LINE_DOMAIN = { min: -2, max: 2, start: 20, width: 360 } as const;

function NumberLineExplorer() {
  const [n, setN] = useState(3);
  const [d, setD] = useState(2);
  const value = d === 0 ? Number.NaN : n / d;
  const projection = projectOnLine(value, NUMBER_LINE_DOMAIN);
  const tickX = (t: number) => ((t - NUMBER_LINE_DOMAIN.min) / (NUMBER_LINE_DOMAIN.max - NUMBER_LINE_DOMAIN.min)) * NUMBER_LINE_DOMAIN.width + NUMBER_LINE_DOMAIN.start;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="البسط (يمكن أن يكون سالبًا)" value={n} min={-12} max={12} onChange={setN} />
        <Slider label="المقام" value={d} min={1} max={12} onChange={setD} />
      </div>
      <svg width="100%" viewBox="0 0 400 110" className="rounded-2xl bg-white" role="img" aria-label="خط الأعداد" data-domain="[-2,2]" data-value={String(value)} data-in-range={String(projection.inRange)}>
        <line x1="20" y1="60" x2="380" y2="60" stroke="#94a3b8" strokeWidth="2.5" />
        {[-2, -1, 0, 1, 2].map((t) => {
          const tx = tickX(t);
          return (
            <g key={t}>
              <line x1={tx} y1="54" x2={tx} y2="66" stroke="#94a3b8" strokeWidth="2.5" />
              <DiagramMath tex={String(t)} x={tx-17} y={69} width={34} height={26} fontSize={13} color="#475569"/>
            </g>
          );
        })}
        {[-1.5, -0.5, 0.5, 1.5].map((t) => {
          const tx = tickX(t);
          return <line key={t} x1={tx} y1="57" x2={tx} y2="63" stroke="#cbd5e1" strokeWidth="1.5" />;
        })}
        {projection.inRange && projection.x !== null && (
          <>
            <circle data-point-value={value} cx={projection.x} cy="60" r="9" fill="#4f46e5" stroke="#312e81" strokeWidth="2.5" />
            <foreignObject x={Math.max(0, Math.min(356, projection.x - 22))} y="0" width="44" height="48"><div dir="ltr" className="text-center text-[12px] text-brand-700"><TeX tex={`\\frac{${n}}{${d}}`}/></div></foreignObject>
          </>
        )}
        {!projection.inRange && projection.edgeX !== null && (
          <g data-out-of-range="true" data-edge={projection.direction ?? "none"}>
            <circle cx={projection.edgeX} cy="60" r="9" fill="#fffbeb" stroke="#b45309" strokeWidth="2.5" strokeDasharray="4 3" />
            <path d={projection.direction === "right" ? `M ${projection.edgeX + 12} 60 l 10 0 m -4 -4 l 4 4 l -4 4` : `M ${projection.edgeX - 12} 60 l -10 0 m 4 -4 l -4 4 l 4 4`} fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
      <div className="flex flex-wrap justify-center gap-3 text-center">
        <div className="rounded-xl bg-white px-4 py-2 shadow-sm">
          <span className="text-xs font-bold text-slate-500">القيمة العشرية: </span>
          <span className="font-black text-brand-700" dir="ltr" data-value-text={`${n}/${d}`}>{displayRational(n, d, 3)}</span>
        </div>
        <div className="rounded-xl bg-white px-4 py-2 shadow-sm">
          <span className="text-xs font-bold text-slate-500">على خط الأعداد: </span>
          <span className="font-black text-brand-700" dir="ltr">
            {projection.inRange ? displayRational(n, d, 3) : "خارج المجال المرسوم"}
          </span>
        </div>
      </div>
      <p className={`rounded-xl px-4 py-3 text-xs font-bold leading-6 ${projection.inRange ? "bg-indigo-50 text-indigo-800" : "bg-amber-50 text-amber-900"}`} role="status" data-line-status={projection.inRange ? "in-range" : "out-of-range"}>
        {lineStatusText(value, NUMBER_LINE_DOMAIN)} المجال المرسوم من -2 إلى 2، والقيمة تُحسب من n/d دون تقريب.
      </p>
    </div>
  );
}

// 3) ميزان المعادلة — حل معادلات من الشكل س + أ = ب
function EquationBalance() {
  const [a, setA] = useState(5);
  const [b, setB] = useState(12);
  const x = b - a;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="أ (المضاف إلى المجهول)" value={a} min={1} max={20} onChange={(v) => { setA(v); if (b <= v) setB(v + 1); }} />
        <Slider label="ب (الطرف الآخر من المعادلة)" value={b} min={2} max={30} onChange={(v) => { setB(v); if (v <= a) setA(v - 1); }} />
      </div>
      <div className="grid items-center gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
          <div className="mx-auto mb-2 h-1.5 w-40 rounded-full bg-slate-300" />
          <div className="flex items-end justify-between px-6" dir="ltr">
            <div className="rounded-xl border-2 border-brand-300 bg-brand-50 px-4 py-3 text-center">
              <div className="text-2xl font-black text-brand-700" dir="ltr"><TeX tex={`x+${a}`}/></div>
              <div className="text-[10px] font-bold text-slate-500">الطرف الأيسر</div>
            </div>
            <div className="pb-2 text-2xl font-black text-slate-400"><TeX tex="="/></div>
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center">
              <div className="text-2xl font-black text-emerald-700" dir="ltr">{b}</div>
              <div className="text-[10px] font-bold text-slate-500">الطرف الأيمن</div>
            </div>
          </div>
          <div className="mx-auto mt-2 h-6 w-6 rounded-b-full border-x-2 border-b-2 border-slate-300" />
        </div>
        <div className="rounded-2xl bg-gradient-to-l from-brand-50 to-emerald-50 p-5 text-center">
          <div className="text-sm font-bold text-slate-600">نطرح {fmtNum(a)} من الطرفين:</div>
          <div className="mt-2 text-3xl font-black text-ink" dir="ltr">
            <TeX tex={`x=${b}-${a}=${x}`} block/>
          </div>
          <div className="mt-2 text-xs font-bold text-slate-500">
            تحقق: <TeX tex={`${x}+${a}=${x+a}`}/> ✓
          </div>
        </div>
      </div>
    </div>
  );
}

// 4) زوايا المثلث — غيّر زاويتين ولاحظ الثالثة ونوع المثلث
function TriangleAngles() {
  const [A, setA] = useState(60);
  const [B, setB] = useState(60);
  const C = 180 - A - B;
  const valid = C > 0;
  const type = !valid
    ? "الزاويتان لا تسمحان بتكوين مثلث — راجع القياسات"
    : C === 90 || A === 90 || B === 90
    ? "مثلث قائم الزاوية"
    : A > 90 || B > 90 || C > 90
    ? "مثلث منفرج الزاوية"
    : "مثلث حاد الزوايا";
  const L = 260;
  const rad = (t: number) => (t * Math.PI) / 180;
  const side = valid ? L * Math.sin(rad(B)) / Math.sin(rad(C)) : 0;
  const apexX = side * Math.cos(rad(A));
  const apexY = side * Math.sin(rad(A));
  const minX = Math.min(0, apexX);
  const maxX = Math.max(L, apexX);
  const scale = Math.min(1, 170 / Math.max(apexY, 1), 300 / (maxX - minX));
  const Ax = 50 - minX * scale;
  const Ay = 210;
  const pts = { A: `${Ax},${Ay}`, B: `${Ax + L * scale},${Ay}`, C: `${Ax + apexX * scale},${Ay - apexY * scale}` };
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="قياس الزاوية أ" value={A} min={5} max={170} onChange={(v) => { setA(v); if (v + B >= 179) setB(178 - v); }} />
        <Slider label="قياس الزاوية ب" value={B} min={5} max={170} onChange={(v) => { setB(v); if (A + v >= 179) setA(178 - v); }} />
      </div>
      <div className="grid items-center gap-4 md:grid-cols-2">
        <svg width="100%" viewBox="0 0 400 240" className="rounded-2xl bg-white" role="img" aria-label="مثلث بزوايا قابلة للتعديل" direction="ltr">
          {valid && (
            <polygon points={`${pts.A} ${pts.B} ${pts.C}`} fill="#eef2ff" stroke="#4f46e5" strokeWidth="3" strokeLinejoin="round" />
          )}
          {valid && (
            <>
              <DiagramMath tex={`${A}^{\\circ}`} x={Ax-22} y={Ay+8} width={44} height={22} fontSize={13} color="#4338ca"/>
              <DiagramMath tex={`${B}^{\\circ}`} x={Ax+L*scale-22} y={Ay+8} width={44} height={22} fontSize={13} color="#4338ca"/>
              <DiagramMath tex={`${C}^{\\circ}`} x={Ax+apexX*scale-22} y={Math.max(0,Ay-apexY*scale-32)} width={44} height={26} fontSize={13} color="#047857"/>
            </>
          )}
        </svg>
        <div className="space-y-2 text-center">
          <div className="rounded-xl bg-white p-3 shadow-sm">
            قياس الزاوية ج: {valid ? <TeX tex={`${C}^{\\circ}`}/> : "—"}
          </div>
          <div className={`rounded-xl p-3 font-black ${valid ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
            {type}
          </div>
          <p className="text-xs font-bold text-slate-500">مجموع زوايا المثلث دائمًا <TeX tex={String.raw`180^{\circ}`}/></p>
        </div>
      </div>
    </div>
  );
}

// 5) النسبة ومعدل الوحدة
// النسبة المئوية = الجزء ÷ الكل × 100، ومعدل الوحدة = الكل ÷ الجزء.
function PercentRate() {
  const [part, setPart] = useState(20);
  const [whole, setWhole] = useState(80);
  const p = Math.min(part, whole);
  const pct = percentOf(p, whole);
  const rate = unitRate(whole, p);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="الجزء" value={p} min={0} max={200} onChange={(v) => { setPart(v); if (v > whole) setWhole(v); }} />
        <Slider label="الكل" value={whole} min={1} max={200} onChange={(v) => { setWhole(v); if (p > v) setPart(v); }} />
      </div>
      <div className="grid items-center gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
            <span>التمثيل البصري</span>
            <span dir="ltr"><TeX tex={`\\frac{${p}}{${whole}}`}/></span>
          </div>
          <div className="h-8 w-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-l from-brand-500 to-brand-700 transition-all duration-300" style={{ width: `${pct ?? 0}%` }} />
          </div>
        </div>
        <div className="grid gap-3 text-center sm:grid-cols-2">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-xs font-bold text-slate-500">النسبة المئوية</div>
            <div className="text-2xl font-black text-brand-700" dir="ltr" data-percent={`${p}/${whole}`}>
              {pct === null ? "غير معرّفة" : `${displayRational(p * 100, whole, 1)}%`}
            </div>
            <div className="mt-1 text-xs font-bold text-slate-500" dir="ltr">
              <TeX tex={`\\frac{${p}}{${whole}}\\times100`}/>
            </div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4">
            <div className="text-xs font-bold text-emerald-700">معدل الوحدة</div>
            <div className="text-2xl font-black text-emerald-800" dir="ltr" data-unit-rate={`${whole}/${p}`}>
              {rate === null ? "غير معرّف" : displayRational(whole, p, 3)}
            </div>
            <div className="mt-1 text-xs font-bold text-emerald-700" dir="ltr">
              {rate === null
                ? <TeX tex={`\\frac{${whole}}{0}`}/>
                : <TeX tex={`\\frac{${whole}}{${p}}${Number.isInteger(rate) ? `=${rate}` : `\\approx ${displayRational(whole, p, 3).replace("≈ ", "")}`}`}/>}
            </div>
            <p className="mt-1 text-[10px] font-bold leading-5 text-emerald-700" dir="rtl">
              {rate === null ? "القسمة على صفر غير معرّفة: لا معدل وحدة عندما يكون الجزء صفرًا." : "الكل ÷ الجزء = مقدار الكل لكل وحدة واحدة من الجزء."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const TOOLS: Record<string, { title: string; desc: string; Component: () => React.JSX.Element }> = {
  fraction: {
    title: "مستكشف الكسر",
    desc: "حرّك البسط والمقام لاستكشاف الكسور بين 0 و1؛ لاحظ التمثيل الدائري والقيمة العشرية والصورة المبسّطة.",
    Component: FractionExplorer,
  },
  numberline: {
    title: "خط الأعداد النسبية",
    desc: "ضع أي عدد نسبي (موجبًا أو سالبًا) على خط الأعداد وقارن موقعه بالأعداد الصحيحة.",
    Component: NumberLineExplorer,
  },
  equation: {
    title: "ميزان المعادلة",
    desc: "نمثل المجهول بالرمز x ونحافظ على التوازن بين طرفي المعادلة عند إجراء العملية نفسها عليهما.",
    Component: EquationBalance,
  },
  triangle: {
    title: "زوايا المثلث",
    desc: "غيّر زاويتين في المثلث ولاحظ كيف تتغير الزاوية الثالثة ونوع المثلث.",
    Component: TriangleAngles,
  },
  percent: {
    title: "النسبة ومعدل الوحدة",
    desc: "استكشف العلاقة بين الجزء والكل والنسبة المئوية، واحسب معدل الوحدة (الكل ÷ الجزء) بتمثيل بصري مباشر.",
    Component: PercentRate,
  },
};

export default function MathLab({ tool }: { tool: string }) {
  const t = TOOLS[tool] ?? TOOLS.fraction;
  const { Component } = t;
  return (
    <section className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-l from-brand-50/60 to-white shadow-sm">
      <div className="border-b border-brand-100 bg-white/70 px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-black text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-700 text-white">
            <TeX tex="\Sigma" />
          </span>
          {t.title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600"><MathText text={t.desc}/></p>
      </div>
      <div className="p-5">
        <Component />
      </div>
    </section>
  );
}
