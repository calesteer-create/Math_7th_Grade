"use client";

import { useId, useState } from "react";
import { ArrowLeftRight, Calculator, CheckCircle2, Layers, ListOrdered, RotateCcw, Sparkles, XCircle } from "lucide-react";
import TeX from "@/components/TeX";
import {
  RATIONAL_ASCENDING_EXAMPLE,
  RATIONAL_DESCENDING_EXAMPLE,
  compareFractions,
  betweenIntegers,
  fractionClass,
  fractionFromText,
  fractionTeX,
  lcmNumber,
  mixedNumberText,
  sortRationalTexts,
  type Fraction,
} from "@/lib/rational-numbers";
import { displayRational, rationalText, reduceFraction } from "@/lib/numbers";

export type RationalStudioMode = "full" | "builder" | "line" | "compare" | "order" | "decimal";
type StudioTab = Exclude<RationalStudioMode, "full">;

const TABS: { id: StudioTab; label: string }[] = [
  { id: "builder", label: "بانِي العدد العادي" },
  { id: "line", label: "على مستقيم الأعداد" },
  { id: "compare", label: "قارن عددين" },
  { id: "order", label: "رتّب مجموعة أعداد" },
  { id: "decimal", label: "بين الكسر والعشري" },
];

function Slider({ label, value, min, max, onChange, accent = "violet" }: {
  label: string; value: number; min: number; max: number; onChange: (value: number) => void; accent?: "violet" | "teal" | "rose";
}) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
        <span>{label}</span>
        <span className={`rounded-md px-2 py-0.5 font-black ${accent === "teal" ? "bg-teal-50 text-teal-700" : accent === "rose" ? "bg-rose-50 text-rose-700" : "bg-violet-50 text-violet-700"}`} dir="ltr">{value}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={event => onChange(Number(event.target.value))} className={`w-full ${accent === "teal" ? "accent-teal-600" : accent === "rose" ? "accent-rose-600" : "accent-violet-600"}`} dir="ltr" />
    </label>
  );
}

function Presets({ items, onPick }: { items: { label: string; apply: () => void }[]; onPick?: () => void }) {
  return <div className="flex flex-wrap gap-2">{items.map(item => <button key={item.label} type="button" onClick={() => { item.apply(); onPick?.(); }} className="rounded-xl border border-violet-200 bg-violet-50/70 px-3 py-1.5 text-xs font-extrabold text-violet-900 transition hover:bg-violet-100">{item.label}</button>)}</div>;
}

function fractionValueText(fraction: Fraction) {
  return displayRational(fraction.numerator, fraction.denominator, 4);
}

