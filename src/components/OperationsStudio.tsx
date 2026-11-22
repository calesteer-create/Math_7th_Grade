"use client";

import { useId, useState } from "react";
import { ArrowLeftRight, Calculator, Ruler, Sparkles, TrendingUp } from "lucide-react";
import TeX from "@/components/TeX";
import {
  OPERATION_LABELS,
  applyOperation,
  decimalOperationText,
  decimalToFraction,
  exactDecimalText,
  normalizeFraction,
  operationSteps,
  powerOfTenText,
  toScientific,
  type RationalOperation,
} from "@/lib/operations-rational";
import { fractionTeX, type Fraction } from "@/lib/rational-numbers";

export type OperationsStudioTab = "sci" | "power" | "frac" | "decimal";

const TABS: { id: OperationsStudioTab; label: string }[] = [
  { id: "sci", label: "الترميز العلمي" },
  { id: "power", label: "قوى العشرة" },
  { id: "frac", label: "العمليات الأربع" },
  { id: "decimal", label: "الفاصلة العشرية" },
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block rounded-xl border border-slate-200 bg-white p-3">
    <span className="mb-1.5 block text-xs font-extrabold text-slate-600">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-[10px] font-semibold leading-5 text-slate-400">{hint}</span>}
  </label>;
}

function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <Field label={label}>
    <div className="flex items-center gap-3">
      <input type="range" min={min} max={max} value={value} onChange={event => onChange(Number(event.target.value))} className="w-full accent-violet-600" dir="ltr" aria-label={label} />
      <bdi dir="ltr" className="min-w-8 rounded-md bg-violet-50 px-2 py-0.5 text-center text-xs font-black text-violet-700">{value}</bdi>
    </div>
  </Field>;
}

// ————— 1) الترميز العلمي —————
function ScientificTab() {
  const [text, setText] = useState("31500000");
  const result = toScientific(text);
  const presets = ["31500000", "150000000", "78000000", "629500000000", "852000000"];
  return <div className="space-y-5" data-studio-sci="true">
    <div className="flex flex-wrap gap-2">
      {presets.map(value => <button key={value} type="button" onClick={() => setText(value)} className="rounded-lg border border-violet-200 bg-violet-50/70 px-2.5 py-1 text-xs font-extrabold text-violet-800" dir="ltr">{value}</button>)}
    </div>
    <Field label="اكتب عددًا كبيرًا بالأرقام الإنجليزية" hint="يُقبل حتى 15 رقمًا، مع أو بدون فواصل الآلاف.">
      <input value={text} onChange={event => setText(event.target.value)} dir="ltr" inputMode="numeric" aria-label="عدد للتحويل إلى الترميز العلمي" className="input w-full max-w-md text-left tabular-nums" />
    </Field>

    {result ? <div role="status" data-sci-result="true" className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-extrabold text-emerald-700">الكتابة بالترميز العلمي</span>
        <div className="rounded-xl bg-white px-5 py-2 text-xl font-black text-emerald-900" dir="ltr"><TeX tex={result.tex} /></div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-3 text-center"><p className="text-[10px] font-bold text-slate-500">العامل</p><p className="mt-1 font-black text-slate-800" dir="ltr">{result.coefficient}</p></div>
        <div className="rounded-xl bg-white p-3 text-center"><p className="text-[10px] font-bold text-slate-500">قوة العشرة</p><p className="mt-1 font-black text-slate-800" dir="ltr">10^{result.exponent}</p></div>
        <div className="rounded-xl bg-white p-3 text-center"><p className="text-[10px] font-bold text-slate-500">عدد المنازل المُزاحة</p><p className="mt-1 font-black text-slate-800" dir="ltr">{result.shifted}</p></div>
      </div>
      <p className="text-xs font-bold leading-7 text-emerald-900">
        {result.coefficient === "0"
          ? "الصفر لا يحتاج إزاحة؛ نكتبه 0."
          : result.exponent >= 0
            ? `أزحنا الفاصلة ${result.exponent} منازل نحو اليسار حتى صار العامل بين 1 و10؛ ولهذا الأس موجب.`
            : `العدد أصغر من 1، فنُزيح الفاصلة ${Math.abs(result.exponent)} منازل نحو اليمين؛ ولهذا الأس سالب.`}
        {" "}العامل دائمًا يحقق <bdi dir="ltr">1 ≤ |العامل| &lt; 10</bdi>.
      </p>
    </div> : <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">اكتب عددًا صالحًا بالأرقام، مثل <bdi dir="ltr">31500000</bdi>.</p>}

    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] font-bold leading-6 text-slate-600">
      <p>تذكّر: <bdi dir="ltr"><TeX tex="3.15\times10^{7}" /></bdi> ليست 3.15 × 7، بل 3.15 × 10,000,000. الأس يعدّ منازل الفاصلة، لا عدد الأصفار وحدها.</p>
    </div>
  </div>;
}

