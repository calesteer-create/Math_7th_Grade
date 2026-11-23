"use client";

import { useId, useState } from "react";
import { Calculator, Divide, Scale, Sparkles } from "lucide-react";
import TeX from "@/components/TeX";
import { BalanceScaleSvg } from "@/components/figures/EquationsFigures";
import { frac, fracToTeX, linearToTeX } from "@/lib/algebraic-expressions";
import {
  checkLinearSolution,
  formatSolutionTeX,
  solveAdditive,
  solveMultiplicative,
  type EquationsStudioMode,
} from "@/lib/solving-equations";

export type EquationsStudioTab = Exclude<EquationsStudioMode, "full">;

const TABS: { id: EquationsStudioTab; label: string }[] = [
  { id: "balance", label: "ميزان التحقّق" },
  { id: "mental", label: "الحلّ الذهني" },
  { id: "axc", label: "معادلة ax = c" },
  { id: "problems", label: "توظيف في مسائل" },
];

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return <label className="block rounded-xl border border-slate-200 bg-white p-3">
    <span className="mb-1.5 flex items-center justify-between text-xs font-extrabold text-slate-600">
      <span>{label}</span>
      <bdi dir="ltr" className="rounded-md bg-teal-50 px-2 py-0.5 text-teal-700">{value}</bdi>
    </span>
    <input type="range" min={min} max={max} step={1} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-teal-600" dir="ltr" aria-label={label} />
  </label>;
}

function BalanceTab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(-5);
  const [c, setC] = useState(1);
  const [x, setX] = useState(3);

  const check = checkLinearSolution(frac(a), frac(b), frac(c), frac(x));
  const lhsVal = Number(check.lhs.num);
  const rhsVal = Number(check.rhs.num);
  const eqTeX = `${linearToTeX(frac(a), frac(b))} = ${c}`;

  return <div className="space-y-5" data-eq-balance="true">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Slider label="معامل المتغيّر a" value={a} min={-5} max={6} onChange={setA} />
      <Slider label="الحدّ الثابت b" value={b} min={-12} max={12} onChange={setB} />
      <Slider label="الطرف الأيمن c" value={c} min={-15} max={15} onChange={setC} />
      <Slider label="جرّب قيمة x" value={x} min={-8} max={10} onChange={setX} />
    </div>

    <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
      <div className="justify-self-center">
        <BalanceScaleSvg
          leftLabel={`${lhsVal}`}
          rightLabel={`${rhsVal}`}
          leftVal={lhsVal}
          rightVal={rhsVal}
          caption={check.isSolution ? `توازن تام: ${lhsVal} = ${rhsVal} ← x = ${x} حلّ للمعادلة` : `اختلال: ${lhsVal} ≠ ${rhsVal} ← x = ${x} ليس حلًّا`}
        />
      </div>
      <div role="status" data-eq-balance-result="true" className={`space-y-3 rounded-2xl border p-4 ${check.isSolution ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"}`}>
        <p className="text-xs font-extrabold text-slate-600">المعادلة</p>
        <div className="rounded-xl bg-white p-2.5 text-center" dir="ltr"><TeX tex={eqTeX} block /></div>
        <p className="text-xs font-bold leading-6 text-slate-700">
          التعويض عند <TeX tex={`x = ${x}`} />:
        </p>
        <div className="rounded-xl bg-white p-2.5 text-center" dir="ltr">
          <TeX tex={`${a}(${x}) ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`} = ${lhsVal} \\quad ${check.isSolution ? "=" : "\\neq"} \\quad ${rhsVal}`} block />
        </div>
        <p className={`text-xs font-black ${check.isSolution ? "text-emerald-800" : "text-amber-900"}`}>
          {check.isSolution ? "المساواة صحيحة! إذن هذه القيمة حلّ للمعادلة." : "الطرفان غير متساويين؛ جرّب قيمة أخرى لـ x حتى يستوي الميزان."}
        </p>
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      {[
        { label: "2x - 5 = 1 (x = 3)", v: [2, -5, 1, 3] },
        { label: "2x - 3 = -15 (x = 2)", v: [2, -3, -15, 2] },
        { label: "2x - 3 = -15 (x = -6)", v: [2, -3, -15, -6] },
      ].map(p => <button key={p.label} type="button" onClick={() => { setA(p.v[0]); setB(p.v[1]); setC(p.v[2]); setX(p.v[3]); }} className="rounded-lg border border-teal-200 bg-white px-2.5 py-1 text-xs font-extrabold text-teal-800 hover:bg-teal-50" dir="ltr">{p.label}</button>)}
    </div>
  </div>;
}

function MentalTab() {
  const [b, setB] = useState(11);
  const [c, setC] = useState(-12);
  const sol = solveAdditive(frac(b), frac(c));
  const eqTeX = b >= 0 ? `x + ${b} = ${c}` : `x - ${Math.abs(b)} = ${c}`;
  const stepTeX = b >= 0 ? `x = ${c} - ${b} = ${fracToTeX(sol)}` : `x = ${c} + ${Math.abs(b)} = ${fracToTeX(sol)}`;

  return <div className="space-y-4" data-eq-mental="true">
    <div className="grid gap-3 sm:grid-cols-2">
      <Slider label="العدد b المضاف أو المطروح من x" value={b} min={-20} max={25} onChange={setB} />
      <Slider label="الطرف الأيمن c" value={c} min={-20} max={30} onChange={setC} />
    </div>
    <div role="status" data-eq-mental-result="true" className="space-y-3 rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
      <div className="rounded-xl bg-white p-3 text-center" dir="ltr"><TeX tex={eqTeX} block /></div>
      <p className="text-xs font-bold leading-7 text-slate-700">
        الفكرة الذهنية: نستخدم العملية العكسية — {b >= 0 ? `بما أننا جمعنا ${b} مع x، نطرح ${b} من ${c}.` : `بما أننا طرحنا ${Math.abs(b)} من x، نجمع ${Math.abs(b)} مع ${c}.`}
      </p>
      <div className="rounded-xl border border-emerald-200 bg-white p-3 text-center text-lg font-black" dir="ltr">
        <TeX tex={stepTeX} block />
      </div>
      <p className="text-xs font-bold text-emerald-800">
        التحقّق: <TeX tex={`(${fracToTeX(sol)}) ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`} = ${c}`} /> ✓
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      {[
        { label: "x + 25 = 27", b: 25, c: 27 },
        { label: "x + 11 = -12", b: 11, c: -12 },
        { label: "x - 15 = -11", b: -15, c: -11 },
        { label: "x + 7 = 10", b: 7, c: 10 },
      ].map(p => <button key={p.label} type="button" onClick={() => { setB(p.b); setC(p.c); }} className="rounded-lg border border-teal-200 bg-white px-2.5 py-1 text-xs font-extrabold text-teal-800 hover:bg-teal-50" dir="ltr">{p.label}</button>)}
    </div>
  </div>;
}