// ————— 1) باني العدد العادي —————
function BuilderTab() {
  const [numerator, setNumerator] = useState(-3);
  const [denominator, setDenominator] = useState(4);
  const fraction = { numerator, denominator };
  const reduced = reduceFraction(fraction.numerator, fraction.denominator);
  const kind = fractionClass(fraction);
  const decimal = fractionValueText(fraction);
  const kindText = kind === "integer" ? "عدد صحيح أيضًا؛ لأن المقام يختزل إلى 1" : kind === "proper" ? "كسر أصغر من 1 (قيمته بين 0 و1 أو بين -1 و0)" : "كسر أكبر من 1 بالقيمة المطلقة";

  return (
    <div className="space-y-5">
      <Presets items={[
        { label: "5/4", apply: () => { setNumerator(5); setDenominator(4); } },
        { label: "-1/4", apply: () => { setNumerator(-1); setDenominator(4); } },
        { label: "7/2", apply: () => { setNumerator(7); setDenominator(2); } },
        { label: "-9/4", apply: () => { setNumerator(-9); setDenominator(4); } },
        { label: "0/5", apply: () => { setNumerator(0); setDenominator(5); } },
      ]} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <Slider label="البسط (عدد صحيح)" value={numerator} min={-12} max={12} onChange={setNumerator} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <Slider label="المقام (عدد طبيعي موجب)" value={denominator} min={1} max={12} onChange={setDenominator} accent="teal" />
        </div>
      </div>

      <div role="status" data-studio-builder-result="true" className="rounded-2xl border border-violet-200 bg-gradient-to-l from-violet-50/80 to-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-2xl font-black text-ink" dir="ltr"><TeX tex={fractionTeX(fraction)} /></div>
          <div className="text-right text-xs font-bold leading-6 text-slate-700">
            <p>قيمته العشرية: <bdi dir="ltr" className="text-violet-700">{decimal}</bdi></p>
            <p>بأبسط صورة: <bdi dir="ltr" className="text-emerald-700"><TeX tex={fractionTeX(reduced)} /></bdi></p>
            {kind === "improper" && <p>بصورة عدد مختلط: <bdi dir="ltr"><TeX tex={mixedNumberText(fraction)} /></bdi></p>}
          </div>
        </div>
        <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-xs font-bold leading-6 text-slate-700">{kindText}. وكل كتابة من الشكل <TeX tex="\frac{a}{b}" /> ببسط صحيح ومقام طبيعي موجب تمثّل عددًا عاديًا.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center"><p className="text-[10px] font-bold text-slate-500">البسط صحيح؟</p><p className="mt-1 text-sm font-black text-emerald-700">نعم</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center"><p className="text-[10px] font-bold text-slate-500">المقام غير معدوم؟</p><p className="mt-1 text-sm font-black text-emerald-700">نعم</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 text-center"><p className="text-[10px] font-bold text-slate-500">داخل Q؟</p><p className="mt-1 text-sm font-black text-emerald-700">نعم</p></div>
      </div>
    </div>
  );
}

// ————— 2) خط الأعداد —————
const STUDIO_LINE = { min: -6, max: 6, start: 44, width: 752, y: 104 } as const;