// ————— 2) قوى العشرة —————
function PowerTab() {
  const [exponent, setExponent] = useState(3);
  const value = powerOfTenText(exponent);
  return <div className="space-y-5" data-studio-power="true">
    <div className="grid gap-4 sm:grid-cols-2">
      <Slider label="أس العشرة n" value={exponent} min={0} max={12} onChange={setExponent} />
      <Slider label="أو أس سالب" value={-exponent} min={-12} max={0} onChange={setExponent} />
    </div>
    <div role="status" data-power-result="true" className="rounded-2xl border border-sky-200 bg-sky-50/60 p-5 text-center">
      <div className="text-xl font-black text-sky-900" dir="ltr"><TeX tex={`10^{${exponent}}=${value}`} /></div>
      <p className="mt-2 text-xs font-bold leading-7 text-slate-600">
        {exponent >= 0
          ? <>ضرب عدد في <bdi dir="ltr"><TeX tex={`10^{${exponent}}`} /></bdi> يزيح الفاصلة <bdi dir="ltr" className="font-black">{exponent}</bdi> منازل نحو اليمين (يكبّر العدد).</>
          : <>ضرب عدد في <bdi dir="ltr"><TeX tex={`10^{${exponent}}`} /></bdi> يزيح الفاصلة <bdi dir="ltr" className="font-black">{Math.abs(exponent)}</bdi> منازل نحو اليسار (يصغّر العدد).</>}
      </p>
    </div>
    <div className="grid gap-2 sm:grid-cols-3">
      {[2, 3, 6, 8, 9, 12].map(power => <div key={power} className="rounded-xl border border-slate-200 bg-white p-2 text-center text-xs font-bold text-slate-600"><bdi dir="ltr"><TeX tex={`10^{${power}}=${powerOfTenText(power)}`} /></bdi></div>)}
    </div>
    <p className="rounded-xl bg-amber-50 p-3 text-[11px] font-bold leading-6 text-amber-900">في الترميز العلمي نحتاج القوة المناسبة فقط: نقل الفاصلة منزلتين يعني <bdi dir="ltr"><TeX tex="10^{2}=100" /></bdi>، وثلاث منازل تعني <bdi dir="ltr"><TeX tex="10^{3}=1000" /></bdi>.</p>
  </div>;
}