function AxcTab() {
  const [aNum, setANum] = useState(3);
  const [aDen, setADen] = useState(1);
  const [c, setC] = useState(24);

  const aFrac = frac(aNum, aDen);
  const cFrac = frac(c, 1);
  const solved = solveMultiplicative(aFrac, cFrac);
  const eqTeX = `${fracToTeX(aFrac)}x = ${c}`;

  return <div className="space-y-4" data-eq-axc="true">
    <div className="grid gap-3 sm:grid-cols-3">
      <Slider label="بسط معامل x" value={aNum} min={-7} max={7} onChange={setANum} />
      <Slider label="مقام معامل x" value={aDen} min={1} max={5} onChange={setADen} />
      <Slider label="الطرف الأيمن c" value={c} min={-25} max={63} onChange={setC} />
    </div>

    <div role="status" data-eq-axc-result="true" className="space-y-3 rounded-2xl border border-violet-200 bg-violet-50/50 p-4">
      <div className="rounded-xl bg-white p-3 text-center text-lg" dir="ltr"><TeX tex={eqTeX} block /></div>
      {solved.status === "unique" ? (
        <>
          <div className="rounded-xl bg-white p-3 text-center" dir="ltr">
            <TeX tex={`x = ${c} \\div \\left(${fracToTeX(aFrac)}\\right) = ${formatSolutionTeX(solved.value)}`} block />
          </div>
          <p className="text-xs font-bold text-emerald-800">
            التحقّق: <TeX tex={`\\left(${fracToTeX(aFrac)}\\right)\\cdot\\left(${fracToTeX(solved.value)}\\right) = ${c}`} /> ✓
          </p>
        </>
      ) : (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-extrabold leading-7 text-rose-900">
          تنبيه مهم (حالة حدّية <TeX tex="a = 0" />): {solved.reason}
        </div>
      )}
    </div>

    <div className="flex flex-wrap gap-2">
      {[
        { label: "3x = 24", n: 3, d: 1, c: 24 },
        { label: "7x = 63", n: 7, d: 1, c: 63 },
        { label: "-5x = 15", n: -5, d: 1, c: 15 },
        { label: "(2/5)x = -5", n: 2, d: 5, c: -5 },
        { label: "-2x = -5", n: -2, d: 1, c: -5 },
        { label: "0x = 5 (حالة حدّية)", n: 0, d: 1, c: 5 },
      ].map(p => <button key={p.label} type="button" onClick={() => { setANum(p.n); setADen(p.d); setC(p.c); }} className="rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-xs font-extrabold text-violet-800 hover:bg-violet-50">{p.label}</button>)}
    </div>
  </div>;
}