function LineTab() {
  const [numerator, setNumerator] = useState(5);
  const [denominator, setDenominator] = useState(4);
  const fraction = { numerator, denominator };
  const value = numerator / denominator;
  const inRange = Number.isFinite(value) && value >= STUDIO_LINE.min && value <= STUDIO_LINE.max;
  const x = STUDIO_LINE.start + ((Math.max(STUDIO_LINE.min, Math.min(STUDIO_LINE.max, value)) - STUDIO_LINE.min) / (STUDIO_LINE.max - STUDIO_LINE.min)) * STUDIO_LINE.width;
  const bounds = betweenIntegers(value);
  const isInteger = Number.isInteger(value);
  const edgeDirection = value < STUDIO_LINE.min ? -1 : value > STUDIO_LINE.max ? 1 : 0;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  return (
    <div className="space-y-5">
      <Presets items={[
        { label: "5/4", apply: () => { setNumerator(5); setDenominator(4); } },
        { label: "-1/2", apply: () => { setNumerator(-1); setDenominator(2); } },
        { label: "7/2", apply: () => { setNumerator(7); setDenominator(2); } },
        { label: "-14/3", apply: () => { setNumerator(-14); setDenominator(3); } },
        { label: "9/4", apply: () => { setNumerator(9); setDenominator(4); } },
      ]} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="البسط" value={numerator} min={-24} max={24} onChange={setNumerator} />
        <Slider label="المقام" value={denominator} min={1} max={8} onChange={setDenominator} accent="teal" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-sky-200 bg-white p-3">
        <svg viewBox="0 0 840 190" className="block w-full min-w-[620px]" role="img" aria-label="تمثيل العدد العادي على مستقيم الأعداد" direction="ltr" data-rational-studio-line="true">
          <defs>
            <marker id={`${uid}-arrow`} markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto" markerUnits="userSpaceOnUse"><path d="M 0 0 L 8 4.5 L 0 9 L 2 4.5 Z" fill="#34416a" /></marker>
          </defs>
          <line x1="24" y1={STUDIO_LINE.y} x2="816" y2={STUDIO_LINE.y} stroke="#34416a" strokeWidth="1.9" markerEnd={`url(#${uid}-arrow)`} />
          {Array.from({ length: STUDIO_LINE.max - STUDIO_LINE.min + 1 }, (_, i) => STUDIO_LINE.min + i).map(tick => {
            const tx = STUDIO_LINE.start + ((tick - STUDIO_LINE.min) / (STUDIO_LINE.max - STUDIO_LINE.min)) * STUDIO_LINE.width;
            return <g key={tick} data-tick={tick}>
              <line x1={tx} x2={tx} y1={STUDIO_LINE.y - 8} y2={STUDIO_LINE.y + 8} stroke={tick === 0 ? "#0f172a" : "#64748b"} strokeWidth={tick === 0 ? 2.4 : 1.5} />
              <text x={tx} y={STUDIO_LINE.y + 30} textAnchor="middle" fontSize="15" fill={tick === 0 ? "#0f172a" : "#52607a"}>{tick}</text>
            </g>;
          })}
          {inRange && <>
            <line x1={x} x2={x} y1={STUDIO_LINE.y} y2={STUDIO_LINE.y - 46} stroke="#7c3aed" strokeWidth="1.4" strokeDasharray="3 3" />
            <circle data-studio-point="true" cx={x} cy={STUDIO_LINE.y} r="7.5" fill="#7c3aed" stroke="white" strokeWidth="2" style={{ transition: "cx 280ms ease" }} />
            <foreignObject x={Math.max(0, Math.min(770, x - 42))} y={30} width="84" height="34"><div dir="ltr" className="text-center text-[15px] font-bold text-violet-800"><TeX tex={fractionTeX(fraction)} /></div></foreignObject>
          </>}
          {!inRange && edgeDirection !== 0 && <g data-out-of-range="true">
            <circle cx={edgeDirection < 0 ? STUDIO_LINE.start : STUDIO_LINE.start + STUDIO_LINE.width} cy={STUDIO_LINE.y} r="8" fill="#fffbeb" stroke="#b45309" strokeWidth="2" strokeDasharray="4 3" />
            <text x={edgeDirection < 0 ? STUDIO_LINE.start : STUDIO_LINE.start + STUDIO_LINE.width - 8} y={STUDIO_LINE.y - 20} textAnchor="middle" fontSize="13" fontWeight="700" fill="#b45309" direction="ltr">خارج المجال</text>
          </g>}
        </svg>
      </div>

      <div role="status" className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 text-xs font-bold leading-6 text-slate-700">
        {inRange
          ? isInteger
            ? <>العدد يساوي العدد الصحيح <bdi dir="ltr" className="text-sky-800">{value}</bdi>، لذلك يقع تمامًا على تدريجته.</>
            : <>العدد يقع بين <bdi dir="ltr" className="text-sky-800">{bounds.lower}</bdi> و<bdi dir="ltr" className="text-sky-800">{bounds.upper}</bdi>؛ نقسم الوحدة بينهما إلى <bdi dir="ltr" className="text-sky-800">{denominator}</bdi> أجزاء متساوية ثم نعدّ من الصفر.</>
          : <>القيمة <bdi dir="ltr">{value}</bdi> خارج المجال المرسوم من -6 إلى 6، ولا تُرسم في موضع كاذب.</>}
        <span className="mt-1 block text-slate-500">القيمة العشرية: <bdi dir="ltr">{fractionValueText(fraction)}</bdi></span>
      </div>
    </div>
  );
}

