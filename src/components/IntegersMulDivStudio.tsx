"use client";

import { useId, useState } from "react";
import { ArrowLeftRight, Calculator, Divide, Layers, RotateCcw, Sparkles, XCircle } from "lucide-react";
import TeX from "@/components/TeX";
import MathText from "@/components/MathText";
import DiagramMath from "@/components/DiagramMath";
import {
  analyzeDivision,
  analyzeProduct,
  buildMulPattern,
  signedIntTeX,
} from "@/lib/integers-mul-div";

export type IntegersMulDivStudioMode = "full" | "pattern" | "signcount" | "shorthand" | "division";
type StudioTab = "pattern" | "signcount" | "shorthand" | "division";

const TABS: { id: StudioTab; label: string }[] = [
  { id: "pattern", label: "لماذا السالب × السالب موجب؟" },
  { id: "signcount", label: "عدّاد الإشارات والخواص" },
  { id: "shorthand", label: "الكتابة المختزلة والفخاخ" },
  { id: "division", label: "مستكشف القسمة والصفر" },
];

function PatternTab() {
  const [a, setA] = useState(-4);
  const [b, setB] = useState(-5);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rows = buildMulPattern(a, 3, -5);
  const product = a * b;
  const normalizedProd = product === 0 ? 0 : product;
  const sameSign = a !== 0 && b !== 0 && ((a > 0 && b > 0) || (a < 0 && b < 0));

  const presets = [
    { label: "(-4) × (-5)", a: -4, b: -5 },
    { label: "(+6) × (+2)", a: 6, b: 2 },
    { label: "(+5) × (-5)", a: 5, b: -5 },
    { label: "(-7) × (+2)", a: -7, b: 2 },
    { label: "(-4) × 0", a: -4, b: 0 },
  ];

  // رسم خط تغيّر النواتج على مدى [-15, 25]
  const minX = Math.min(-12, ...rows.map(r => r.product), -4);
  const maxX = Math.max(20, ...rows.map(r => r.product), 4);
  const span = Math.max(1, maxX - minX);
  const mapX = (v: number) => 48 + ((v - minX) / span) * 744;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => { setA(p.a); setB(p.b); }}
              className="rounded-xl border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-extrabold text-teal-900 transition hover:bg-teal-100"
              dir="ltr"
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => { setA(-4); setB(-5); }}
          className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw size={13} /> استعادة مثال الكتاب
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-extrabold text-slate-600">
            <span>العامل الأول (<TeX tex="a" />)</span>
            <span className="rounded-lg bg-white px-2.5 py-0.5 text-sm font-black text-teal-700" dir="ltr">
              <TeX tex={signedIntTeX(a, a !== 0)} />
            </span>
          </div>
          <input
            type="range"
            min={-7}
            max={7}
            step={1}
            value={a}
            aria-label="العامل الأول في الضرب"
            onChange={e => setA(Number(e.target.value))}
            dir="ltr"
            className="w-full accent-teal-600"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-extrabold text-slate-600">
            <span>العامل الثاني (<TeX tex="b" />)</span>
            <span className="rounded-lg bg-white px-2.5 py-0.5 text-sm font-black text-violet-700" dir="ltr">
              <TeX tex={signedIntTeX(b, b !== 0)} />
            </span>
          </div>
          <input
            type="range"
            min={-5}
            max={3}
            step={1}
            value={b}
            aria-label="العامل الثاني في الضرب"
            onChange={e => setB(Number(e.target.value))}
            dir="ltr"
            className="w-full accent-violet-600"
          />
        </div>
      </div>

      <div role="status" data-studio-pattern-result="true" className="rounded-2xl border border-teal-200 bg-gradient-to-l from-teal-50/80 to-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xl font-black text-ink">
            <TeX tex={`(${signedIntTeX(a, a !== 0)})\\times(${signedIntTeX(b, b !== 0)})=${signedIntTeX(normalizedProd, normalizedProd !== 0)}`} />
          </div>
          <div className="text-xs font-bold leading-6 text-slate-700">
            {a === 0 || b === 0 ? (
              <span>وجود الصفر يجعل الجداء <TeX tex="0" /> مباشرةً (<TeX tex="a\times 0=0" />).</span>
            ) : sameSign ? (
              <span className="text-emerald-800">
                الإشارتان متفقتان ← الناتج موجب (<TeX tex="+" />)، ونضرب البُعدين <TeX tex={`${Math.abs(a)}\\times${Math.abs(b)}=${Math.abs(normalizedProd)}`} />.
              </span>
            ) : (
              <span className="text-rose-800">
                الإشارتان مختلفتان ← الناتج سالب (<TeX tex="-" />)، ونضرب البُعدين <TeX tex={`${Math.abs(a)}\\times${Math.abs(b)}=${Math.abs(normalizedProd)}`} />.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3">
        <svg viewBox="0 0 840 110" className="block w-full min-w-[520px]" role="img" aria-label="تمثيل موضع ناتج الضرب على خط الأعداد" direction="ltr">
          <defs>
            <marker id={`${uid}-arrow`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="userSpaceOnUse">
              <path d="M 0 0 L 7.5 4 L 0 8 Z" fill="#334155" />
            </marker>
          </defs>
          <line x1="20" y1="64" x2="820" y2="64" stroke="#334155" strokeWidth="1.8" markerEnd={`url(#${uid}-arrow)`} />
          <line x1={mapX(0)} x2={mapX(0)} y1="52" y2="76" stroke="#0f172a" strokeWidth="2.4" />
          <DiagramMath tex="0" x={mapX(0) - 16} y={78} width={32} height={24} fontSize={14} color="#0f172a" />
          <circle cx={mapX(normalizedProd)} cy="64" r="7.5" fill={normalizedProd > 0 ? "#059669" : normalizedProd < 0 ? "#e11d48" : "#334155"} stroke="white" strokeWidth="2" />
          <DiagramMath
            tex={signedIntTeX(normalizedProd, normalizedProd !== 0)}
            x={mapX(normalizedProd) - 24}
            y={20}
            width={48}
            height={28}
            fontSize={16}
            color={normalizedProd > 0 ? "#065f46" : normalizedProd < 0 ? "#9f1239" : "#0f172a"}
          />
        </svg>
      </div>

      <div>
        <p className="mb-2 text-xs font-extrabold text-slate-500">
          سُلّم النمط: مع كل خطوة ينقص العامل الثاني بمقدار <TeX tex="1" /> ← يتغيّر الناتج بمقدار <TeX tex={signedIntTeX(-a, -a !== 0)} />:
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {rows.map(row => {
            const active = row.b === b;
            return (
              <button
                key={row.b}
                type="button"
                onClick={() => setB(row.b)}
                className={`rounded-xl border p-2.5 text-center transition ${
                  active
                    ? "border-violet-600 bg-violet-100/90 ring-2 ring-violet-300"
                    : row.b === 0
                      ? "border-slate-300 bg-slate-100/80 hover:border-slate-400"
                      : "border-slate-200 bg-white hover:border-violet-300"
                }`}
              >
                <div className="text-[11px] font-bold text-slate-500">
                  <TeX tex={`(${signedIntTeX(a, a !== 0)})\\times(${signedIntTeX(row.b, row.b !== 0)})`} />
                </div>
                <div className="mt-1 text-sm font-black text-ink">
                  <TeX tex={signedIntTeX(row.product === 0 ? 0 : row.product, row.product !== 0)} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SignCountTab() {
  const [factors, setFactors] = useState<number[]>([-2, -3, -4, -5]);
  const info = analyzeProduct(factors);

  const presets = [
    { label: "(-2)(-3)(-4)(-5)", list: [-2, -3, -4, -5] },
    { label: "(-1)(-2)(-5)", list: [-1, -2, -5] },
    { label: "(-7)(+5)", list: [-7, 5] },
    { label: "(-5)(+3)(+2)", list: [-5, 3, 2] },
    { label: "(-12)(-4)(0)(-9)", list: [-12, -4, 0, -9] },
  ];

  function updateAt(idx: number, val: number) {
    setFactors(prev => prev.map((x, i) => (i === idx ? val : x)));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => setFactors(p.list)}
              className="rounded-xl border border-violet-200 bg-violet-50/70 px-3 py-1.5 text-xs font-extrabold text-violet-900 transition hover:bg-violet-100"
              dir="ltr"
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={factors.length <= 2}
            onClick={() => setFactors(prev => prev.slice(0, -1))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
          >
            إزالة عامل
          </button>
          <button
            type="button"
            disabled={factors.length >= 5}
            onClick={() => setFactors(prev => [...prev, -2])}
            className="rounded-xl border border-violet-300 bg-violet-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40"
          >
            + إضافة عامل
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {factors.map((val, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border p-3.5 ${
              val === 0
                ? "border-slate-300 bg-slate-100/80"
                : val < 0
                  ? "border-rose-200 bg-rose-50/50"
                  : "border-emerald-200 bg-emerald-50/50"
            }`}
          >
            <div className="mb-2 flex items-center justify-between text-xs font-extrabold">
              <span>العامل <bdi dir="ltr">{idx + 1}</bdi></span>
              <span className="rounded-lg bg-white px-2 py-0.5 text-sm font-black" dir="ltr">
                <TeX tex={signedIntTeX(val, val !== 0)} />
              </span>
            </div>
            <input
              type="range"
              min={-12}
              max={12}
              step={1}
              value={val}
              aria-label={`العامل ${idx + 1}`}
              onChange={e => updateAt(idx, Number(e.target.value))}
              dir="ltr"
              className="w-full accent-violet-600"
            />
          </div>
        ))}
      </div>

      <div role="status" data-studio-signcount-result="true" className="grid gap-4 rounded-2xl border border-violet-200 bg-gradient-to-l from-violet-50/70 to-white p-5 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-xs font-extrabold text-violet-700">العبارة المختزلة والناتج</p>
          <div className="mt-2 text-lg font-black text-ink">
            <TeX tex={`${factors.map(v => `(${signedIntTeX(v, v !== 0)})`).join("")}=${signedIntTeX(info.product, info.product !== 0)}`} />
          </div>
          <p className="mt-2 text-xs leading-6 text-slate-600">
            <MathText text="يمكننا تبديل ترتيب العوامل أو تجميعها بأي زوج مريح لأن الضرب تبديلي وتجميعي في \\(\\mathbb{Z}\\)، والناتج لا يتغير." />
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-500">
            <span>عدد الإشارات السالبة</span>
            <span className="rounded-full bg-violet-100 px-3 py-0.5 text-sm font-black text-violet-900" dir="ltr">
              {info.negativeCount}
            </span>
          </div>
          <p className="mt-2 text-sm font-extrabold text-ink">
            {info.signParity === "zero" ? (
              <span className="text-slate-700">أحد العوامل يساوي <TeX tex="0" /> ← الناتج <TeX tex="0" /> فورًا.</span>
            ) : info.signParity === "even" ? (
              <span className="text-emerald-800">عدد الإشارات السالبة زوجي ← إشارة الناتج (<TeX tex="+" />).</span>
            ) : (
              <span className="text-rose-800">عدد الإشارات السالبة فردي ← إشارة الناتج (<TeX tex="-" />).</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

const SHORTHAND_CASES = [
  {
    id: "case1",
    label: "(-5) × (+8)",
    full: "(-5)\\times(+8)",
    short: "(-5)(+8)",
    canDrop: true,
    value: "-40",
    rule: "جاء بعد إشارة الضرب قوس، فيُستغنى عن × وتبقى العملية ضربًا: (-5)(+8) = -40.",
    contrast: "(-5)+(+8)=+3 (هنا يوجد + بين القوسين فليست ضربًا).",
  },
  {
    id: "case2",
    label: "-15 × a",
    full: "-15\\times a",
    short: "-15a",
    canDrop: true,
    value: "-15a",
    rule: "جاء بعد إشارة الضرب حرف (متغيّر)، فيُستغنى عن × وتُكتب -15a.",
    contrast: "في a × (-15) نضع العدد أمام الحرف عند الاختزال: -15a.",
  },
  {
    id: "case3",
    label: "9 × (x + 2)",
    full: "9\\times(x+2)",
    short: "9(x+2)",
    canDrop: true,
    value: "9(x+2)",
    rule: "جاء بعد إشارة الضرب قوس، فيُستغنى عن × وتُكتب 9(x+2).",
    contrast: "9+(x+2) تحتوي إشارة + صريحة فلا تحذف شيئًا وهي جمع وليست ضربًا.",
  },
  {
    id: "case4",
    label: "(-4)(-2) مقابل -4 - 2",
    full: "(-4)\\times(-2)",
    short: "(-4)(-2)",
    canDrop: true,
    value: "+8",
    rule: "قوسان متجاوران بلا إشارة بينهما يعنيان ضربًا: (-4)(-2) = +8.",
    contrast: "أما -4-2 فهي كتابة مختزلة للجمع (-4)+(-2) = -6 وليست ضربًا!",
  },
  {
    id: "case5",
    label: "9 × 4 (حالة ممنوعة)",
    full: "9\\times 4",
    short: "9(4)",
    canDrop: false,
    value: "36",
    rule: "لا يمكن حذف × بين عددين مجردين دون أقواس لأن 94 يُقرأ أربعة وتسعين لا 36!",
    contrast: "إذا أردنا الاختزال هنا نضع قوسًا: 9(4) = 36.",
  },
] as const;

function ShorthandTab() {
  const [selectedId, setSelectedId] = useState<string>(SHORTHAND_CASES[0].id);
  const [compactMode, setCompactMode] = useState(true);
  const current = SHORTHAND_CASES.find(c => c.id === selectedId) ?? SHORTHAND_CASES[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {SHORTHAND_CASES.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedId(item.id)}
            className={`rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${
              item.id === current.id
                ? "border-amber-500 bg-amber-100 text-amber-950"
                : "border-slate-200 bg-white text-slate-600 hover:border-amber-300"
            }`}
            dir="ltr"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3">
        <span className="text-xs font-extrabold text-amber-950">بدّل بين الصيغة الكاملة والصيغة المختزلة:</span>
        <button
          type="button"
          onClick={() => setCompactMode(m => !m)}
          className="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-extrabold text-white transition hover:bg-amber-700"
        >
          {compactMode ? "إظهار علامة × الكاملة" : "تطبيق الكتابة المختزلة"}
        </button>
      </div>

      <div role="status" data-studio-shorthand-result="true" className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-5 text-center">
          <span className="text-[11px] font-extrabold text-violet-700">
            {compactMode ? "الكتابة المختزلة" : "العملية مع علامة ×"}
          </span>
          <div className="mt-3 text-2xl font-black text-ink">
            <TeX tex={compactMode ? current.short : current.full} block />
          </div>
          <p className="mt-3 text-xs font-bold leading-6 text-slate-700">
            <MathText text={current.rule} />
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
          <div className="flex items-center gap-2 text-xs font-extrabold text-rose-800">
            <XCircle size={15} /> قارن ولا تخلط:
          </div>
          <p className="mt-2 text-sm font-bold leading-7 text-ink">
            <MathText text={current.contrast} />
          </p>
          <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-extrabold text-slate-600">
            الحكم: {current.canDrop ? "يجوز حذف × مع الحفاظ على القوس أو الحرف." : "ممنوع حذف × بين رقمين دون أقواس."}
          </div>
        </div>
      </div>
    </div>
  );
}

function DivisionTab() {
  const [dividend, setDividend] = useState(-48);
  const [divisor, setDivisor] = useState(-6);
  const [fractionForm, setFractionForm] = useState(false);
  const [orderCheck, setOrderCheck] = useState(false);

  const divInfo = analyzeDivision(dividend, divisor);
  const swapped = analyzeDivision(divisor, dividend);

  const presets = [
    { label: "(-48) ÷ (-6)", a: -48, b: -6, frac: true },
    { label: "(-63) ÷ 7", a: -63, b: 7, frac: true },
    { label: "(+6) ÷ (+2)", a: 6, b: 2, frac: false },
    { label: "(-24) ÷ (-2)", a: -24, b: -2, frac: false },
    { label: "(-15) ÷ (+3)", a: -15, b: 3, frac: false },
    { label: "(+8) ÷ (-8)", a: 8, b: -8, frac: false },
    { label: "0 ÷ (-3)", a: 0, b: -3, frac: false },
    { label: "4 ÷ 0", a: 4, b: 0, frac: false },
  ];

  const exprTeX = fractionForm
    ? `\\frac{${signedIntTeX(dividend, dividend > 0 && !presets.some(p => p.a === dividend && p.frac))}}{${signedIntTeX(divisor, false)}}`
    : `(${signedIntTeX(dividend, dividend !== 0)})\\div(${signedIntTeX(divisor, divisor !== 0)})`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => { setDividend(p.a); setDivisor(p.b); setFractionForm(p.frac); }}
              className="rounded-xl border border-sky-200 bg-sky-50/70 px-3 py-1.5 text-xs font-extrabold text-sky-900 transition hover:bg-sky-100"
              dir="ltr"
            >
              {p.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setFractionForm(f => !f)}
          className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-extrabold text-indigo-800 hover:bg-indigo-100"
        >
          {fractionForm ? "عرض بصيغة ÷" : "عرض بصيغة الكسر"}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-extrabold text-slate-600">
            <span>المقسوم (<TeX tex="a" />)</span>
            <span className="rounded-lg bg-white px-2.5 py-0.5 text-sm font-black text-sky-700" dir="ltr">
              <TeX tex={signedIntTeX(dividend, dividend !== 0)} />
            </span>
          </div>
          <input
            type="range"
            min={-64}
            max={64}
            step={1}
            value={dividend}
            aria-label="المقسوم"
            onChange={e => setDividend(Number(e.target.value))}
            dir="ltr"
            className="w-full accent-sky-600"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-extrabold text-slate-600">
            <span>المقسوم عليه (<TeX tex="b" />)</span>
            <span className={`rounded-lg px-2.5 py-0.5 text-sm font-black ${divisor === 0 ? "bg-rose-100 text-rose-700" : "bg-white text-indigo-700"}`} dir="ltr">
              <TeX tex={signedIntTeX(divisor, divisor !== 0)} />
            </span>
          </div>
          <input
            type="range"
            min={-12}
            max={12}
            step={1}
            value={divisor}
            aria-label="المقسوم عليه"
            onChange={e => setDivisor(Number(e.target.value))}
            dir="ltr"
            className="w-full accent-indigo-600"
          />
        </div>
      </div>

      <div role="status" data-studio-division-result="true" className={`rounded-2xl border p-5 ${divInfo.possible ? "border-sky-200 bg-gradient-to-l from-sky-50/80 to-white" : "border-rose-300 bg-rose-50/80"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xl font-black text-ink">
            <TeX tex={exprTeX} />{" "}
            {divInfo.possible ? (
              divInfo.exactInteger ? (
                <TeX tex={`=${divInfo.quotientText}`} />
              ) : (
                <span className="text-sm font-extrabold text-amber-800"> (ناتج كسري غير صحيح في <TeX tex="\mathbb{Z}" />)</span>
              )
            ) : (
              <span className="rounded-lg bg-rose-600 px-3 py-1 text-sm font-black text-white">قسمة غير ممكنة!</span>
            )}
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700">
            التحقق بالضرب: <TeX tex={divInfo.checkTeX} />
          </div>
        </div>
        <p className="mt-3 text-xs font-bold leading-6 text-slate-600">
          {!divInfo.possible ? (
            "شرط القسمة الأساسي أن يكون المقسوم عليه غير معدوم؛ لا يوجد عدد صحيح إذا ضُرب بصفر أعطى عددًا غير الصفر."
          ) : dividend === 0 ? (
            "الصفر مقسومًا على أي عدد غير معدوم يساوي صفرًا لأن ناتج ضرب الصفر في المقسوم عليه هو صفر."
          ) : divInfo.sameSign ? (
            "المقسوم والمقسوم عليه لهما الإشارة نفسها ← إشارة الناتج موجبة (+)."
          ) : (
            "المقسوم والمقسوم عليه مختلفان في الإشارة ← إشارة الناتج سالبة (−)."
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-extrabold text-slate-700">اختبر تبديل الطرفين ومقارنة التجميع:</span>
          <button
            type="button"
            onClick={() => setOrderCheck(v => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-extrabold text-indigo-700 hover:bg-indigo-50"
          >
            <ArrowLeftRight size={14} /> {orderCheck ? "إخفاء المقارنة" : "مقارنة التبديل والتجميع"}
          </button>
        </div>
        {orderCheck && (
          <div className="mt-3 grid gap-3 md:grid-cols-2 text-xs leading-6">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-extrabold text-rose-800">ليست تبديلية:</p>
              <p className="mt-1">
                <TeX tex={`(${signedIntTeX(dividend, dividend !== 0)})\\div(${signedIntTeX(divisor, divisor !== 0)})`} />{" "}
                نحو{" "}
                <bdi dir="ltr" className="font-bold">{divInfo.quotientText}</bdi>، بينما{" "}
                <TeX tex={`(${signedIntTeX(divisor, divisor !== 0)})\\div(${signedIntTeX(dividend, dividend !== 0)})`} />{" "}
                هو <bdi dir="ltr" className="font-bold">{swapped.quotientText}</bdi>.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-extrabold text-rose-800">ليست تجميعية:</p>
              <p className="mt-1">
                <TeX tex="\bigl((-24)\div(+6)\bigr)\div(-2)=(-4)\div(-2)=+2" />، بينما{" "}
                <TeX tex="(-24)\div\bigl((+6)\div(-2)\bigr)=(-24)\div(-3)=+8" />، و<TeX tex="+2\neq +8" />.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IntegersMulDivStudio({ mode = "full" }: { mode?: IntegersMulDivStudioMode }) {
  const initial: StudioTab = mode === "full" ? "pattern" : mode;
  const [tab, setTab] = useState<StudioTab>(initial);
  const uid = useId();
  const showTabs = mode === "full";

  const iconFor = (t: StudioTab) => {
    switch (t) {
      case "pattern": return <Sparkles size={15} />;
      case "signcount": return <Layers size={15} />;
      case "shorthand": return <Calculator size={15} />;
      case "division": return <Divide size={15} />;
    }
  };

  return (
    <section
      data-integers-mul-div-studio="true"
      className="overflow-hidden rounded-[26px] border border-violet-200 bg-white shadow-[0_14px_40px_-28px_rgba(37,24,104,.28)]"
    >
      <header className="border-b border-violet-100 bg-gradient-to-l from-violet-50/80 via-white to-teal-50/50 px-6 py-5">
        <span className="text-[11px] font-extrabold text-violet-700">مختبر الضرب والقسمة في الأعداد الصحيحة</span>
        <h3 className="mt-1 text-lg font-black text-ink">جرّب الإشارات والأنماط والقسمة بيدك</h3>
        <p className="mt-1 text-xs leading-6 text-slate-500">
          استكشف سبب قاعدة الإشارات، عدّ الإشارات السالبة في جداء متعدد، الاختزال، وشرط المقسوم عليه غير المعدوم.
        </p>

        {showTabs && (
          <div role="tablist" aria-label="أدوات مختبر الضرب والقسمة" className="mt-4 flex flex-wrap gap-2">
            {TABS.map(item => {
              const active = item.id === tab;
              return (
                <button
                  key={item.id}
                  id={`${uid}-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`${uid}-panel`}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${
                    active
                      ? "border-violet-600 bg-violet-600 text-white shadow-xs"
                      : "border-violet-200 bg-white text-slate-600 hover:border-violet-400 hover:text-violet-900"
                  }`}
                >
                  {iconFor(item.id)}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      <div id={`${uid}-panel`} role="tabpanel" className="p-6">
        {tab === "pattern" && <PatternTab />}
        {tab === "signcount" && <SignCountTab />}
        {tab === "shorthand" && <ShorthandTab />}
        {tab === "division" && <DivisionTab />}
      </div>
    </section>
  );
}