// ————— 3) العمليات الأربع على الكسور —————
function FractionTab() {
  const [left, setLeft] = useState<Fraction>({ numerator: -15, denominator: 11 });
  const [right, setRight] = useState<Fraction>({ numerator: 16, denominator: 11 });
  const [operation, setOperation] = useState<RationalOperation>("add");
  let result: Fraction | null = null;
  let error = "";
  try { result = applyOperation(left, right, operation); } catch (cause) { error = cause instanceof Error ? cause.message : "عملية غير صالحة."; }
  const steps = error ? [] : operationSteps(left, right, operation);
  return <div className="space-y-5" data-studio-frac="true">
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
        <p className="mb-2 text-xs font-extrabold text-rose-800">الكسر الأول</p>
        <Slider label="البسط" value={left.numerator} min={-24} max={24} onChange={value => setLeft({ ...left, numerator: value })} />
        <div className="mt-2"><Slider label="المقام" value={left.denominator} min={1} max={12} onChange={value => setLeft({ ...left, denominator: value })} /></div>
      </div>
      <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
        <p className="mb-2 text-xs font-extrabold text-sky-800">الكسر الثاني</p>
        <Slider label="البسط" value={right.numerator} min={-24} max={24} onChange={value => setRight({ ...right, numerator: value })} />
        <div className="mt-2"><Slider label="المقام" value={right.denominator} min={1} max={12} onChange={value => setRight({ ...right, denominator: value })} /></div>
      </div>
    </div>

    <div role="group" aria-label="اختر العملية" className="flex flex-wrap gap-2">
      {(Object.keys(OPERATION_LABELS) as RationalOperation[]).map(key => <button key={key} type="button" aria-pressed={operation === key} onClick={() => setOperation(key)} className={`rounded-xl border px-4 py-2 text-xs font-extrabold transition ${operation === key ? "border-violet-600 bg-violet-600 text-white" : "border-violet-200 bg-white text-slate-600 hover:border-violet-400"}`}>{OPERATION_LABELS[key]}</button>)}
    </div>

    {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">{error}</p> : <div role="status" data-frac-result="true" className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex flex-wrap items-center justify-center gap-3 text-lg font-black text-emerald-950" dir="ltr">
        <TeX tex={fractionTeX(normalizeFraction(left))} />
        <TeX tex={operation === "add" ? "+" : operation === "sub" ? "-" : operation === "mul" ? "\\times" : "\\div"} />
        <TeX tex={fractionTeX(normalizeFraction(right))} />
        <TeX tex="=" />
        <span className="rounded-lg bg-white px-3 py-1"><TeX tex={fractionTeX(result!)} /></span>
      </div>
      <p className="mt-2 text-center text-[11px] font-bold text-slate-600">الناتج بأبسط صورة، والمقام موجب دائمًا{fractionTeX(result!) === fractionTeX({ numerator: result!.numerator, denominator: 1 }) ? "؛ وقد اختزل إلى عدد صحيح." : "."}</p>
    </div>}

    {steps.length > 0 && <ol className="space-y-2">{steps.map((step, index) => <li key={index} className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-start gap-2"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-violet-100 text-[11px] font-black text-violet-700" dir="ltr">{index + 1}</span>
        <div className="min-w-0 flex-1"><p className="text-xs font-extrabold text-ink">{step.title}</p><p className="mt-1 text-[11px] leading-6 text-slate-600">{step.text}</p>
          {step.formula && <div className="mt-2 overflow-x-auto rounded-lg bg-slate-50 px-3 py-2 text-sm" dir="ltr"><TeX tex={step.formula} /></div>}
        </div></div>
    </li>)}</ol>}

    <div className="rounded-xl bg-amber-50 p-3 text-[11px] font-bold leading-6 text-amber-900">قاعدة الإشارة: كسر بمقام سالب نُحوّله إلى مقام موجب بتغيير إشارة البسط، وكسر سالب في القسمة نقلب بسطه ومقامه معًا.</div>
  </div>;
}