// ————— 3) مقارنة عددين —————
function CompareTab() {
  const [left, setLeft] = useState<Fraction>({ numerator: -13, denominator: 15 });
  const [right, setRight] = useState<Fraction>({ numerator: -19, denominator: 21 });
  const relation = compareFractions(left, right);
  const symbol = relation < 0 ? "<" : relation > 0 ? ">" : "=";
  const common = lcmNumber(left.denominator, right.denominator);
  const leftScaled = { numerator: left.numerator * (common / left.denominator), denominator: common };
  const rightScaled = { numerator: right.numerator * (common / right.denominator), denominator: common };
  const sameSign = left.numerator * right.numerator > 0;
  const oppositeSigns = left.numerator * right.numerator < 0;

  return (
    <div className="space-y-5">
      <Presets items={[
        { label: "-13/15 مقابل -19/21", apply: () => { setLeft({ numerator: -13, denominator: 15 }); setRight({ numerator: -19, denominator: 21 }); } },
        { label: "-2 مقابل -1.25", apply: () => { setLeft({ numerator: -2, denominator: 1 }); setRight({ numerator: -5, denominator: 4 }); } },
        { label: "5/4 مقابل 2", apply: () => { setLeft({ numerator: 5, denominator: 4 }); setRight({ numerator: 2, denominator: 1 }); } },
        { label: "-1/2 مقابل 0", apply: () => { setLeft({ numerator: -1, denominator: 2 }); setRight({ numerator: 0, denominator: 1 }); } },
      ]} />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
          <p className="mb-2 text-xs font-extrabold text-rose-800">العدد الأول</p>
          <Slider label="البسط" value={left.numerator} min={-24} max={24} onChange={value => setLeft({ ...left, numerator: value })} accent="rose" />
          <div className="mt-3"><Slider label="المقام" value={left.denominator} min={1} max={12} onChange={value => setLeft({ ...left, denominator: value })} accent="rose" /></div>
        </div>
        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
          <p className="mb-2 text-xs font-extrabold text-sky-800">العدد الثاني</p>
          <Slider label="البسط" value={right.numerator} min={-24} max={24} onChange={value => setRight({ ...right, numerator: value })} accent="teal" />
          <div className="mt-3"><Slider label="المقام" value={right.denominator} min={1} max={12} onChange={value => setRight({ ...right, denominator: value })} accent="teal" /></div>
        </div>
      </div>

      <div role="status" data-studio-compare-result="true" className="rounded-2xl border border-emerald-200 bg-gradient-to-l from-emerald-50/80 to-white p-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xl font-black text-ink" dir="ltr">
          <TeX tex={fractionTeX(left)} /><span className="rounded-lg bg-emerald-600 px-3 py-1 text-white">{symbol}</span><TeX tex={fractionTeX(right)} />
        </div>
        <div className="mt-3 grid gap-2 text-xs font-bold leading-6 text-slate-700 sm:grid-cols-2">
          <p>القيمتان العشريتان: <bdi dir="ltr">{fractionValueText(left)}</bdi> و<bdi dir="ltr">{fractionValueText(right)}</bdi>.</p>
          <p>نوحّد المقامين على <bdi dir="ltr" className="text-emerald-800">{common}</bdi>: <bdi dir="ltr"><TeX tex={`${fractionTeX(left)}=${fractionTeX(leftScaled)}`} /> و<TeX tex={`${fractionTeX(right)}=${fractionTeX(rightScaled)}`} /></bdi>.</p>
        </div>
        <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-xs leading-6 text-slate-600">
          {oppositeSigns ? <>الإشارتان مختلفتان: العدد الموجب تمامًا أكبر من العدد السالب تمامًا، دون حاجة إلى حساب.</> : sameSign ? <>الإشارتان متشابهتان: بعد توحيد المقامين نقارن البسطين فقط. وتذكّر أن السالب الأقرب إلى الصفر هو الأكبر.</> : <>أحد العددين صفر، والصفر أكبر من كل سالب وأصغر من كل موجب.</>}
        </p>
      </div>
    </div>
  );
}

// ————— 4) الترتيب —————
const ORDER_SETS: { id: string; label: string; values: readonly string[] }[] = [
  { id: "asc", label: "تدريب 1 (تصاعديًا)", values: RATIONAL_ASCENDING_EXAMPLE },
  { id: "desc", label: "تدريب 2 (تنازليًا)", values: RATIONAL_DESCENDING_EXAMPLE },
  { id: "class", label: "مجموعة صفّية", values: ["-3/2", "0", "4/3", "-1/4", "2"] },
];