function ProblemsTab() {
  const [volume, setVolume] = useState(200);
  const [baseArea, setBaseArea] = useState(40);
  const height = solveMultiplicative(frac(baseArea), frac(volume));

  return <div className="space-y-4" data-eq-problems="true">
    <p className="text-xs font-bold leading-7 text-slate-600">
      خزان ماء شكله متوازي مستطيلات حجمه <TeX tex="V = S_b \cdot h" />. غيّر الحجم <TeX tex="V" /> ومساحة القاعدة <TeX tex="S_b" /> لتشاهد كيف تتحول المسألة إلى معادلة من الشكل <TeX tex="ax = c" /> ثم تُحلّ بالقسمة.
    </p>
    <div className="grid gap-3 sm:grid-cols-2">
      <Slider label="الحجم V (بوحدة dm³)" value={volume} min={40} max={400} onChange={setVolume} />
      <Slider label="مساحة القاعدة Sb (بوحدة dm²)" value={baseArea} min={10} max={80} onChange={setBaseArea} />
    </div>
    <div role="status" data-eq-problem-result="true" className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4 space-y-2">
      <div className="rounded-xl bg-white p-3 text-center" dir="ltr">
        <TeX tex={`${baseArea} \\cdot h = ${volume} \\quad \\Longrightarrow \\quad h = \\frac{${volume}}{${baseArea}} = ${height.status === "unique" ? formatSolutionTeX(height.value) : "—"}`} block />
      </div>
      <p className="text-xs font-bold text-sky-900">
        الارتفاع <TeX tex={`h = ${height.status === "unique" ? formatSolutionTeX(height.value) : "—"}`} /> بوحدة <bdi dir="ltr">dm</bdi>.
      </p>
    </div>
  </div>;
}

export default function EquationsStudio({ mode = "full" }: { mode?: EquationsStudioMode }) {
  const [tab, setTab] = useState<EquationsStudioTab>(mode === "full" ? "balance" : mode);
  const uid = useId();
  const iconFor = (value: EquationsStudioTab) => value === "balance" ? <Scale size={15} /> : value === "mental" ? <Sparkles size={15} /> : value === "axc" ? <Divide size={15} /> : <Calculator size={15} />;

  return <section data-equations-studio="true" className="overflow-hidden rounded-[26px] border border-teal-200 bg-white shadow-[0_14px_40px_-28px_rgba(15,118,110,.28)]">
    <header className="border-b border-teal-100 bg-gradient-to-l from-teal-50/80 via-white to-violet-50/50 px-6 py-5">
      <span className="text-[11px] font-extrabold text-teal-700">مختبر حلّ المعادلات</span>
      <h3 className="mt-1 text-lg font-black text-ink">اختبر توازن المعادلة، حلّ ذهنيًا، وطبّق قاعدة ax = c</h3>
      <p className="mt-1 text-xs leading-6 text-slate-500">المعادلة ميزان: الحلّ الصحيح وحده يجعل الطرف الأيسر مساويًا للطرف الأيمن.</p>
      {mode === "full" && <div role="tablist" aria-label="أدوات مختبر حلّ المعادلات" className="mt-4 flex flex-wrap gap-2">
        {TABS.map(item => {
          const active = item.id === tab;
          return <button key={item.id} id={`${uid}-tab-${item.id}`} type="button" role="tab" aria-selected={active} aria-controls={`${uid}-panel`} onClick={() => setTab(item.id)} className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${active ? "border-teal-600 bg-teal-600 text-white" : "border-teal-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-900"}`}>{iconFor(item.id)}<span>{item.label}</span></button>;
        })}
      </div>}
    </header>
    <div id={`${uid}-panel`} role="tabpanel" className="p-6">
      {tab === "balance" && <BalanceTab />}
      {tab === "mental" && <MentalTab />}
      {tab === "axc" && <AxcTab />}
      {tab === "problems" && <ProblemsTab />}
    </div>
  </section>;
}