// ————— 4) الفاصلة العشرية —————
function DecimalTab() {
  const [left, setLeft] = useState("−124.45");
  const [right, setRight] = useState("200.796");
  const [operation, setOperation] = useState<RationalOperation>("add");
  const a = decimalToFraction(left);
  const b = decimalToFraction(right);
  let resultText = "";
  let resultFraction: Fraction | null = null;
  let error = "";
  try {
    if (!a || !b) throw new Error("اكتب عددين عشريين صالحين بالفاصلة الإنجليزية.");
    const exact = operation === "add" || operation === "sub" ? decimalOperationText(left, right, operation) : null;
    resultFraction = applyOperation(a, b, operation);
    resultText = exact?.text ?? exactDecimalText(resultFraction) ?? "";
  } catch (cause) { error = cause instanceof Error ? cause.message : "عملية غير صالحة."; }
  return <div className="space-y-5" data-studio-decimal="true">
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="العدد الأول" hint="مثال: -124.45"><input value={left} onChange={event => setLeft(event.target.value)} dir="ltr" inputMode="decimal" aria-label="العدد العشري الأول" className="input w-full text-left tabular-nums" /></Field>
      <Field label="العدد الثاني" hint="مثال: 200.796"><input value={right} onChange={event => setRight(event.target.value)} dir="ltr" inputMode="decimal" aria-label="العدد العشري الثاني" className="input w-full text-left tabular-nums" /></Field>
    </div>
    <div role="group" aria-label="اختر العملية العشرية" className="flex flex-wrap gap-2">
      {(["add", "sub", "mul", "div"] as RationalOperation[]).map(key => <button key={key} type="button" aria-pressed={operation === key} onClick={() => setOperation(key)} className={`rounded-xl border px-4 py-2 text-xs font-extrabold transition ${operation === key ? "border-teal-600 bg-teal-600 text-white" : "border-teal-200 bg-white text-slate-600 hover:border-teal-400"}`}>{OPERATION_LABELS[key]}</button>)}
    </div>
    {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">{error}</p> : <div role="status" data-decimal-result="true" className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4">
      <div className="flex flex-wrap items-center justify-center gap-2 text-lg font-black text-teal-950" dir="ltr">
        <span dir="ltr">{left.replace(/[−–—]/g, "-")}</span>
        <TeX tex={operation === "add" ? "+" : operation === "sub" ? "-" : operation === "mul" ? "\\times" : "\\div"} />
        <span dir="ltr">{right.replace(/[−–—]/g, "-")}</span>
        <TeX tex="=" />
        <span className="rounded-lg bg-white px-3 py-1" dir="ltr">{resultText || <TeX tex={resultFraction ? fractionTeX(resultFraction) : "?"} />}</span>
      </div>
      <p className="mt-2 text-center text-[11px] font-bold leading-6 text-slate-600">
        {operation === "mul" ? "في الضرب نضرب الأرقام دون فاصلة ثم نضع في الناتج عددًا من المنازل يساوي مجموع منازل العددين." : operation === "div" ? "في القسمة على عدد عشري نضرب المقسوم والمقسوم عليه في القوة نفسها من العشرة حتى يصبح المقسوم عليه صحيحًا." : "في الجمع والطرح نُحاذي الفاصلتين تحت بعضهما، فتكون المنازل من النوع نفسه."}
        {resultFraction && !resultText && " الناتج هنا كسر عشري لا ينتهي، فنكتبه كسرًا عاديًا مضبوطًا بدل التقريب."}
      </p>
    </div>}
    <div className="grid gap-2 sm:grid-cols-2">
      {[{ l: "12.3 - 15.7", v: "-3.4" }, { l: "-124.45 + 200.796", v: "76.346" }, { l: "-0.0045 - 12.039", v: "-12.0435" }, { l: "(-9.775)\\div(+2.3)", v: "-4.25" }].map(item => <button key={item.l} type="button" onClick={() => {
        if (item.l.includes("+")) { const [x, y] = item.l.split(" + "); setLeft(x); setRight(y); setOperation("add"); }
        else if (item.l.includes("÷")) { const [x, y] = item.l.replace("(", "").replace(")", "").split("\\div"); setLeft(x); setRight(y); setOperation("div"); }
        else { const [x, y] = item.l.split(" - "); setLeft(x); setRight(y); setOperation("sub"); }
      }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-bold text-slate-600 hover:border-teal-300"><bdi dir="ltr">{item.l}</bdi> <span className="text-teal-700">= <bdi dir="ltr">{item.v}</bdi></span></button>)}
    </div>
  </div>;
}

export default function OperationsStudio({ mode = "full" }: { mode?: "full" | OperationsStudioTab }) {
  const [tab, setTab] = useState<OperationsStudioTab>(mode === "full" ? "sci" : mode);
  const uid = useId();
  const iconFor = (value: OperationsStudioTab) => value === "sci" ? <Sparkles size={15} /> : value === "power" ? <TrendingUp size={15} /> : value === "frac" ? <Calculator size={15} /> : <Ruler size={15} />;
  return <section data-operations-studio="true" className="overflow-hidden rounded-[26px] border border-violet-200 bg-white shadow-[0_14px_40px_-28px_rgba(37,24,104,.28)]">
    <header className="border-b border-violet-100 bg-gradient-to-l from-violet-50/80 via-white to-amber-50/50 px-6 py-5">
      <span className="text-[11px] font-extrabold text-violet-700">مختبر العمليات على الأعداد العادية</span>
      <h3 className="mt-1 text-lg font-black text-ink">جرّب الترميز العلمي والعمليات الأربع بيدك</h3>
      <p className="mt-1 text-xs leading-6 text-slate-500">غيّر الأعداد، بدّل العملية، وشاهد الناتج وسبب كل خطوة قبل أن تحفظ القاعدة.</p>
      {mode === "full" && <div role="tablist" aria-label="أدوات مختبر العمليات" className="mt-4 flex flex-wrap gap-2">
        {TABS.map(item => {
          const active = item.id === tab;
          return <button key={item.id} id={`${uid}-tab-${item.id}`} type="button" role="tab" aria-selected={active} aria-controls={`${uid}-panel`} onClick={() => setTab(item.id)} className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold transition ${active ? "border-violet-600 bg-violet-600 text-white" : "border-violet-200 bg-white text-slate-600 hover:border-violet-400 hover:text-violet-900"}`}>{iconFor(item.id)}<span>{item.label}</span></button>;
        })}
      </div>}
    </header>
    <div id={`${uid}-panel`} role="tabpanel" className="p-6">
      {tab === "sci" && <ScientificTab />}
      {tab === "power" && <PowerTab />}
      {tab === "frac" && <FractionTab />}
      {tab === "decimal" && <DecimalTab />}
    </div>
  </section>;
}