function OrderTab() {
  const [setId, setSetId] = useState("asc");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const set = ORDER_SETS.find(item => item.id === setId) ?? ORDER_SETS[0];
  const expected = sortRationalTexts(set.values, direction);
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const remaining = set.values.filter(value => !picked.includes(value));
  const correct = picked.length === expected.length && picked.every((value, index) => value === expected[index]);

  function reset(nextSet = setId, nextDirection = direction) {
    setSetId(nextSet); setDirection(nextDirection); setPicked([]); setChecked(false); setRevealed(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {ORDER_SETS.map(item => <button key={item.id} type="button" onClick={() => reset(item.id, direction)} aria-pressed={item.id === setId} className={`rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${item.id === setId ? "border-violet-600 bg-violet-600 text-white" : "border-violet-200 bg-white text-slate-600 hover:bg-violet-50"}`}>{item.label}</button>)}
        </div>
        <div className="flex overflow-hidden rounded-xl border border-slate-200">
          {(["asc", "desc"] as const).map(value => <button key={value} type="button" onClick={() => reset(setId, value)} aria-pressed={direction === value} className={`px-3 py-1.5 text-xs font-extrabold ${direction === value ? "bg-slate-800 text-white" : "bg-white text-slate-500"}`}>{value === "asc" ? "تصاعدي" : "تنازلي"}</button>)}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <p className="text-xs font-extrabold text-slate-500">الأعداد المعطاة — انقر عليها بالترتيب المطلوب:</p>
        <div className="mt-3 flex flex-wrap gap-2" dir="ltr">
          {remaining.map(value => <button key={value} type="button" onClick={() => { setPicked(previous => [...previous, value]); setChecked(false); }} className="rounded-xl border border-violet-300 bg-white px-3 py-2 text-sm font-black text-violet-800 transition hover:bg-violet-50" dir="ltr"><TeX tex={value.includes("/") ? `\\frac{${value.split("/")[0]}}{${value.split("/")[1]}}` : value} /></button>)}
          {!remaining.length && <span className="text-xs font-bold text-slate-400">نقلت كل الأعداد؛ راجع ترتيبك ثم تحقّق.</span>}
        </div>
      </div>

      <div className="space-y-2" aria-live="polite">
        {picked.map((value, index) => <div key={`${value}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-100 text-xs font-black text-violet-700" dir="ltr">{index + 1}</span>
          <bdi dir="ltr" className="flex-1 text-sm font-black text-ink"><TeX tex={value.includes("/") ? `\\frac{${value.split("/")[0]}}{${value.split("/")[1]}}` : value} /></bdi>
          <button type="button" onClick={() => { setPicked(previous => previous.filter((_, i) => i !== index)); setChecked(false); }} className="text-xs font-bold text-rose-600">إزالة</button>
        </div>)}
        {!picked.length && <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-xs font-bold text-slate-400">لم تبدأ الترتيب بعد؛ ابدأ بالعدد الذي يجب أن يأتي أولًا.</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setChecked(true)} disabled={picked.length !== set.values.length} className="btn btn-primary text-xs disabled:opacity-40">تحقّق من ترتيبي</button>
        <button type="button" onClick={() => setRevealed(true)} className="btn btn-ghost text-xs">أظهر الترتيب الصحيح</button>
        <button type="button" onClick={() => reset()} className="btn btn-ghost text-xs"><RotateCcw size={13} /> إعادة</button>
      </div>

      {checked && <div role="status" data-studio-order-result="true" className={`flex items-start gap-2 rounded-2xl border p-4 text-sm font-bold leading-7 ${correct ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
        {correct ? <CheckCircle2 size={19} className="mt-1 shrink-0" /> : <XCircle size={19} className="mt-1 shrink-0" />}
        <div>{correct ? "ترتيب صحيح تمامًا: قارنت الإشارات ثم وازنت بين الأعداد." : "ليس بعد. اعزل الأعداد السالبة أولًا، ثم قارن بينها وبين الموجبة. يمكنك إظهار الترتيب الصحيح ومقارنته بترتيبك."}
          {revealed && <div className="mt-2 flex flex-wrap items-center gap-1 text-xs" dir="ltr">{expected.map((value, index) => <span key={value} className="flex items-center gap-1"><bdi className="font-black"><TeX tex={value.includes("/") ? `\\frac{${value.split("/")[0]}}{${value.split("/")[1]}}` : value} /></bdi>{index < expected.length - 1 && <span className="text-slate-400">{direction === "asc" ? "<" : ">"}</span>}</span>)}</div>}
        </div>
      </div>}

      {revealed && <div className="rounded-2xl border border-violet-200 bg-white p-4">
        <p className="mb-2 text-xs font-extrabold text-slate-500">الترتيب {direction === "asc" ? "التصاعدي" : "التنازلي"} الصحيح:</p>
        <div className="flex flex-wrap items-center gap-2" dir="ltr">
          {expected.map((value, index) => <span key={value} className="flex items-center gap-2"><bdi className="rounded-lg bg-violet-50 px-2 py-1 text-sm font-black text-violet-800"><TeX tex={value.includes("/") ? `\\frac{${value.split("/")[0]}}{${value.split("/")[1]}}` : value} /></bdi>{index < expected.length - 1 && <span className="font-black text-slate-400">{direction === "asc" ? "<" : ">"}</span>}</span>)}
        </div>
      </div>}
    </div>
  );
}

// ————— 5) بين الكسر والعشري —————
function DecimalTab() {
  const [numerator, setNumerator] = useState(17);
  const [denominator, setDenominator] = useState(4);
  const [decimalText, setDecimalText] = useState("4.25");
  const fraction = { numerator, denominator };
  const decimal = fractionValueText(fraction);
  const reduced = reduceFraction(fraction.numerator, fraction.denominator);
  const division = rationalText(numerator, denominator, { maxFractionDigits: 6 });
  const parsed = fractionFromText(decimalText);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
          <p className="mb-3 text-xs font-extrabold text-rose-800">من كسر عادي إلى عدد عشري</p>
          <Slider label="البسط" value={numerator} min={-24} max={24} onChange={setNumerator} accent="rose" />
          <div className="mt-3"><Slider label="المقام" value={denominator} min={1} max={12} onChange={setDenominator} accent="rose" /></div>
          <div role="status" data-studio-decimal-result="true" className="mt-3 rounded-xl bg-white p-3 text-center">
            <div className="text-xl font-black text-ink" dir="ltr"><TeX tex={fractionTeX(fraction)} /><span className="mx-2">=</span><span className={division.approximate ? "text-amber-700" : "text-emerald-700"}>{decimal}</span></div>
            <p className="mt-2 text-[11px] font-bold leading-5 text-slate-500">{division.approximate ? "الكتابة العشرية تقريبية؛ القسمة لا تنتهي، لذا نستعمل ≈." : "الكتابة العشرية مطابقة تمامًا للكسر؛ القسمة تنتهي."}</p>
            <p className="mt-1 text-[11px] font-bold text-slate-500">بأبسط صورة: <bdi dir="ltr"><TeX tex={fractionTeX(reduced)} /></bdi></p>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
          <p className="mb-3 text-xs font-extrabold text-sky-800">من عدد عشري إلى كسر عادي</p>
          <label className="block text-xs font-bold text-slate-600">اكتب عددًا عشريًا (بالفاصلة الإنجليزية)
            <input value={decimalText} onChange={event => setDecimalText(event.target.value)} dir="ltr" inputMode="decimal" aria-label="عدد عشري لتحويله إلى كسر" className="input mt-1 block w-full max-w-xs text-left" placeholder="مثال: 4.25" />
          </label>
          <div role="status" className="mt-3 rounded-xl bg-white p-3 text-center">
            {parsed ? <>
              <div className="text-xl font-black text-ink" dir="ltr">{decimalText.replace("+", "")}<span className="mx-2">=</span><TeX tex={fractionTeX(parsed)} /></div>
              <p className="mt-2 text-[11px] font-bold leading-5 text-slate-500">المقام قوة للعدد 10 بحسب عدد المنازل العشرية، ثم نختزل. وبأبسط صورة: <bdi dir="ltr"><TeX tex={fractionTeX(reduceFraction(parsed.numerator, parsed.denominator))} /></bdi></p>
            </> : <p className="text-xs font-bold text-rose-700">أدخل عددًا عشريًا صالحًا مثل <bdi dir="ltr">0.03</bdi> أو <bdi dir="ltr">4.25</bdi>.</p>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {["3.5", "4.25", "0.03", "-6.25"].map(value => <button key={value} type="button" onClick={() => setDecimalText(value)} className="rounded-lg border border-sky-200 bg-white px-2.5 py-1 text-xs font-extrabold text-sky-800" dir="ltr">{value}</button>)}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs font-bold leading-6 text-slate-700">
        <p>الفاصلة العشرية تخبرنا عن المقام: منزلة واحدة تعني <TeX tex="10" />، ومنزلتان تعنيان <TeX tex="100" />، وثلاث منازل تعني <TeX tex="1000" />. لذلك <bdi dir="ltr"><TeX tex="0.03=\frac{3}{100}" /></bdi>، و<bdi dir="ltr"><TeX tex="4.25=\frac{425}{100}=\frac{17}{4}" /></bdi>.</p>
      </div>
    </div>
  );
}

export default function RationalNumbersStudio({ mode = "full" }: { mode?: RationalStudioMode }) {
  const initial: StudioTab = mode === "full" ? "builder" : mode;
  const [tab, setTab] = useState<StudioTab>(initial);
  const uid = useId();
  const showTabs = mode === "full";

  const iconFor = (value: StudioTab) => {
    switch (value) {
      case "builder": return <Sparkles size={15} />;
      case "line": return <Calculator size={15} />;
      case "compare": return <ArrowLeftRight size={15} />;
      case "order": return <ListOrdered size={15} />;
      case "decimal": return <Layers size={15} />;
    }
  };

  return (
    <section data-rational-studio="true" className="overflow-hidden rounded-[26px] border border-violet-200 bg-white shadow-[0_14px_40px_-28px_rgba(37,24,104,.28)]">
      <header className="border-b border-violet-100 bg-gradient-to-l from-violet-50/80 via-white to-teal-50/50 px-6 py-5">
        <span className="text-[11px] font-extrabold text-violet-700">مختبر الأعداد العادية</span>
        <h3 className="mt-1 text-lg font-black text-ink">جرّب الكسر والعشري والمستقيم والمقارنة بيدك</h3>
        <p className="mt-1 text-xs leading-6 text-slate-500">غيّر البسط والمقام، لاحظ القيمة والموضع والترتيب، ثم تحقّق من القاعدة بنفسك.</p>
        {showTabs && <div role="tablist" aria-label="أدوات مختبر الأعداد العادية" className="mt-4 flex flex-wrap gap-2">
          {TABS.map(item => {
            const active = item.id === tab;
            return <button key={item.id} id={`${uid}-tab-${item.id}`} type="button" role="tab" aria-selected={active} aria-controls={`${uid}-panel`} onClick={() => setTab(item.id)} className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${active ? "border-violet-600 bg-violet-600 text-white shadow-xs" : "border-violet-200 bg-white text-slate-600 hover:border-violet-400 hover:text-violet-900"}`}>{iconFor(item.id)}<span>{item.label}</span></button>;
          })}
        </div>}
      </header>
      <div id={`${uid}-panel`} role="tabpanel" className="p-6">
        {tab === "builder" && <BuilderTab />}
        {tab === "line" && <LineTab />}
        {tab === "compare" && <CompareTab />}
        {tab === "order" && <OrderTab />}
        {tab === "decimal" && <DecimalTab />}
      </div>
    </section>
  );
}
